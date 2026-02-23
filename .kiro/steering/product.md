---
inclusion: always
---

# Product Overview

This project deploys **Moodle LMS** (open-source, PHP-based) on AWS for **ECV Learning Solutions**. Moodle is not custom-built here — it is an upstream open-source project. This repo focuses on AWS infrastructure, deployment automation, and operational configuration.

## Business Context

- Zero licensing/subscription fees — customers pay only for AWS infrastructure
- Full data ownership — all data stays in the customer's own AWS account and region
- Target users: learners, educators, administrators, and IT operations staff
- Primary region: `ap-southeast-1` (Singapore) for Thai institutional compliance and low latency
- Must support 1,000+ concurrent users, scalable to 10,000+

## Architecture Summary

- **Compute:** ECS Fargate (serverless containers) — 75% Spot / 25% Standard split
- **Database:** Aurora Serverless v2 (MySQL-compatible) — 0.5–10 ACU, Multi-AZ
- **Caching:** ElastiCache Serverless (Redis/Valkey) — separate clusters for sessions and application cache (MUC)
- **Storage:** EFS (shared moodledata), S3 (backups, static content)
- **CDN/Security:** CloudFront + AWS WAF (WAF deployed in us-east-1)
- **Load Balancer:** ALB with ACM-managed TLS certificates
- **Network:** VPC with public subnets (ALB, NAT Gateway) and private subnets (ECS, Aurora, ElastiCache, EFS); Multi-AZ across 2+ AZs
- **IaC:** AWS CDK v2 (TypeScript)
- **Secrets:** AWS Secrets Manager with auto-rotation
- **Monitoring:** CloudWatch (logs, metrics), CloudTrail (audit), SNS (alerts)

## Key Conventions

- Moodle core is upstream — keep customizations (plugins, themes) separate from core
- Plugin management is Git-based via CI/CD pipeline, not through the Moodle admin panel
- No SSH exposure — use SSM Agent for remote access
- All application instances run in private subnets with no public IPs
- Security groups follow least-privilege: each component only accepts traffic from its upstream dependency
- All data encrypted at rest (Aurora, ElastiCache, EFS) and in transit (TLS everywhere)
- No hardcoded credentials — all secrets in Secrets Manager
- Deployments use ECS circuit breaker with automatic rollback on failure

## Moodle Filesystem Layout (per ECS Task)

```
/var/www/moodle/html   → Application code (baked into container image)
/var/www/moodle/data   → User data / moodledata (EFS shared mount)
/var/www/moodle/cache  → Application cache (EFS shared mount)
/var/www/moodle/temp   → Temporary files (EFS shared mount)
/var/www/moodle/local  → Local cache (ephemeral task storage)
```

## Performance Targets

- Page load < 3 seconds under normal load
- PHP OPcache: 256–512 MB, pre-warmed before instances join ALB
- Cache hit ratio > 90% for application cache
- Auto-scaling: CPU target tracking at 50%, scale-down at 25%
- Moodle cron: scheduled every 1 minute

## Key References

- [AWS Guidance: Deploying Moodle LMS on AWS](https://aws.amazon.com/solutions/guidance/deploying-moodle-learning-management-system-on-aws/)
- [AWS Blog: Modernize Moodle with Serverless Services](https://aws.amazon.com/blogs/publicsector/modernize-moodle-lms-with-aws-serverless-services/)
- [AWS CDK ECS Moodle Reference Architecture](https://github.com/aws-samples/aws-cdk-ecs-refarch-moodle)
- Full SRS: `REQUIREMENT_SPEC.md` in project root
