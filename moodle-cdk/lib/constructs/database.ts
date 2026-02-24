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

    // --- Cluster parameter group for Moodle compatibility ---
    const parameterGroup = new rds.ParameterGroup(this, 'ClusterParameterGroup', {
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_3_08_0,
      }),
      description: 'Moodle-optimized Aurora MySQL 8.0 parameters',
      parameters: {
        // Moodle requires utf8mb4 for full Unicode support
        'character_set_server': 'utf8mb4',
        'collation_server': 'utf8mb4_unicode_ci',
        // Ensure InnoDB file-per-table for ROW_FORMAT=Compressed support
        'innodb_file_per_table': '1',
        // Use DYNAMIC as default row format (better for large indexes)
        'innodb_default_row_format': 'dynamic',
        // Increase sort buffer for Moodle's complex queries
        'sort_buffer_size': '2097152',
        // Moodle recommended: disable strict mode for compatibility
        'sql_mode': 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION',
      },
    });

    this.cluster = new rds.DatabaseCluster(this, 'AuroraCluster', {
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_3_08_0,
      }),
      credentials: rds.Credentials.fromGeneratedSecret('moodleadmin', {
        secretName: `moodle-${config.environment}-aurora-credentials`,
      }),
      parameterGroup,
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
