import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface NetworkingProps {
  /** Number of Availability Zones (default: 2) */
  maxAzs?: number;
  /** Container port for ECS tasks (default: 8080) */
  containerPort?: number;
}

export class Networking extends Construct {
  public readonly vpc: ec2.Vpc;
  public readonly albSecurityGroup: ec2.SecurityGroup;
  public readonly ecsSecurityGroup: ec2.SecurityGroup;
  public readonly dbSecurityGroup: ec2.SecurityGroup;
  public readonly cacheSecurityGroup: ec2.SecurityGroup;
  public readonly efsSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: NetworkingProps = {}) {
    super(scope, id);

    const maxAzs = props.maxAzs ?? 2;
    const containerPort = props.containerPort ?? 8080;

    // --- VPC with public and private subnets ---
    this.vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs,
      natGateways: maxAzs,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // --- VPC Flow Logs to CloudWatch ---
    const flowLogGroup = new logs.LogGroup(this, 'VpcFlowLogGroup', {
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.vpc.addFlowLog('FlowLog', {
      destination: ec2.FlowLogDestination.toCloudWatchLogs(flowLogGroup),
      trafficType: ec2.FlowLogTrafficType.ALL,
    });

    // --- VPC Endpoints ---
    // Interface endpoints for ECR (required for Fargate 1.4.0+)
    this.vpc.addInterfaceEndpoint('EcrApiEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR,
    });

    this.vpc.addInterfaceEndpoint('EcrDkrEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
    });

    // Gateway endpoint for S3
    this.vpc.addGatewayEndpoint('S3Endpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    });

    // --- Security Groups ---

    // ALB Security Group: accepts HTTP/HTTPS from the internet
    this.albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for the Application Load Balancer',
      allowAllOutbound: true,
    });
    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP from internet',
    );
    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS from internet',
    );

    // ECS Security Group: accepts traffic from ALB on container port
    this.ecsSecurityGroup = new ec2.SecurityGroup(this, 'EcsSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for ECS Fargate tasks',
      allowAllOutbound: true,
    });
    this.ecsSecurityGroup.addIngressRule(
      this.albSecurityGroup,
      ec2.Port.tcp(containerPort),
      'Allow traffic from ALB on container port',
    );

    // Aurora Security Group: accepts MySQL from ECS
    this.dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Aurora database',
      allowAllOutbound: true,
    });
    this.dbSecurityGroup.addIngressRule(
      this.ecsSecurityGroup,
      ec2.Port.tcp(3306),
      'Allow MySQL from ECS tasks',
    );

    // ElastiCache Security Group: accepts Redis from ECS
    this.cacheSecurityGroup = new ec2.SecurityGroup(this, 'CacheSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for ElastiCache',
      allowAllOutbound: true,
    });
    this.cacheSecurityGroup.addIngressRule(
      this.ecsSecurityGroup,
      ec2.Port.tcp(6379),
      'Allow Redis from ECS tasks',
    );

    // EFS Security Group: accepts NFS from ECS
    this.efsSecurityGroup = new ec2.SecurityGroup(this, 'EfsSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for EFS',
      allowAllOutbound: true,
    });
    this.efsSecurityGroup.addIngressRule(
      this.ecsSecurityGroup,
      ec2.Port.tcp(2049),
      'Allow NFS from ECS tasks',
    );
  }
}
