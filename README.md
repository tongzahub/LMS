# ECV Learning Solutions — Moodle LMS on AWS

AWS-based deployment of Moodle LMS for ECV Learning Solutions using AWS CDK v2 (TypeScript).

## Overview

This project provisions production-grade AWS infrastructure for hosting Moodle, an open-source PHP-based learning management system. It targets educational institutions and government agencies requiring full data ownership, zero licensing fees, and enterprise-grade reliability.

## Architecture

```
Route 53 → CloudFront + WAF → ALB → ECS Fargate → Aurora Serverless v2
                                                  → ElastiCache Serverless (Redis)
                                                  → EFS (shared storage)
```

## Key Services

| Layer | Service |
|---|---|
| Compute | ECS Fargate (75% Spot / 25% On-Demand) |
| Database | Aurora Serverless v2 (MySQL-compatible) |
| Caching | ElastiCache Serverless (sessions + MUC) |
| Storage | EFS (moodledata), S3 (backups) |
| CDN | CloudFront + AWS WAF |
| IaC | AWS CDK v2 (TypeScript) |

## Prerequisites

- Node.js 18+
- AWS CLI configured
- AWS CDK v2
- Docker or Finch
- ACM certificates (regional + us-east-1)

## Documentation

- `REQUIREMENT_SPEC.md` — Full Software Requirement Specification
- `.kiro/specs/moodle-aws-deployment/` — Feature spec (requirements, design, tasks)
- `.kiro/steering/` — AI steering rules and project context

## License

Moodle is licensed under the GNU General Public License (GPL).
