import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { MoodleConfig } from '../config';

export interface SecurityProps {
  config: MoodleConfig;
}

export class Security extends Construct {
  public readonly kmsKeys: Record<string, kms.Key>;
  public readonly secrets: Record<string, secretsmanager.Secret>;

  constructor(scope: Construct, id: string, props: SecurityProps) {
    super(scope, id);

    const { config } = props;

    // --- KMS Keys for encryption at rest ---

    const auroraKey = new kms.Key(this, 'AuroraKmsKey', {
      alias: `moodle-${config.environment}-aurora`,
      description: 'KMS key for Aurora Serverless v2 encryption at rest',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const elasticacheKey = new kms.Key(this, 'ElastiCacheKmsKey', {
      alias: `moodle-${config.environment}-elasticache`,
      description: 'KMS key for ElastiCache encryption at rest',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const efsKey = new kms.Key(this, 'EfsKmsKey', {
      alias: `moodle-${config.environment}-efs`,
      description: 'KMS key for EFS encryption at rest',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    this.kmsKeys = {
      aurora: auroraKey,
      elasticache: elasticacheKey,
      efs: efsKey,
    };

    // --- Secrets Manager entries ---

    const moodleAdminPassword = new secretsmanager.Secret(this, 'MoodleAdminPassword', {
      secretName: `moodle-${config.environment}-admin-password`,
      description: 'Moodle administrator password',
      generateSecretString: {
        excludePunctuation: false,
        includeSpace: false,
        passwordLength: 32,
      },
    });
    // Note: Rotation schedules omitted — these are standalone secrets without
    // an associated database or rotation Lambda. Aurora credentials are managed
    // separately via rds.Credentials.fromGeneratedSecret in the Database construct.

    const moodleDbPassword = new secretsmanager.Secret(this, 'MoodleDbPassword', {
      secretName: `moodle-${config.environment}-db-password`,
      description: 'Moodle database password',
      generateSecretString: {
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 32,
      },
    });

    const moodleApiKey = new secretsmanager.Secret(this, 'MoodleApiKey', {
      secretName: `moodle-${config.environment}-api-key`,
      description: 'Moodle API key for external integrations',
      generateSecretString: {
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 64,
      },
    });

    this.secrets = {
      adminPassword: moodleAdminPassword,
      dbPassword: moodleDbPassword,
      apiKey: moodleApiKey,
    };
  }
}
