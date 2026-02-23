---
inclusion: always
---

# Tech Stack & Infrastructure

## Infrastructure as Code

- AWS CDK v2 (TypeScript) — all infrastructure is defined as CDK stacks and constructs
- Target AWS region: `ap-southeast-1` unless explicitly overridden
- WAF WebACL must be deployed in `us-east-1` (CloudFront requirement) via a cross-region stack
- Use L2/L3 constructs over L1 (Cfn*) constructs wherever available
- Enable `removalPolicy: RETAIN` for stateful resources (Aurora, EFS, S3 buckets)
- Tag all resources with `Project`, `Environment`, and `ManagedBy: cdk` tags

## AWS Services

| Layer | Service | Notes |
|---|---|---|
| Compute | ECS Fargate | Serverless containers; 75% Spot / 25% On-Demand capacity providers |
| Database | Aurora Serverless v2 (MySQL 8.0) | 0.5–10 ACU, Multi-AZ, encrypted at rest |
| Caching | ElastiCache Serverless (Redis/Valkey) | Two clusters: sessions + application cache (MUC) |
| Storage | EFS | Shared moodledata mount across tasks |
| Storage | S3 | Backups, static content, CloudFront origin |
| CDN | CloudFront | Static asset delivery, paired with WAF |
| Security | WAF | Deployed in us-east-1, associated with CloudFront distribution |
| Load Balancer | ALB | HTTPS via ACM certificates, health checks on `/login/index.php` |
| Certificates | ACM | Managed TLS; CloudFront cert in us-east-1, ALB cert in ap-southeast-1 |
| Secrets | Secrets Manager | DB credentials, Moodle config secrets; auto-rotation enabled |
| Monitoring | CloudWatch | Logs (container stdout/stderr), metrics, alarms |
| Audit | CloudTrail | API-level audit logging |
| Alerts | SNS | Alarm notifications to ops team |
| Access | SSM Agent | Remote access to containers — no SSH, no public IPs |
| Network | VPC | Public subnets (ALB, NAT GW) + private subnets (ECS, Aurora, ElastiCache, EFS); 2+ AZs |

## Application Stack

- Moodle LMS (upstream open-source, PHP-based) — pulled during container build, never modified in this repo
- PHP 8.x with OPcache (256–512 MB)
- MySQL 8.0 wire protocol (Aurora Serverless v2)
- Redis/Valkey for session handling and Moodle Universal Cache (MUC)

## CDK Code Conventions

- One stack per logical boundary (e.g., `NetworkStack`, `DatabaseStack`, `ComputeStack`, `CdnStack`, `MonitoringStack`)
- Shared resources passed between stacks via construct props, not hardcoded ARNs or names
- Security groups defined per-component with least-privilege ingress rules
- All secrets referenced via `Secret.fromSecretNameV2()` or similar — never plaintext
- Use `cdk.CfnOutput` to export key values (ALB DNS, CloudFront domain, DB endpoint)
- Environment-specific config via CDK context (`cdk.json`) or environment variables

## Docker / Container Conventions

- Moodle container image built from upstream source with layered customizations (plugins, themes, config)
- Dockerfile and related assets live in a dedicated directory, separate from CDK code
- Container health check: HTTP GET on `/login/index.php`
- EFS mounted at `/var/www/moodle/data`, `/var/www/moodle/cache`, `/var/www/moodle/temp`
- Ephemeral local cache at `/var/www/moodle/local` (task-level storage, not shared)

## Common Commands

```bash
# CDK workflow
npx cdk synth          # Synthesize CloudFormation templates
npx cdk diff           # Preview infrastructure changes
npx cdk deploy --all   # Deploy all stacks
npx cdk destroy --all  # Tear down all stacks

# TypeScript
npm run build          # Compile TypeScript
npm run test           # Run CDK tests (snapshot + assertion)
```
