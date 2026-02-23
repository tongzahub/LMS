import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { MoodleConfig } from '../config';

export interface LoadBalancerProps {
  vpc: ec2.IVpc;
  albSecurityGroup: ec2.ISecurityGroup;
  /** ACM certificate ARN for HTTPS listener (must be in the same region as the ALB) */
  certificateArn: string;
  config: MoodleConfig;
}

export class LoadBalancer extends Construct {
  public readonly alb: elbv2.ApplicationLoadBalancer;
  public readonly targetGroup: elbv2.ApplicationTargetGroup;

  constructor(scope: Construct, id: string, props: LoadBalancerProps) {
    super(scope, id);

    const { vpc, albSecurityGroup, certificateArn, config } = props;

    // --- Internet-facing ALB in public subnets ---
    this.alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc,
      internetFacing: true,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroup: albSecurityGroup,
    });

    // --- Target group with health check on /login/index.php ---
    this.targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      vpc,
      port: 8080,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: '/login/index.php',
        protocol: elbv2.Protocol.HTTP,
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(10),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        healthyHttpCodes: '200-399',
      },
      deregistrationDelay: cdk.Duration.seconds(60),
    });

    // --- HTTPS listener on port 443 ---
    const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', certificateArn);

    this.alb.addListener('HttpsListener', {
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificates: [certificate],
      defaultTargetGroups: [this.targetGroup],
    });

    // --- HTTP listener on port 80 — redirect to HTTPS ---
    this.alb.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        permanent: true,
      }),
    });

    // --- CloudFormation output for ALB DNS ---
    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: this.alb.loadBalancerDnsName,
      description: 'ALB DNS name',
    });
  }
}
