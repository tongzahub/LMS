# Implementation Plan: Moodle AWS Deployment

## Overview

This plan implements the AWS CDK v2 (TypeScript) infrastructure for deploying Moodle LMS on AWS. Tasks are ordered so each builds on the previous, starting with project scaffolding and configuration, then building each infrastructure construct, wiring them together, and validating with tests. The WafStack and MoodleStack are implemented as separate stacks with a cross-region reference.

## Tasks

- [x] 1. Scaffold CDK project and configuration
  - [x] 1.1 Initialize CDK TypeScript project with package.json, tsconfig.json, cdk.json, and install dependencies (aws-cdk-lib, constructs, fast-check, jest, ts-jest)
    - Create `moodle-cdk/` directory structure as defined in design: `bin/`, `lib/`, `lib/constructs/`, `docker/`, `docker/config/`, `test/unit/`, `test/property/`
    - Configure `cdk.json` with default context values for MoodleConfig
    - Configure `jest.config.ts` for unit and property test directories
    - _Requirements: 11.1_

  - [x] 1.2 Implement MoodleConfig interface and validation function in `lib/config.ts`
    - Define the `MoodleConfig` interface with all parameters from the design
    - Implement `validateConfig()` that checks Fargate CPU/memory validity, scaling ranges (min <= max), ACU ranges, opcacheMemory bounds (128-512), and required fields (domainName, region)
    - Implement `loadConfig(app: cdk.App)` to read from cdk.json context with defaults
    - _Requirements: 11.3_

  - [ ]* 1.3 Write unit tests for config validation
    - Test valid configs pass validation
    - Test invalid Fargate CPU values are rejected
    - Test minTasks > maxTasks is rejected
    - Test minAcu > maxAcu is rejected
    - Test missing domainName is rejected
    - _Requirements: 11.3_

- [x] 2. Implement networking construct
  - [x] 2.1 Create `lib/constructs/networking.ts` — VPC, subnets, NAT Gateways, VPC endpoints, flow logs, and security groups
    - Provision VPC with 2+ AZs, public and private subnets
    - Create NAT Gateways in public subnets
    - Add VPC interface endpoints for ECR (ecr.api, ecr.dkr) and gateway endpoint for S3
    - Enable VPC Flow Logs to CloudWatch Logs
    - Create security groups for ALB, ECS, Aurora, ElastiCache, and EFS with least-privilege ingress rules following the chain: Internet→ALB(80,443), ALB→ECS(container port), ECS→Aurora(3306), ECS→Cache(6379), ECS→EFS(2049)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 2.2 Write unit tests for networking construct
    - Test VPC has correct AZ count and subnet types
    - Test NAT Gateways exist in public subnets
    - Test VPC endpoints for ECR and S3 are present
    - Test flow logs are configured
    - Test security group ingress rules follow least-privilege chain
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 3. Implement security construct and secrets management
  - [x] 3.1 Create `lib/constructs/security.ts` — KMS keys and Secrets Manager entries
    - Create KMS keys for Aurora, ElastiCache, and EFS encryption
    - Create Secrets Manager secrets for Moodle admin password and any API keys
    - Enable auto-rotation on all secrets
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 3.2 Write unit tests for security construct
    - Test KMS keys are created for each data store
    - Test Secrets Manager secrets have rotation schedules
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 4. Implement database construct
  - [x] 4.1 Create `lib/constructs/database.ts` — Aurora Serverless v2 cluster
    - Provision Aurora Serverless v2 cluster with MySQL-compatible engine
    - Configure ServerlessV2ScalingConfiguration with min/max ACU from config
    - Deploy writer + reader instances across AZs for Multi-AZ
    - Enable automated backups with configurable retention period
    - Store master credentials in Secrets Manager with auto-rotation
    - Enable storage encryption with KMS key
    - Place in private subnets with the Aurora security group
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 4.2 Write unit tests for database construct
    - Test Aurora cluster is Serverless v2 with MySQL engine
    - Test scaling configuration matches config values
    - Test Multi-AZ with reader instance
    - Test backup retention matches config
    - Test credentials stored in Secrets Manager
    - Test storage encryption enabled with KMS
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 5. Implement caching construct
  - [x] 5.1 Create `lib/constructs/cache.ts` — ElastiCache Serverless clusters for MUC and sessions
    - Provision two ElastiCache Serverless clusters (one for MUC, one for sessions)
    - Configure ECPU and data storage limits from config
    - Enable TLS encryption in transit on both clusters
    - Place in private subnets with the cache security group
    - Export session and MUC cache endpoints
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 5.2 Write unit tests for caching construct
    - Test exactly 2 ElastiCache Serverless resources exist
    - Test TLS is enabled on both clusters
    - Test scaling limits match config
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6. Implement storage construct
  - [x] 6.1 Create `lib/constructs/storage.ts` — EFS filesystem with access points
    - Provision EFS filesystem with elastic throughput mode
    - Enable encryption at rest with KMS key
    - Enforce encryption in transit
    - Configure lifecycle policy for 30-day IA transition
    - Create mount targets in each private subnet
    - Create access points for data, cache, and temp directories
    - Place with the EFS security group
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 6.2 Write unit tests for storage construct
    - Test EFS has elastic throughput mode
    - Test lifecycle policy is 30-day IA transition
    - Test mount targets exist in private subnets
    - Test encryption in transit is enforced
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement load balancer construct
  - [x] 8.1 Create `lib/constructs/loadbalancer.ts` — ALB with HTTPS and health checks
    - Provision internet-facing ALB in public subnets
    - Create HTTPS listener on port 443 with ACM certificate
    - Create HTTP listener on port 80 with redirect to HTTPS
    - Configure target group with health check settings
    - Apply ALB security group
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 8.2 Write unit tests for load balancer construct
    - Test ALB is internet-facing in public subnets
    - Test HTTPS listener with certificate
    - Test HTTP-to-HTTPS redirect
    - Test health check configuration on target group
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 9. Implement Moodle container image
  - [x] 9.1 Create `docker/Dockerfile`, `docker/config/php.ini`, `docker/config/moodle-cron.sh`, and `docker/config/entrypoint.sh`
    - Dockerfile: PHP base image with required Moodle extensions, filesystem layout (/var/www/moodle/html, /local, /data, /cache, /temp)
    - php.ini: OPcache settings (memory 256-512 MB, high max_accelerated_files)
    - moodle-cron.sh: Cron runner executing Moodle cron every 1 minute
    - entrypoint.sh: Container startup script
    - Ensure no hardcoded credentials in any file
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 10. Implement compute construct
  - [x] 10.1 Create `lib/constructs/compute.ts` — ECS cluster, service, task definition, auto-scaling
    - Create ECS cluster with Fargate and Fargate Spot capacity providers
    - Create ECR repository for Moodle Docker image
    - Define task definition with CPU/memory from config, EFS volume mounts for data/cache/temp, secrets references from Secrets Manager (not environment variables), log configuration with awslogs driver
    - Create Fargate service with 75/25 Spot/Standard capacity provider strategy, circuit breaker with rollback, private subnet placement with AssignPublicIp DISABLED
    - Configure auto-scaling with CPU target tracking at configured utilization, min/max tasks from config
    - Register service with ALB target group
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 8.5_

  - [ ]* 10.2 Write unit tests for compute construct
    - Test task definition CPU and memory match config
    - Test EFS volume mounts at correct paths
    - Test secrets referenced via secrets property (not environment)
    - Test capacity provider strategy weights
    - Test circuit breaker enabled
    - Test AssignPublicIp DISABLED
    - Test auto-scaling target and min/max
    - Test ECR repository exists
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 5.7, 5.8, 8.5_

- [x] 11. Implement CDN construct
  - [x] 11.1 Create `lib/constructs/cdn.ts` — CloudFront distribution
    - Provision CloudFront distribution with ALB as origin
    - Configure cache behaviors for static assets
    - Associate ACM certificate (us-east-1)
    - Associate WAF WebACL ARN (cross-region reference)
    - Configure origin request policy to forward required headers for Moodle sessions
    - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.6_

  - [ ]* 11.2 Write unit tests for CDN construct
    - Test CloudFront distribution has ALB origin
    - Test WAF WebACL association
    - Test ACM certificate association
    - Test cache behaviors for static assets
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

- [x] 12. Implement monitoring construct
  - [x] 12.1 Create `lib/constructs/monitoring.ts` — CloudWatch, CloudTrail, SNS, dashboards
    - Create CloudWatch Log Groups for ECS containers
    - Create CloudWatch Alarms for ECS CPU, ECS memory, ALB target response time
    - Create CloudTrail trail with encrypted S3 bucket
    - Create SNS topic and Aurora event subscriptions for availability, failure, maintenance, low storage events
    - Create CloudWatch Dashboard with widgets for ECS, Aurora, ElastiCache, ALB metrics
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 12.2 Write unit tests for monitoring construct
    - Test CloudWatch Log Groups exist
    - Test alarms for CPU, memory, and response time
    - Test CloudTrail trail with encrypted S3 bucket
    - Test Aurora event subscriptions with SNS topic
    - Test dashboard resource exists
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 13. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implement WAF stack and wire all stacks together
  - [x] 14.1 Create `lib/waf-stack.ts` — WAF WebACL in us-east-1
    - Create WebACL with AWSManagedRulesCommonRuleSet and AWSManagedRulesKnownBadInputsRuleSet
    - Export WebACL ARN via CfnOutput for cross-region consumption
    - _Requirements: 7.3_

  - [x] 14.2 Create `lib/moodle-stack.ts` — Main orchestrating stack
    - Instantiate all constructs (networking, security, database, cache, storage, loadbalancer, compute, cdn, monitoring) with correct dependency wiring
    - Pass cross-construct references (VPC, security groups, secrets, endpoints, target groups)
    - Apply cost-allocation tags to all resources from config
    - Export key CloudFormation outputs (CloudFront domain, ALB DNS, ECR URI, Aurora endpoint, cache endpoints)
    - _Requirements: 11.2, 11.6, 12.4_

  - [x] 14.3 Create `bin/app.ts` — CDK app entry point
    - Load and validate config
    - Instantiate WafStack in us-east-1
    - Instantiate MoodleStack in target region with WAF WebACL ARN reference
    - Add stack dependency (MoodleStack depends on WafStack)
    - _Requirements: 11.1, 11.2, 11.4_

  - [ ]* 14.4 Write unit tests for WAF stack
    - Test WebACL has managed rule groups
    - Test CfnOutput for WebACL ARN exists
    - _Requirements: 7.3_

- [ ] 15. Write property-based tests
  - [ ]* 15.1 Create `test/property/arbitraries.ts` — fast-check arbitraries for MoodleConfig
    - Generate valid Fargate CPU values from allowed set (256, 512, 1024, 2048, 4096)
    - Generate valid memory for chosen CPU per Fargate limits
    - Generate valid scaling ranges (minTasks <= maxTasks, minAcu <= maxAcu)
    - Generate valid opcacheMemory (128-512)
    - Generate random domain names and cost allocation tags

  - [ ]* 15.2 Write property test: VPC Structure Completeness
    - **Property 1: VPC Structure Completeness**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

  - [ ]* 15.3 Write property test: Security Group Least-Privilege Chain
    - **Property 2: Security Group Least-Privilege Chain**
    - **Validates: Requirements 1.6, 2.7, 3.5, 4.5, 6.5**

  - [ ]* 15.4 Write property test: Aurora Serverless v2 Configuration
    - **Property 3: Aurora Serverless v2 Configuration**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

  - [ ]* 15.5 Write property test: Secrets Management Completeness
    - **Property 4: Secrets Management Completeness**
    - **Validates: Requirements 2.5, 8.1, 8.2, 8.5**

  - [ ]* 15.6 Write property test: Encryption at Rest
    - **Property 5: Encryption at Rest**
    - **Validates: Requirements 2.6, 8.3**

  - [ ]* 15.7 Write property test: Encryption in Transit
    - **Property 6: Encryption in Transit**
    - **Validates: Requirements 3.4, 4.2, 8.4**

  - [ ]* 15.8 Write property test: Dual ElastiCache Clusters
    - **Property 7: Dual ElastiCache Clusters**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [ ]* 15.9 Write property test: EFS Configuration
    - **Property 8: EFS Configuration**
    - **Validates: Requirements 4.1, 4.3, 4.4**

  - [ ]* 15.10 Write property test: ECS Compute Configuration
    - **Property 9: ECS Compute Configuration**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.6, 5.7, 5.8**

  - [ ]* 15.11 Write property test: ECS Task Definition Mounts
    - **Property 10: ECS Task Definition Mounts**
    - **Validates: Requirements 5.4**

  - [ ]* 15.12 Write property test: ALB Configuration
    - **Property 11: ALB Configuration**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

  - [ ]* 15.13 Write property test: CloudFront and WAF Association
    - **Property 12: CloudFront and WAF Association**
    - **Validates: Requirements 7.1, 7.3, 7.4, 7.5**

  - [ ]* 15.14 Write property test: Monitoring and Alerting Completeness
    - **Property 13: Monitoring and Alerting Completeness**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

  - [ ]* 15.15 Write property test: Configuration Parameterization
    - **Property 14: Configuration Parameterization**
    - **Validates: Requirements 11.3**

  - [ ]* 15.16 Write property test: Cost Allocation Tags
    - **Property 15: Cost Allocation Tags**
    - **Validates: Requirements 12.4**

- [x] 16. Create README and final checkpoint
  - [x] 16.1 Create `moodle-cdk/README.md` documenting prerequisites, configuration parameters, and deployment sequence
    - Document Node.js 18+, AWS CLI, CDK v2, Docker prerequisites
    - Document all MoodleConfig parameters with defaults
    - Document deployment steps: WAF stack first (us-east-1), then main stack (target region)
    - Document ACM certificate prerequisites (regional + us-east-1)
    - _Requirements: 11.5_

  - [x] 16.2 Final checkpoint — Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints at tasks 7, 13, and 16.2 ensure incremental validation
- Property tests validate universal correctness properties across random configurations
- Unit tests validate specific examples and edge cases per construct
- The CDK project uses TypeScript as specified in the SRS (section 5.2)
