import * as cdk from 'aws-cdk-lib';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';
import { MoodleConfig } from './config';

export interface WafStackProps extends cdk.StackProps {
  readonly config: MoodleConfig;
}

/**
 * WAF WebACL stack deployed to us-east-1 for CloudFront association.
 *
 * CloudFront WAFs must reside in us-east-1 regardless of the application region.
 * The WebACL ARN is exported via CfnOutput for cross-region consumption by the
 * MoodleStack's CloudFront distribution.
 */
export class WafStack extends cdk.Stack {
  public readonly webAclArn: string;

  constructor(scope: Construct, id: string, props: WafStackProps) {
    super(scope, id, props);

    const { config } = props;

    const webAcl = new wafv2.CfnWebACL(this, 'CloudFrontWebAcl', {
      defaultAction: { allow: {} },
      scope: 'CLOUDFRONT',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `${config.environment}-moodle-waf`,
        sampledRequestsEnabled: true,
      },
      name: `${config.environment}-moodle-cloudfront-waf`,
      description: `WAF WebACL for Moodle ${config.environment} CloudFront distribution`,
      rules: [
        {
          name: 'AWSManagedRulesCommonRuleSet',
          priority: 1,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesCommonRuleSet',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: `${config.environment}-common-rules`,
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'AWSManagedRulesKnownBadInputsRuleSet',
          priority: 2,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesKnownBadInputsRuleSet',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: `${config.environment}-bad-inputs-rules`,
            sampledRequestsEnabled: true,
          },
        },
      ],
    });

    this.webAclArn = webAcl.attrArn;

    new cdk.CfnOutput(this, 'WebAclArn', {
      value: webAcl.attrArn,
      description: 'WAF WebACL ARN for CloudFront association',
      exportName: `${config.environment}-moodle-waf-acl-arn`,
    });
  }
}
