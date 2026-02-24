import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { MoodleConfig } from '../config';

export interface MediaStorageProps {
  config: MoodleConfig;
}

/**
 * CDK construct for S3-based media storage (videos, course materials).
 *
 * Architecture:
 *   Browser → presigned PUT URL → S3 bucket (encrypted, private)
 *   Browser ← CloudFront (OAC) ← S3 bucket
 *
 * Features:
 *   - KMS encryption at rest with automatic key rotation
 *   - All public access blocked; served exclusively via CloudFront OAC
 *   - CORS configured for direct browser uploads via presigned URLs
 *   - Lifecycle rules: move to IA after 90 days, Glacier after 365 days
 *   - Separate prefixes for videos/, thumbnails/, materials/
 */
export class MediaStorage extends Construct {
  public readonly bucket: s3.Bucket;
  public readonly kmsKey: kms.Key;
  public readonly distribution: cloudfront.Distribution;
  public readonly uploadPolicy: iam.PolicyStatement;

  constructor(scope: Construct, id: string, props: MediaStorageProps) {
    super(scope, id);

    const { config } = props;

    // --- KMS Key for S3 encryption ---
    this.kmsKey = new kms.Key(this, 'MediaKmsKey', {
      alias: `moodle-${config.environment}-media`,
      description: 'KMS key for S3 media bucket encryption',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // --- S3 Bucket ---
    this.bucket = new s3.Bucket(this, 'MediaBucket', {
      bucketName: `ecv-lms-${config.environment}-media-${cdk.Stack.of(this).account}`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: this.kmsKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,

      // CORS for direct browser uploads via presigned URLs
      cors: [
        {
          allowedOrigins: [
            `https://${config.domainName}`,
            'http://localhost:3000',
          ],
          allowedMethods: [
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.GET,
            s3.HttpMethods.HEAD,
          ],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag', 'x-amz-request-id'],
          maxAge: 3600,
        },
      ],

      // Lifecycle rules for cost optimization
      lifecycleRules: [
        {
          id: 'video-lifecycle',
          prefix: 'videos/',
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(90),
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(365),
            },
          ],
        },
        {
          id: 'temp-cleanup',
          prefix: 'temp/',
          expiration: cdk.Duration.days(1),
        },
        {
          id: 'thumbnails-lifecycle',
          prefix: 'thumbnails/',
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(180),
            },
          ],
        },
      ],
    });

    // --- CloudFront Distribution for media delivery ---
    const oac = new cloudfront.S3OriginAccessControl(this, 'MediaOAC', {
      signing: cloudfront.Signing.SIGV4_ALWAYS,
      description: `OAC for ECV LMS media bucket (${config.environment})`,
    });

    this.distribution = new cloudfront.Distribution(this, 'MediaCdn', {
      comment: `ECV LMS Media CDN (${config.environment})`,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket, {
          originAccessControl: oac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        compress: true,
      },
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
    });

    // --- IAM policy for presigned URL generation (used by Next.js BFF) ---
    this.uploadPolicy = new iam.PolicyStatement({
      actions: [
        's3:PutObject',
        's3:GetObject',
        's3:DeleteObject',
        's3:ListBucket',
      ],
      resources: [
        this.bucket.bucketArn,
        `${this.bucket.bucketArn}/*`,
      ],
    });

    // --- Tags ---
    cdk.Tags.of(this).add('Project', 'MoodleLMS');
    cdk.Tags.of(this).add('Environment', config.environment);

    // --- Outputs ---
    new cdk.CfnOutput(this, 'MediaBucketName', {
      value: this.bucket.bucketName,
      description: 'S3 media bucket name',
    });

    new cdk.CfnOutput(this, 'MediaBucketArn', {
      value: this.bucket.bucketArn,
      description: 'S3 media bucket ARN',
    });

    new cdk.CfnOutput(this, 'MediaCdnDomain', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront domain for media delivery',
    });

    new cdk.CfnOutput(this, 'MediaKmsKeyArn', {
      value: this.kmsKey.keyArn,
      description: 'KMS key ARN for media encryption',
    });
  }
}
