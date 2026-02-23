import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import { Construct } from 'constructs';
import { MoodleConfig } from '../config';

export interface CacheProps {
  vpc: ec2.IVpc;
  cacheSecurityGroup: ec2.ISecurityGroup;
  config: MoodleConfig;
}

export class Cache extends Construct {
  public readonly sessionCacheEndpoint: string;
  public readonly mucCacheEndpoint: string;

  constructor(scope: Construct, id: string, props: CacheProps) {
    super(scope, id);

    const { vpc, cacheSecurityGroup, config } = props;

    // Get private subnet IDs for cluster placement
    const privateSubnetIds = vpc.selectSubnets({
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    }).subnetIds;

    const securityGroupIds = [cacheSecurityGroup.securityGroupId];

    const cacheUsageLimits: elasticache.CfnServerlessCache.CacheUsageLimitsProperty = {
      ecpuPerSecond: { maximum: config.maxEcpu },
      dataStorage: { maximum: config.maxCacheDataGb, unit: 'GB' },
    };

    // --- Session cache cluster ---
    const sessionCache = new elasticache.CfnServerlessCache(this, 'SessionCache', {
      serverlessCacheName: `moodle-${config.environment}-sessions`,
      engine: 'valkey',
      cacheUsageLimits,
      securityGroupIds,
      subnetIds: privateSubnetIds,
      description: 'ElastiCache Serverless cluster for Moodle session management',
    });

    // --- MUC (application cache) cluster ---
    const mucCache = new elasticache.CfnServerlessCache(this, 'MucCache', {
      serverlessCacheName: `moodle-${config.environment}-muc`,
      engine: 'valkey',
      cacheUsageLimits,
      securityGroupIds,
      subnetIds: privateSubnetIds,
      description: 'ElastiCache Serverless cluster for Moodle Universal Cache (MUC)',
    });

    // Export endpoints (address:port format for Moodle config)
    this.sessionCacheEndpoint = `${sessionCache.attrEndpointAddress}:${sessionCache.attrEndpointPort}`;
    this.mucCacheEndpoint = `${mucCache.attrEndpointAddress}:${mucCache.attrEndpointPort}`;
  }
}
