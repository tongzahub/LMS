import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { MoodleConfig } from '../config';

export interface CdnProps {
  /** Application Load Balancer used as the CloudFront origin */
  alb: elbv2.IApplicationLoadBalancer;
  /** WAF WebACL ARN (must be in us-east-1) for CloudFront association */
  wafWebAclArn: string;
  /** ACM certificate ARN in us-east-1 for CloudFront HTTPS */
  certificateArn: string;
  config: MoodleConfig;
}

export class Cdn extends Construct {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: CdnProps) {
    super(scope, id);

    const { alb, wafWebAclArn, certificateArn, config } = props;

    // --- ALB origin (HTTPS — ALB port 80 redirects to 443, so we must use HTTPS) ---
    const albOrigin = new origins.LoadBalancerV2Origin(alb, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
      httpsPort: 443,
    });

    // --- ACM certificate (us-east-1) ---
    const certificate = acm.Certificate.fromCertificateArn(this, 'CfCertificate', certificateArn);


    // --- Origin request policy for dynamic content ---
    // Only forward Host header — CloudFront automatically adds X-Forwarded-For,
    // and the ALB adds X-Forwarded-Proto. These are restricted headers in CloudFront
    // origin request policies and cannot be explicitly forwarded.
    const dynamicOriginRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'DynamicOriginRequestPolicy', {
      originRequestPolicyName: `${config.environment}-moodle-dynamic-origin`,
      comment: 'Forward Host header and cookies for Moodle session handling',
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList('Host'),
      cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
    });

    // --- Cache policy for dynamic content (no caching — forward everything to origin) ---
    const dynamicCachePolicy = new cloudfront.CachePolicy(this, 'DynamicCachePolicy', {
      cachePolicyName: `${config.environment}-moodle-dynamic-cache`,
      comment: 'No-cache policy for Moodle dynamic content',
      defaultTtl: cdk.Duration.seconds(0),
      minTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.seconds(0),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
    });

    // --- CloudFront distribution ---
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `Moodle CDN (${config.environment})`,
      domainNames: [config.domainName],
      certificate,
      webAclId: wafWebAclArn,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,

      // Default behavior — dynamic Moodle content (no caching, forward sessions)
      defaultBehavior: {
        origin: albOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        cachePolicy: dynamicCachePolicy,
        originRequestPolicy: dynamicOriginRequestPolicy,
      },


    });

    // --- CloudFormation output ---
    new cdk.CfnOutput(this, 'CloudFrontDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront distribution ID',
    });
  }
}
