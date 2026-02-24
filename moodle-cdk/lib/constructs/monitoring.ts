import * as cdk from 'aws-cdk-lib';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { MoodleConfig } from '../config';

export interface MonitoringProps {
  service: ecs.FargateService;
  cluster: rds.DatabaseCluster;
  alb: elbv2.ApplicationLoadBalancer;
  ecsClusterName: string;
  config: MoodleConfig;
}

export class Monitoring extends Construct {
  public readonly dashboard: cloudwatch.Dashboard;
  public readonly snsTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: MonitoringProps) {
    super(scope, id);

    const { service, cluster, alb, ecsClusterName, config } = props;

    // --- CloudWatch Log Group for ECS containers ---
    // Note: The compute construct already creates a log group for the ECS service.
    // We create an additional log group here for any auxiliary container logs.
    const logGroup = new logs.LogGroup(this, 'EcsLogGroup', {
      logGroupName: `/moodle/${config.environment}/ecs`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // --- SNS Topic for notifications ---
    this.snsTopic = new sns.Topic(this, 'AlarmTopic', {
      topicName: `moodle-${config.environment}-alarms`,
      displayName: `Moodle ${config.environment} Alarms`,
    });

    // --- CloudWatch Alarms ---

    // ECS CPU utilization > 80%
    const ecsCpuAlarm = new cloudwatch.Alarm(this, 'EcsCpuAlarm', {
      alarmName: `moodle-${config.environment}-ecs-cpu-high`,
      alarmDescription: 'ECS CPU utilization exceeds 80%',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ECS',
        metricName: 'CPUUtilization',
        dimensionsMap: {
          ClusterName: ecsClusterName,
          ServiceName: service.serviceName,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 80,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    ecsCpuAlarm.addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.snsTopic));

    // ECS Memory utilization > 80%
    const ecsMemoryAlarm = new cloudwatch.Alarm(this, 'EcsMemoryAlarm', {
      alarmName: `moodle-${config.environment}-ecs-memory-high`,
      alarmDescription: 'ECS memory utilization exceeds 80%',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ECS',
        metricName: 'MemoryUtilization',
        dimensionsMap: {
          ClusterName: ecsClusterName,
          ServiceName: service.serviceName,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 80,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    ecsMemoryAlarm.addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.snsTopic));

    // ALB target response time > 5 seconds
    const albLatencyAlarm = new cloudwatch.Alarm(this, 'AlbLatencyAlarm', {
      alarmName: `moodle-${config.environment}-alb-latency-high`,
      alarmDescription: 'ALB target response time exceeds 5 seconds',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApplicationELB',
        metricName: 'TargetResponseTime',
        dimensionsMap: {
          LoadBalancer: alb.loadBalancerFullName,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 5,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    albLatencyAlarm.addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.snsTopic));

    // --- CloudTrail with encrypted S3 bucket ---
    const trailBucket = new s3.Bucket(this, 'CloudTrailBucket', {
      bucketName: `moodle-${config.environment}-cloudtrail-${cdk.Aws.ACCOUNT_ID}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(365),
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
      ],
    });

    const trail = new cloudtrail.Trail(this, 'CloudTrail', {
      trailName: `moodle-${config.environment}-trail`,
      bucket: trailBucket,
      isMultiRegionTrail: false,
      includeGlobalServiceEvents: true,
      enableFileValidation: true,
    });

    // --- Aurora Event Subscriptions via SNS ---
    new rds.CfnEventSubscription(this, 'AuroraFailoverSubscription', {
      snsTopicArn: this.snsTopic.topicArn,
      sourceType: 'db-cluster',
      sourceIds: [cluster.clusterIdentifier],
      eventCategories: ['failover'],
      subscriptionName: `moodle-${config.environment}-aurora-failover`,
    });

    new rds.CfnEventSubscription(this, 'AuroraFailureSubscription', {
      snsTopicArn: this.snsTopic.topicArn,
      sourceType: 'db-cluster',
      sourceIds: [cluster.clusterIdentifier],
      eventCategories: ['failure'],
      subscriptionName: `moodle-${config.environment}-aurora-failure`,
    });

    new rds.CfnEventSubscription(this, 'AuroraMaintenanceSubscription', {
      snsTopicArn: this.snsTopic.topicArn,
      sourceType: 'db-cluster',
      sourceIds: [cluster.clusterIdentifier],
      eventCategories: ['maintenance'],
      subscriptionName: `moodle-${config.environment}-aurora-maintenance`,
    });

    new rds.CfnEventSubscription(this, 'AuroraNotificationSubscription', {
      snsTopicArn: this.snsTopic.topicArn,
      sourceType: 'db-cluster',
      sourceIds: [cluster.clusterIdentifier],
      eventCategories: ['notification'],
      subscriptionName: `moodle-${config.environment}-aurora-notification`,
    });

    // --- CloudWatch Dashboard ---
    this.dashboard = new cloudwatch.Dashboard(this, 'MoodleDashboard', {
      dashboardName: `moodle-${config.environment}-dashboard`,
    });

    // ECS Service Metrics
    const ecsCpuMetric = new cloudwatch.Metric({
      namespace: 'AWS/ECS',
      metricName: 'CPUUtilization',
      dimensionsMap: {
        ClusterName: ecsClusterName,
        ServiceName: service.serviceName,
      },
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    const ecsMemoryMetric = new cloudwatch.Metric({
      namespace: 'AWS/ECS',
      metricName: 'MemoryUtilization',
      dimensionsMap: {
        ClusterName: ecsClusterName,
        ServiceName: service.serviceName,
      },
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    // Aurora Cluster Metrics
    const auroraConnectionsMetric = new cloudwatch.Metric({
      namespace: 'AWS/RDS',
      metricName: 'DatabaseConnections',
      dimensionsMap: {
        DBClusterIdentifier: cluster.clusterIdentifier,
      },
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    const auroraCpuMetric = new cloudwatch.Metric({
      namespace: 'AWS/RDS',
      metricName: 'CPUUtilization',
      dimensionsMap: {
        DBClusterIdentifier: cluster.clusterIdentifier,
      },
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    const auroraAcuMetric = new cloudwatch.Metric({
      namespace: 'AWS/RDS',
      metricName: 'ServerlessDatabaseCapacity',
      dimensionsMap: {
        DBClusterIdentifier: cluster.clusterIdentifier,
      },
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    // ALB Metrics
    const albRequestCountMetric = new cloudwatch.Metric({
      namespace: 'AWS/ApplicationELB',
      metricName: 'RequestCount',
      dimensionsMap: {
        LoadBalancer: alb.loadBalancerFullName,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const albResponseTimeMetric = new cloudwatch.Metric({
      namespace: 'AWS/ApplicationELB',
      metricName: 'TargetResponseTime',
      dimensionsMap: {
        LoadBalancer: alb.loadBalancerFullName,
      },
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    const alb5xxMetric = new cloudwatch.Metric({
      namespace: 'AWS/ApplicationELB',
      metricName: 'HTTPCode_Target_5XX_Count',
      dimensionsMap: {
        LoadBalancer: alb.loadBalancerFullName,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    // Add widgets to dashboard
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'ECS CPU Utilization',
        left: [ecsCpuMetric],
        width: 12,
      }),
      new cloudwatch.GraphWidget({
        title: 'ECS Memory Utilization',
        left: [ecsMemoryMetric],
        width: 12,
      }),
    );

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Aurora Database Connections',
        left: [auroraConnectionsMetric],
        width: 8,
      }),
      new cloudwatch.GraphWidget({
        title: 'Aurora CPU Utilization',
        left: [auroraCpuMetric],
        width: 8,
      }),
      new cloudwatch.GraphWidget({
        title: 'Aurora Serverless Capacity (ACU)',
        left: [auroraAcuMetric],
        width: 8,
      }),
    );

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'ALB Request Count',
        left: [albRequestCountMetric],
        width: 8,
      }),
      new cloudwatch.GraphWidget({
        title: 'ALB Target Response Time',
        left: [albResponseTimeMetric],
        width: 8,
      }),
      new cloudwatch.GraphWidget({
        title: 'ALB 5XX Errors',
        left: [alb5xxMetric],
        width: 8,
      }),
    );
  }
}
