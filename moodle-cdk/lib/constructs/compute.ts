import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as efs from 'aws-cdk-lib/aws-efs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { MoodleConfig } from '../config';

export interface ComputeProps {
  vpc: ec2.IVpc;
  ecsSecurityGroup: ec2.ISecurityGroup;
  fileSystem: efs.IFileSystem;
  accessPoints: Record<string, efs.IAccessPoint>;
  dbSecret: secretsmanager.ISecret;
  cacheEndpoints: {
    session: string;
    muc: string;
  };
  albTargetGroup: elbv2.IApplicationTargetGroup;
  config: MoodleConfig;
}

export class Compute extends Construct {
  public readonly service: ecs.FargateService;
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props: ComputeProps) {
    super(scope, id);

    const {
      vpc,
      ecsSecurityGroup,
      fileSystem,
      accessPoints,
      dbSecret,
      albTargetGroup,
      config,
    } = props;

    // --- ECR Repository ---
    this.repository = new ecr.Repository(this, 'MoodleRepo', {
      repositoryName: `moodle-${config.environment}`,
      imageScanOnPush: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // --- ECS Cluster with Fargate capacity providers ---
    const cluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc,
      clusterName: `moodle-${config.environment}`,
      enableFargateCapacityProviders: true,
    });

    // --- CloudWatch Log Group for container logs ---
    const logGroup = new logs.LogGroup(this, 'MoodleLogGroup', {
      logGroupName: `/ecs/moodle-${config.environment}`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // --- Task Definition ---
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      cpu: config.taskCpu,
      memoryLimitMiB: config.taskMemory,
      family: `moodle-${config.environment}`,
    });

    // EFS volume mounts
    const efsVolumes: Record<string, { name: string; containerPath: string }> = {
      data: { name: 'moodle-data', containerPath: '/var/www/moodle/data' },
      cache: { name: 'moodle-cache', containerPath: '/var/www/moodle/cache' },
      temp: { name: 'moodle-temp', containerPath: '/var/www/moodle/temp' },
    };

    for (const [key, vol] of Object.entries(efsVolumes)) {
      taskDefinition.addVolume({
        name: vol.name,
        efsVolumeConfiguration: {
          fileSystemId: fileSystem.fileSystemId,
          transitEncryption: 'ENABLED',
          authorizationConfig: {
            accessPointId: accessPoints[key].accessPointId,
            iam: 'ENABLED',
          },
        },
      });
    }

    // --- Container Definition ---
    const container = taskDefinition.addContainer('MoodleContainer', {
      image: ecs.ContainerImage.fromEcrRepository(this.repository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: 'moodle',
      }),
      secrets: {
        DB_HOST: ecs.Secret.fromSecretsManager(dbSecret, 'host'),
        DB_PORT: ecs.Secret.fromSecretsManager(dbSecret, 'port'),
        DB_NAME: ecs.Secret.fromSecretsManager(dbSecret, 'dbname'),
        DB_USER: ecs.Secret.fromSecretsManager(dbSecret, 'username'),
        DB_PASS: ecs.Secret.fromSecretsManager(dbSecret, 'password'),
      },
      portMappings: [
        { containerPort: 80, protocol: ecs.Protocol.TCP },
      ],
    });

    // Mount EFS volumes to the container
    for (const vol of Object.values(efsVolumes)) {
      container.addMountPoints({
        sourceVolume: vol.name,
        containerPath: vol.containerPath,
        readOnly: false,
      });
    }

    // Grant the task role read access to the EFS filesystem
    fileSystem.grant(taskDefinition.taskRole, 'elasticfilesystem:ClientMount', 'elasticfilesystem:ClientWrite');

    // --- Fargate Service ---
    const spotWeight = config.spotPercentage;
    const standardWeight = 100 - spotWeight;

    this.service = new ecs.FargateService(this, 'MoodleService', {
      cluster,
      taskDefinition,
      desiredCount: config.minTasks,
      securityGroups: [ecsSecurityGroup],
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      assignPublicIp: false,
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT',
          weight: spotWeight,
        },
        {
          capacityProvider: 'FARGATE',
          weight: standardWeight,
        },
      ],
      circuitBreaker: { rollback: true },
      enableExecuteCommand: true, // SSM Agent for remote access
    });

    // --- Register with ALB Target Group ---
    this.service.attachToApplicationTargetGroup(albTargetGroup);

    // --- Auto-Scaling ---
    const scaling = this.service.autoScaleTaskCount({
      minCapacity: config.minTasks,
      maxCapacity: config.maxTasks,
    });

    scaling.scaleOnCpuUtilization('CpuTargetTracking', {
      targetUtilizationPercent: config.cpuTargetUtilization,
      scaleInCooldown: cdk.Duration.seconds(300),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // --- CloudFormation Output for ECR Repository URI ---
    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: this.repository.repositoryUri,
      description: 'ECR repository URI for Moodle Docker image',
    });
  }
}
