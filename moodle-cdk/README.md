# Moodle LMS on AWS — CDK v2 Infrastructure

AWS CDK v2 (TypeScript) project that provisions a production-grade Moodle LMS environment on AWS. The architecture follows the AWS reference pattern: CloudFront + WAF → ALB → ECS Fargate → Aurora Serverless v2 + ElastiCache Serverless + EFS.

## Architecture Overview

```
Users → CloudFront (+ WAF) → ALB (HTTPS) → ECS Fargate Tasks
                                                ├── Aurora Serverless v2 (MySQL)
                                                ├── ElastiCache Serverless (Sessions)
                                                ├── ElastiCache Serverless (MUC)
                                                └── EFS (Moodledata)
```

Two CDK stacks are deployed:

| Stack | Region | Purpose |
|---|---|---|
| `WafStack` | us-east-1 | WAF WebACL for CloudFront (must be in us-east-1) |
| `MoodleStack` | ap-southeast-1 (default) | All other infrastructure |

## Prerequisites

- **Node.js** 18+ and npm
- **AWS CLI** v2, configured with credentials (`aws configure`)
- **AWS CDK** v2 (`npm install -g aws-cdk`)
- **Docker** (for building the Moodle container image)
- **AWS Account** with permissions to create VPC, ECS, Aurora, ElastiCache, EFS, CloudFront, WAF, ACM, Secrets Manager, CloudWatch, CloudTrail, SNS, S3, ECR, and KMS resources

## Pre-Deployment Steps

### 1. Provision ACM Certificates

Two ACM certificates are required before deployment:

**ALB Certificate (target region — ap-southeast-1 by default):**
```bash
aws acm request-certificate \
  --domain-name lms.ecv.co.th \
  --validation-method DNS \
  --region ap-southeast-1
```

**CloudFront Certificate (us-east-1 — required by CloudFront):**
```bash
aws acm request-certificate \
  --domain-name lms.ecv.co.th \
  --validation-method DNS \
  --region us-east-1
```

Validate both certificates via DNS before proceeding. Note the ARNs — you'll pass them as context parameters.

### 2. Configure AWS Credentials

Ensure your AWS credentials are configured and the `CDK_DEFAULT_ACCOUNT` environment variable is available:
```bash
aws sts get-caller-identity
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
```

### 3. Bootstrap CDK (if first time)

```bash
npx cdk bootstrap aws://$CDK_DEFAULT_ACCOUNT/ap-southeast-1
npx cdk bootstrap aws://$CDK_DEFAULT_ACCOUNT/us-east-1
```

## Configuration Parameters

All parameters are configured via `cdk.json` context or CLI `-c` flags.

| Parameter | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `moodle:environment` | string | `production` | — | Environment name (e.g., production, staging) |
| `moodle:region` | string | `ap-southeast-1` | Valid AWS region | Target deployment region |
| `moodle:domainName` | string | `lms.ecv.co.th` | **Required** | Domain name for the Moodle site |
| `moodle:taskCpu` | number | `2048` | 256, 512, 1024, 2048, 4096 | Fargate task CPU units |
| `moodle:taskMemory` | number | `4096` | Must be valid for chosen CPU | Fargate task memory (MiB) |
| `moodle:minTasks` | number | `1` | ≥ 1 | Minimum ECS tasks (auto-scaling) |
| `moodle:maxTasks` | number | `10` | ≥ minTasks | Maximum ECS tasks (auto-scaling) |
| `moodle:cpuTargetUtilization` | number | `50` | 1–100 | CPU target tracking percentage |
| `moodle:spotPercentage` | number | `75` | 0–100 | Fargate Spot capacity percentage |
| `moodle:minAcu` | number | `0.5` | ≥ 0.5 | Aurora minimum ACU |
| `moodle:maxAcu` | number | `10` | ≥ minAcu, ≤ 128 | Aurora maximum ACU |
| `moodle:backupRetentionDays` | number | `7` | 1–35 | Aurora backup retention (days) |
| `moodle:maxEcpu` | number | `100` | — | ElastiCache max ECPU |
| `moodle:maxCacheDataGb` | number | `10` | — | ElastiCache max data storage (GB) |
| `moodle:opcacheMemory` | number | `512` | 128–512 | PHP OPcache memory (MB) |
| `moodle:costAllocationTags` | object | `{Project, Environment, ManagedBy}` | — | Cost-allocation tags applied to all resources |
| `moodle:albCertificateArn` | string | — | **Required** | ACM certificate ARN in target region |
| `moodle:cloudfrontCertificateArn` | string | — | **Required** | ACM certificate ARN in us-east-1 |

### Valid Fargate CPU/Memory Combinations

| CPU (units) | Valid Memory (MiB) |
|---|---|
| 256 | 512, 1024, 2048 |
| 512 | 1024, 2048, 3072, 4096 |
| 1024 | 2048–8192 (1024 increments) |
| 2048 | 4096–16384 (1024 increments) |
| 4096 | 8192–30720 (1024 increments) |

## Deployment

### Install Dependencies

```bash
cd moodle-cdk
npm install
```

### Build the Docker Image and Push to ECR

After the first deployment creates the ECR repository, build and push the Moodle image:

```bash
# Get the ECR repository URI from stack outputs
ECR_URI=$(aws cloudformation describe-stacks \
  --stack-name production-MoodleStack \
  --query "Stacks[0].Outputs[?OutputKey=='EcrRepositoryUri'].OutputValue" \
  --output text --region ap-southeast-1)

# Authenticate Docker with ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin $ECR_URI

# Build and push
docker build -t moodle:latest docker/
docker tag moodle:latest $ECR_URI:latest
docker push $ECR_URI:latest
```

### Deploy All Stacks

Deploy everything in the correct dependency order (WAF first, then main stack):

```bash
npx cdk deploy --all \
  -c moodle:albCertificateArn=arn:aws:acm:ap-southeast-1:ACCOUNT:certificate/CERT-ID \
  -c moodle:cloudfrontCertificateArn=arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID
```

### Deploy Individually

If you prefer to deploy stacks one at a time:

```bash
# 1. WAF stack first (us-east-1)
npx cdk deploy production-MoodleWafStack \
  -c moodle:albCertificateArn=arn:aws:acm:ap-southeast-1:ACCOUNT:certificate/CERT-ID \
  -c moodle:cloudfrontCertificateArn=arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID

# 2. Main stack (ap-southeast-1)
npx cdk deploy production-MoodleStack \
  -c moodle:albCertificateArn=arn:aws:acm:ap-southeast-1:ACCOUNT:certificate/CERT-ID \
  -c moodle:cloudfrontCertificateArn=arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID
```

### Override Configuration via CLI

```bash
npx cdk deploy --all \
  -c moodle:environment=staging \
  -c moodle:minTasks=2 \
  -c moodle:maxTasks=5 \
  -c moodle:maxAcu=4 \
  -c moodle:albCertificateArn=<ARN> \
  -c moodle:cloudfrontCertificateArn=<ARN>
```

## Stack Outputs

After deployment, the following values are exported:

| Output | Stack | Description |
|---|---|---|
| `WebAclArn` | WafStack | WAF WebACL ARN |
| `CloudFrontDomainName` | MoodleStack | CloudFront distribution domain |
| `AlbDnsName` | MoodleStack | ALB DNS name |
| `EcrRepositoryUri` | MoodleStack | ECR repository URI for Docker push |
| `AuroraClusterEndpoint` | MoodleStack | Aurora writer endpoint |
| `SessionCacheEndpoint` | MoodleStack | ElastiCache session cluster endpoint |
| `MucCacheEndpoint` | MoodleStack | ElastiCache MUC cluster endpoint |

Retrieve outputs:
```bash
aws cloudformation describe-stacks \
  --stack-name production-MoodleStack \
  --query "Stacks[0].Outputs" \
  --region ap-southeast-1
```

## Useful Commands

```bash
npx cdk synth          # Synthesize CloudFormation templates
npx cdk diff           # Preview infrastructure changes
npx cdk deploy --all   # Deploy all stacks
npx cdk destroy --all  # Tear down all stacks
npm run build          # Compile TypeScript
npm run test           # Run tests (unit + property-based)
```

## Project Structure

```
moodle-cdk/
├── bin/app.ts                        # CDK app entry point
├── lib/
│   ├── config.ts                     # MoodleConfig interface and validation
│   ├── waf-stack.ts                  # WAF WebACL (us-east-1)
│   ├── moodle-stack.ts               # Main orchestrating stack
│   └── constructs/
│       ├── networking.ts             # VPC, subnets, endpoints, security groups
│       ├── database.ts               # Aurora Serverless v2
│       ├── cache.ts                  # ElastiCache Serverless (sessions + MUC)
│       ├── storage.ts                # EFS filesystem
│       ├── compute.ts                # ECS Fargate, ECR, auto-scaling
│       ├── loadbalancer.ts           # ALB, HTTPS, health checks
│       ├── cdn.ts                    # CloudFront distribution
│       ├── security.ts               # KMS keys, Secrets Manager
│       └── monitoring.ts             # CloudWatch, CloudTrail, SNS, dashboards
├── docker/
│   ├── Dockerfile                    # Moodle container image
│   └── config/                       # PHP, cron, and entrypoint configs
├── test/
│   ├── unit/                         # Unit tests per construct
│   └── property/                     # Property-based tests (fast-check)
├── cdk.json                          # CDK context and defaults
└── package.json                      # Dependencies
```
