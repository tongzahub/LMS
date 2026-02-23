import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { MoodleConfig } from '../config';

export interface DatabaseProps {
  vpc: ec2.IVpc;
  dbSecurityGroup: ec2.ISecurityGroup;
  kmsKey: kms.IKey;
  config: MoodleConfig;
}

export class Database extends Construct {
  public readonly cluster: rds.DatabaseCluster;
  public readonly secret: secretsmanager.ISecret;

  constructor(scope: Construct, id: string, props: DatabaseProps) {
    super(scope, id);

    const { vpc, dbSecurityGroup, kmsKey, config } = props;

    this.cluster = new rds.DatabaseCluster(this, 'AuroraCluster', {
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_3_05_2,
      }),
      credentials: rds.Credentials.fromGeneratedSecret('moodleadmin', {
        secretName: `moodle-${config.environment}-aurora-credentials`,
      }),
      serverlessV2MinCapacity: config.minAcu,
      serverlessV2MaxCapacity: config.maxAcu,
      writer: rds.ClusterInstance.serverlessV2('Writer', {
        publiclyAccessible: false,
      }),
      readers: [
        rds.ClusterInstance.serverlessV2('Reader', {
          publiclyAccessible: false,
          scaleWithWriter: true,
        }),
      ],
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [dbSecurityGroup],
      storageEncrypted: true,
      storageEncryptionKey: kmsKey,
      backup: {
        retention: cdk.Duration.days(config.backupRetentionDays),
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      deletionProtection: true,
      defaultDatabaseName: 'moodle',
    });

    this.secret = this.cluster.secret!;
  }
}
