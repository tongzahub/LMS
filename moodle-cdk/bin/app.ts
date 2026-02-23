#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { loadConfig } from '../lib/config';
import { WafStack } from '../lib/waf-stack';
import { MoodleStack } from '../lib/moodle-stack';

const app = new cdk.App();

// Load and validate configuration from cdk.json context
const config = loadConfig(app);

// Resolve AWS account — required for cross-region stack references
const account = process.env.CDK_DEFAULT_ACCOUNT;
if (!account) {
  throw new Error(
    'CDK_DEFAULT_ACCOUNT environment variable is required. ' +
    'Run "aws sts get-caller-identity" to verify your AWS credentials are configured.'
  );
}

// ACM certificate ARNs must be pre-provisioned and passed via CDK context
const albCertificateArn = app.node.tryGetContext('moodle:albCertificateArn');
if (!albCertificateArn) {
  throw new Error(
    'Context value "moodle:albCertificateArn" is required. ' +
    'Provision an ACM certificate in the target region and pass its ARN via -c moodle:albCertificateArn=<arn>'
  );
}

const cloudfrontCertificateArn = app.node.tryGetContext('moodle:cloudfrontCertificateArn');
if (!cloudfrontCertificateArn) {
  throw new Error(
    'Context value "moodle:cloudfrontCertificateArn" is required. ' +
    'Provision an ACM certificate in us-east-1 and pass its ARN via -c moodle:cloudfrontCertificateArn=<arn>'
  );
}

// --- WAF Stack (must be in us-east-1 for CloudFront association) ---
const wafStack = new WafStack(app, `${config.environment}-MoodleWafStack`, {
  config,
  env: {
    account,
    region: 'us-east-1',
  },
  description: `Moodle WAF WebACL (${config.environment}) — CloudFront association`,
});

// --- Main Moodle Stack (target region) ---
const moodleStack = new MoodleStack(app, `${config.environment}-MoodleStack`, {
  config,
  wafWebAclArn: wafStack.webAclArn,
  albCertificateArn,
  cloudfrontCertificateArn,
  env: {
    account,
    region: config.region,
  },
  description: `Moodle LMS infrastructure (${config.environment})`,
});

// Enforce deployment order: WAF must be deployed before the main stack
moodleStack.addDependency(wafStack);

app.synth();
