import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MoodleConfig } from './config';
import { Networking } from './constructs/networking';
import { Security } from './constructs/security';
import { Database } from './constructs/database';
import { Cache } from './constructs/cache';
import { Storage } from './constructs/storage';
import { LoadBalancer } from './constructs/loadbalancer';
import { Compute } from './constructs/compute';
import { Cdn } from './constructs/cdn';
import { Monitoring } from './constructs/monitoring';

export interface MoodleStackProps extends cdk.StackProps {
  /** Parameterized configuration for all infrastructure components */
  readonly config: MoodleConfig;
  /** WAF WebACL ARN from the WafStack (deployed in us-east-1) */
  readonly wafWebAclArn: string;
  /** ACM certificate ARN in the same region as the ALB for HTTPS termination */
  readonly albCertificateArn: string;
  /** ACM certificate ARN in us-east-1 for CloudFront HTTPS */
  readonly cloudfrontCertificateArn: string;
}

/**
 * Main orchestrating stack for the Moodle LMS infrastructure.
 *
 * Instantiates all constructs in dependency order and wires cross-construct
 * references (VPC, security groups, secrets, endpoints, target groups).
 */
export class MoodleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MoodleStackProps) {
    super(scope, id, props);

    const { config, wafWebAclArn, albCertificateArn, cloudfrontCertificateArn } = props;

    // --- 1. Networking (VPC, security groups) ---
    const networking = new Networking(this, 'Networking');

    // --- 2. Security (KMS keys, secrets) ---
    const security = new Security(this, 'Security', { config });

    // --- 3. Database (Aurora — needs VPC, SG, KMS key) ---
    const database = new Database(this, 'Database', {
      vpc: networking.vpc,
      dbSecurityGroup: networking.dbSecurityGroup,
      kmsKey: security.kmsKeys.aurora,
      config,
    });

    // --- 4. Cache (ElastiCache — needs VPC, SG) ---
    const cache = new Cache(this, 'Cache', {
      vpc: networking.vpc,
      cacheSecurityGroup: networking.cacheSecurityGroup,
      config,
    });

    // --- 5. Storage (EFS — needs VPC, SG, KMS key) ---
    const storage = new Storage(this, 'Storage', {
      vpc: networking.vpc,
      efsSecurityGroup: networking.efsSecurityGroup,
      kmsKey: security.kmsKeys.efs,
    });

    // --- 6. Load Balancer (ALB — needs VPC, SG, cert ARN) ---
    const loadBalancer = new LoadBalancer(this, 'LoadBalancer', {
      vpc: networking.vpc,
      albSecurityGroup: networking.albSecurityGroup,
      certificateArn: albCertificateArn,
      config,
    });

    // --- 7. Compute (ECS — needs VPC, SG, EFS, secrets, target group) ---
    const compute = new Compute(this, 'Compute', {
      vpc: networking.vpc,
      ecsSecurityGroup: networking.ecsSecurityGroup,
      fileSystem: storage.fileSystem,
      accessPoints: storage.accessPoints,
      dbSecret: database.secret,
      cacheEndpoints: {
        session: cache.sessionCacheEndpoint,
        muc: cache.mucCacheEndpoint,
      },
      albTargetGroup: loadBalancer.targetGroup,
      config,
    });

    // --- 8. CDN (CloudFront — needs ALB, WAF ARN, cert ARN) ---
    const cdn = new Cdn(this, 'Cdn', {
      alb: loadBalancer.alb,
      wafWebAclArn,
      certificateArn: cloudfrontCertificateArn,
      config,
    });

    // --- 9. Monitoring (CloudWatch — needs ECS service, Aurora cluster, ALB) ---
    const monitoring = new Monitoring(this, 'Monitoring', {
      service: compute.service,
      cluster: database.cluster,
      alb: loadBalancer.alb,
      ecsClusterName: `moodle-${config.environment}`,
      config,
    });

    // --- Cost-allocation tags ---
    for (const [key, value] of Object.entries(config.costAllocationTags)) {
      cdk.Tags.of(this).add(key, value);
    }

    // --- CloudFormation Outputs ---
    new cdk.CfnOutput(this, 'CloudFrontDomainName', {
      value: cdn.distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
    });

    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: loadBalancer.alb.loadBalancerDnsName,
      description: 'ALB DNS name',
    });

    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: compute.repository.repositoryUri,
      description: 'ECR repository URI for Moodle Docker image',
    });

    new cdk.CfnOutput(this, 'AuroraClusterEndpoint', {
      value: database.cluster.clusterEndpoint.hostname,
      description: 'Aurora writer endpoint',
    });

    new cdk.CfnOutput(this, 'SessionCacheEndpoint', {
      value: cache.sessionCacheEndpoint,
      description: 'ElastiCache session endpoint',
    });

    new cdk.CfnOutput(this, 'MucCacheEndpoint', {
      value: cache.mucCacheEndpoint,
      description: 'ElastiCache MUC endpoint',
    });
  }
}
