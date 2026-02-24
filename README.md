# ECV Learning Solutions — Moodle LMS on AWS

AWS-based deployment of Moodle LMS for ECV Learning Solutions using AWS CDK v2 (TypeScript), with a custom Next.js frontend portal.

## Overview

This project provisions production-grade AWS infrastructure for hosting Moodle, an open-source PHP-based learning management system, and includes a branded frontend portal built with Next.js 15. It targets educational institutions and government agencies requiring full data ownership, zero licensing fees, and enterprise-grade reliability.

## Repository Structure

```
/
├── moodle-cdk/              # AWS CDK infrastructure (TypeScript)
│   ├── lib/
│   │   ├── constructs/      # CDK constructs (networking, database, compute, etc.)
│   │   ├── moodle-stack.ts  # Main Moodle infrastructure stack
│   │   └── waf-stack.ts     # WAF stack (us-east-1)
│   ├── docker/              # Moodle container image (Dockerfile, config)
│   └── test/                # CDK tests (unit + property)
│
├── ecv-lms-frontend/        # Next.js 15 frontend portal
│   └── src/
│       ├── app/             # App Router pages (auth, protected, API routes)
│       ├── components/      # UI components (auth, courses, dashboard, users, etc.)
│       ├── hooks/           # TanStack Query data hooks
│       ├── lib/             # Auth, Moodle client, utilities
│       ├── contexts/        # Auth and i18n context providers
│       └── i18n/            # Thai and English translations
│
├── .kiro/specs/             # Feature specs (requirements → design → tasks)
└── REQUIREMENT_SPEC.md      # Full Software Requirement Specification
```

## Architecture

```
Route 53 → CloudFront + WAF → ALB → ECS Fargate → Aurora Serverless v2
                                                  → ElastiCache Serverless (Redis)
                                                  → EFS (shared storage)

Browser → Next.js Portal → Cognito (auth) → BFF API Routes → Moodle WS API
                                           → SSO redirect → Moodle OAuth2
```

## Key Services

| Layer | Service |
|---|---|
| Compute | ECS Fargate (75% Spot / 25% On-Demand) |
| Database | Aurora Serverless v2 (MySQL-compatible) |
| Caching | ElastiCache Serverless (sessions + MUC) |
| Storage | EFS (moodledata), S3 (backups) |
| CDN | CloudFront + AWS WAF |
| Auth | AWS Cognito (User Pool, MFA, social login) |
| IaC | AWS CDK v2 (TypeScript) |

## Frontend Portal

The `ecv-lms-frontend/` directory contains a Next.js 15 (App Router) application that serves as the branded entry point for ECV Learning Solutions' Moodle LMS.

**Tech stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, AWS Amplify SDK v6, TanStack Query, Zod, React Hook Form

**Features:**
- AWS Cognito authentication (email/password, social login, MFA)
- Role-based dashboards (Student, Teacher, Admin)
- Course catalog with search, filtering, and category navigation
- Course detail with syllabus outline and SSO redirect to Moodle
- Learning plan management with competency frameworks
- User administration (CRUD, CSV import/export, cohort management)
- Audit logs and system reports
- Internationalization (Thai / English) with Buddhist calendar dates
- Responsive design (desktop, tablet, mobile)
- Security middleware (CSP, HSTS, X-Frame-Options)

**BFF API layer:** All Moodle data flows through Next.js API Route Handlers (`/api/moodle/*`). The BFF verifies Cognito JWTs via `aws-jwt-verify`, enforces role-based access, and calls Moodle Web Services with a server-side token that never reaches the browser.

## CDK Constructs

| Construct | Description |
|---|---|
| `NetworkingConstruct` | VPC, subnets, NAT Gateway, security groups |
| `DatabaseConstruct` | Aurora Serverless v2 (MySQL 8.0), Multi-AZ |
| `CacheConstruct` | ElastiCache Serverless (sessions + MUC) |
| `StorageConstruct` | EFS (moodledata), S3 (backups, static content) |
| `ComputeConstruct` | ECS Fargate service, task definition, auto-scaling |
| `LoadBalancerConstruct` | ALB, HTTPS listener, health checks |
| `CdnConstruct` | CloudFront distribution, S3 origin |
| `SecurityConstruct` | IAM roles, Secrets Manager references |
| `MonitoringConstruct` | CloudWatch alarms, SNS notifications |
| `CognitoTriggers` | Lambda triggers (post-confirmation, pre-token, custom message) |

## Prerequisites

- Node.js 18+
- AWS CLI configured
- AWS CDK v2
- Docker or Finch
- ACM certificates (regional + us-east-1)

## Quick Start

```bash
# Infrastructure
cd moodle-cdk
npm install
npx cdk synth
npx cdk deploy --all

# Frontend
cd ecv-lms-frontend
npm install
npm run dev          # Development server
npx vitest run       # Run tests (152 tests)
```

## Documentation

- `REQUIREMENT_SPEC.md` — Full Software Requirement Specification
- `.kiro/specs/moodle-aws-deployment/` — Infrastructure spec (requirements, design, tasks)
- `.kiro/specs/ecv-lms-frontend/` — Frontend spec (requirements, design, tasks)
- `.kiro/steering/` — AI steering rules and project context

## License

Moodle is licensed under the GNU General Public License (GPL).
