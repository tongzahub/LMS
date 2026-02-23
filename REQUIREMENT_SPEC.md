# ECV Learning Solutions - Moodle LMS on AWS
## Software Requirement Specification (SRS)

**Document Version:** 1.0
**Date:** 2026-02-23
**Project:** ECV Moodle LMS Deployment on AWS
**Source Documents:**
- 20260217 ECV Learning Solutions.pdf (Business Presentation)
- requirement.md (AWS Reference Architecture Links)
- AWS Guidance: Deploying Moodle LMS on AWS
- AWS Blog: Modernize Moodle LMS with AWS Serverless Services

---

## 1. Executive Summary

ECV Learning Solutions is an enterprise-grade Learning Management System (LMS) based on Moodle, deployed on AWS infrastructure. The platform targets educational institutions and government agencies, offering:

- **Zero subscription/licensing fees** - Pay only for AWS infrastructure
- **Full data ownership and control** - Data stays in customer's AWS account
- **Enterprise reliability** - AWS-powered uptime, security, and scalability
- **Unlimited customization** - Open-source Moodle with full modification capability

---

## 2. Business Requirements

### 2.1 Business Goals
| ID | Requirement | Priority |
|---|---|---|
| BR-001 | Eliminate recurring LMS licensing/subscription costs | Critical |
| BR-002 | Provide enterprise-grade reliability and availability | Critical |
| BR-003 | Ensure full data ownership and sovereignty (data stays in customer's AWS region) | Critical |
| BR-004 | Support anytime, anywhere, any-device learning access | High |
| BR-005 | Enable unlimited customization without vendor lock-in | High |
| BR-006 | Meet government compliance and regulatory requirements | High |
| BR-007 | Provide pay-as-you-go infrastructure cost model | Medium |

### 2.2 Target Users
| User Type | Description |
|---|---|
| **Learners/Students** | Access courses, quizzes, assignments, multimedia content |
| **Educators/Instructors** | Create courses, author content, manage assessments, track progress |
| **Administrators** | Manage platform, users, configurations, and infrastructure |
| **IT Operations** | Deploy, monitor, maintain, and scale the infrastructure |

### 2.3 Key Business Differentiators
- Zero subscription fees (Moodle open-source)
- Complete data control in customer's own AWS account
- Full administrative control with data export capability at any time
- Compliance with government data regulations via regional AWS deployment
- Rebuilt UX focused on educator workflows, not developer paradigms

---

## 3. Functional Requirements

### 3.1 Learning Management Core

| ID | Feature | Description | Priority |
|---|---|---|---|
| FR-001 | Course Management | Create, organize, and manage courses with categories, topics, and sections | Critical |
| FR-002 | Content Delivery | Deliver pre-recorded lectures, multimedia content, and documents | Critical |
| FR-003 | Assessment Engine | Create quizzes, assignments, and exams with multiple question types | Critical |
| FR-004 | Student Progress Tracking | Track and report learner progress, completion rates, and grades | Critical |
| FR-005 | Communication Tools | Messaging, forums, announcements between educators and students | High |
| FR-006 | User Enrollment | Self-enrollment, manual enrollment, and cohort-based enrollment | High |
| FR-007 | Role-Based Access Control | Configurable roles (admin, manager, teacher, student, guest) | Critical |
| FR-008 | Gradebook | Centralized grade management with weighted categories and custom scales | High |

### 3.2 Content Authoring

| ID | Feature | Description | Priority |
|---|---|---|---|
| FR-009 | Interactive Content (H5P) | 50+ interactive content types built-in (no third-party subscriptions) | High |
| FR-010 | Drag-and-Drop Authoring | No-code content creation for non-technical educators | High |
| FR-011 | Interactive Video | Video content with embedded quizzes and interaction points | Medium |
| FR-012 | Gamification Elements | Badges, leaderboards, and gamified content experiences | Medium |
| FR-013 | Multimedia Lessons | Rich multimedia lessons combining text, images, video, and audio | High |
| FR-014 | Assessment Builder | Visual quiz/assessment builder with various question types | High |

### 3.3 Platform Features

| ID | Feature | Description | Priority |
|---|---|---|---|
| FR-015 | Multi-Language Support | Support for Thai language and international languages | High |
| FR-016 | Mobile Responsive Design | Full functionality on tablets and smartphones | High |
| FR-017 | Plugin Management | Install, update, and manage Moodle plugins via CI/CD pipeline | Medium |
| FR-018 | Data Export | Complete data export capability at any time (backup/restore) | High |
| FR-019 | Scheduled Tasks (Cron) | Automated task execution (recommended: every 1 minute) | Critical |
| FR-020 | Reporting & Analytics | Course analytics, learner analytics, and system usage reports | High |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-001 | Page Load Time | < 3 seconds for standard pages | High |
| NFR-002 | Concurrent Users | Support 1,000+ concurrent users (scalable to 10,000+) | Critical |
| NFR-003 | PHP OPcache | 256-512 MB memory allocation with high `max_accelerated_files` | High |
| NFR-004 | OPcache Pre-warming | Warm OPcache before instances join ALB pool | High |
| NFR-005 | CDN Caching | Static assets served via CloudFront edge locations | High |
| NFR-006 | Application Caching | Dedicated ElastiCache for Moodle Universal Cache (MUC) | Critical |
| NFR-007 | Session Caching | Separate ElastiCache cluster for session management | Critical |

### 4.2 Availability & Reliability

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-008 | Uptime SLA | 99.9% availability | Critical |
| NFR-009 | Multi-AZ Deployment | All services deployed across 2+ Availability Zones | Critical |
| NFR-010 | Auto-Recovery | Automatic failover for database, cache, and compute | Critical |
| NFR-011 | Zero-Downtime Deployment | Blue-green or rolling deployments for updates | High |
| NFR-012 | Database Backup | Automated backups with 7-day retention period | Critical |
| NFR-013 | Disaster Recovery | Full backup export and restore capability | High |

### 4.3 Scalability

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-014 | Horizontal Auto-Scaling | CPU-based scaling (scale up at 50-75%, scale down at 25%) | Critical |
| NFR-015 | Database Auto-Scaling | Aurora Serverless v2: 0.5 - 10 ACU dynamic scaling | High |
| NFR-016 | Cache Auto-Scaling | ElastiCache Serverless: 1-100 ECPU, up to 10GB | High |
| NFR-017 | Storage Auto-Scaling | EFS with elastic throughput mode, auto-expanding | High |
| NFR-018 | Seasonal Scaling | Handle traffic fluctuations (exam periods vs. holidays) | High |

### 4.4 Security

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-019 | SSL/TLS Encryption | End-to-end HTTPS with ACM-managed certificates (auto-rotation) | Critical |
| NFR-020 | Web Application Firewall | AWS WAF integrated via CloudFront | Critical |
| NFR-021 | Data Encryption at Rest | Encryption for database, cache, and file storage | Critical |
| NFR-022 | Data Encryption in Transit | TLS for EFS mounts and ElastiCache connections | Critical |
| NFR-023 | Secrets Management | AWS Secrets Manager with auto-rotation for all credentials | Critical |
| NFR-024 | Network Isolation | Application servers in private subnets; no public IPs | Critical |
| NFR-025 | No SSH Exposure | SSM Agent for secure remote access (no SSH ports) | High |
| NFR-026 | Audit Logging | CloudTrail audit logs stored in encrypted S3 | High |
| NFR-027 | VPC Flow Logs | Network traffic monitoring via CloudWatch | Medium |
| NFR-028 | Least-Privilege Security Groups | Each component only accepts traffic from upstream | Critical |
| NFR-029 | Data Sovereignty | Data stored in customer-selected AWS region | Critical |

### 4.5 Cost Optimization

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-030 | Pay-As-You-Go Model | No upfront licensing; pay only for AWS infrastructure used | Critical |
| NFR-031 | Serverless Where Possible | Aurora Serverless v2, ElastiCache Serverless, EFS Elastic | High |
| NFR-032 | Spot Instance Utilization | 75% Fargate Spot / 25% Fargate standard split | Medium |
| NFR-033 | Storage Tiering | EFS lifecycle policy: move infrequently accessed files after 30 days | Medium |
| NFR-034 | Reserved/Savings Plans | Support for Reserved Instances and Savings Plans for steady workloads | Medium |

### 4.6 Monitoring & Observability

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-035 | Container/Application Logs | CloudWatch Logs for all application containers | High |
| NFR-036 | Performance Monitoring | CloudWatch metrics for CPU, memory, network, latency | High |
| NFR-037 | Database Event Notifications | SNS alerts for availability, failure, maintenance, low storage | High |
| NFR-038 | Deployment Health Checks | ECS circuit breaker with automatic rollback on failures | High |
| NFR-039 | Load Testing Baseline | Benchmark testing before production launch | Medium |

---

## 5. Architecture Specification

### 5.1 Recommended Architecture: Serverless/Container (ECS Fargate)

This is the recommended architecture for variable traffic patterns typical of educational institutions.

```
                           ┌──────────────┐
                           │  Route 53    │
                           │  (DNS)       │
                           └──────┬───────┘
                                  │
                           ┌──────▼───────┐
                           │  CloudFront  │
                           │  + AWS WAF   │
                           └──────┬───────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │    Application Load        │
                    │    Balancer (ALB)           │
                    │    + ACM SSL/TLS            │
                    └─────────────┬─────────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
     ┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐
     │ ECS Fargate │      │ ECS Fargate │      │ ECS Fargate │
     │  Task (AZ1) │      │  Task (AZ1) │      │  Task (AZ2) │
     │  Moodle PHP │      │  Moodle PHP │      │  Moodle PHP │
     └──────┬──────┘      └──────┬──────┘      └──────┬──────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
  ┌──────▼──────┐          ┌──────▼──────┐          ┌──────▼──────┐
  │   Aurora    │          │ ElastiCache │          │    EFS      │
  │ Serverless  │          │ Serverless  │          │  (Shared    │
  │   v2       │          │ (Redis)     │          │  Storage)   │
  └─────────────┘          └─────────────┘          └─────────────┘
```

### 5.2 AWS Services Stack

| Layer | Service | Configuration |
|---|---|---|
| **DNS** | Route 53 | Domain routing to CloudFront |
| **CDN** | CloudFront | Edge caching for static assets + WAF integration |
| **Security** | AWS WAF | Web application firewall rules (deployed in us-east-1) |
| **SSL/TLS** | ACM | Two certificates: regional (ALB) + us-east-1 (CloudFront) |
| **Load Balancer** | ALB | HTTPS termination, health checks, traffic distribution |
| **Compute** | ECS Fargate | 2048 CPU / 4096 MiB per task; 75% Spot / 25% Standard |
| **Container Registry** | ECR | Moodle Docker images |
| **Database** | Aurora Serverless v2 | MySQL-compatible; 0.5-10 ACU; Multi-AZ; 7-day backup |
| **Caching** | ElastiCache Serverless | Redis/Valkey; 1-100 ECPU; TLS encryption required |
| **File Storage** | EFS | Elastic throughput; transit encryption; 30-day lifecycle |
| **Secrets** | Secrets Manager | DB passwords, admin credentials, API keys (auto-rotation) |
| **Monitoring** | CloudWatch | Logs, metrics, VPC flow logs |
| **Audit** | CloudTrail | API audit trail in encrypted S3 |
| **Alerts** | SNS | Database event notifications |
| **IaC** | AWS CDK v2 | TypeScript-based infrastructure as code |

### 5.3 Network Architecture

| Subnet | Components |
|---|---|
| **Public Subnet** | ALB, NAT Gateway, Internet Gateway |
| **Private Subnet** | ECS Fargate Tasks, Aurora, ElastiCache, EFS |

- VPC spans 2+ Availability Zones
- VPC Endpoints: ECR (interface) + S3 (gateway) for Fargate 1.4.0+
- HTTP auto-redirects to HTTPS (port 80 → 443)
- Security groups follow least-privilege model

### 5.4 Filesystem Layout (per ECS Task / EC2 Instance)

```
/var/www/moodle/html   → Application code (container image / EBS)
/var/www/moodle/local  → Local cache (ephemeral / EBS)
/var/www/moodle/data   → User data / moodledata (EFS shared)
/var/www/moodle/cache  → Application cache (EFS shared)
/var/www/moodle/temp   → Temporary files (EFS shared)
```

### 5.5 Auto-Scaling Configuration

| Component | Metric | Scale Up | Scale Down | Min | Max |
|---|---|---|---|---|---|
| ECS Tasks | CPU Utilization | 50% target tracking | Auto | 1 | 10 |
| Aurora Serverless v2 | Demand | Automatic | Automatic | 0.5 ACU | 10 ACU |
| ElastiCache Serverless | Demand | Automatic | Automatic | 1 ECPU | 100 ECPU |
| EFS | Storage/Throughput | Automatic | Automatic | Elastic | Elastic |

---

## 6. Deployment Requirements

### 6.1 Prerequisites

| Item | Specification |
|---|---|
| AWS Account | Customer-owned AWS account |
| Node.js | Version 18+ |
| AWS CLI | Configured with appropriate credentials |
| AWS CDK | Version 2.x |
| Docker/Finch | For building Moodle container images |
| Git | Version control |
| ACM Certificates | Regional cert (ALB) + us-east-1 cert (CloudFront) |

### 6.2 Supported AWS Regions

us-east-1, us-east-2, us-west-2, eu-west-1, eu-central-1, ap-southeast-1, ap-southeast-2, ap-south-1, ca-central-1

> **Note:** For Thai government/institutional compliance, `ap-southeast-1` (Singapore) is the recommended region for lowest latency.

### 6.3 Deployment Process

1. Configure AWS CDK parameters (region, domain, certificates, compute settings)
2. Deploy CloudFront WAF stack to us-east-1
3. Deploy main ECS Moodle stack to target region
4. Wait for Moodle initial installation (~15-20 minutes)
5. Configure DNS (Route 53 or external DNS provider)
6. Complete Moodle setup wizard via browser
7. Update deployment parameters (service replicas, health check grace period)
8. Run `cdk deploy --all` for production-ready configuration
9. Configure ElastiCache endpoints in Moodle admin
10. Run baseline load tests

### 6.4 CI/CD Pipeline

- **Infrastructure:** AWS CDK v2 (TypeScript) for infrastructure deployment
- **Application:** CodePipeline + CodeBuild + CodeDeploy (for EC2 architecture) or CDK Deploy (for ECS architecture)
- **Plugin Management:** Git-based plugin management via CI/CD pipeline (not Moodle admin panel)
- **Deployment Strategy:** Circuit breaker enabled with automatic rollback on failures

---

## 7. Data Requirements

### 7.1 Data Ownership

- All data resides in customer's own AWS account
- Data stored in customer-selected AWS region
- Complete administrative control over all data
- Full export capability at any time (backup/restore)
- Compliance with government data sovereignty regulations

### 7.2 Data Backup & Recovery

| Aspect | Configuration |
|---|---|
| Database Backup | Automated Aurora backups; 7-day retention |
| File Backup | EFS with cross-AZ replication |
| Point-in-Time Recovery | Aurora continuous backup |
| Full Export | Moodle native backup + AWS backup tools |

---

## 8. Acceptance Criteria

### 8.1 Deployment Acceptance
- [ ] All AWS infrastructure deployed successfully via CDK/CloudFormation
- [ ] Moodle accessible via HTTPS with valid SSL certificate
- [ ] Multi-AZ deployment verified across 2+ availability zones
- [ ] Auto-scaling verified under load testing
- [ ] WAF rules active and blocking malicious traffic
- [ ] All secrets stored in Secrets Manager (no hardcoded credentials)
- [ ] CloudTrail audit logging active
- [ ] VPC flow logs enabled

### 8.2 Functional Acceptance
- [ ] Educator can create courses with multimedia content
- [ ] Students can enroll, access content, and complete assessments
- [ ] H5P interactive content types functional (50+ types)
- [ ] Gradebook correctly calculates and displays grades
- [ ] Communication tools (messaging, forums) operational
- [ ] Multi-language support (Thai + English minimum)
- [ ] Mobile-responsive design verified on tablets and phones
- [ ] Data export/backup functional

### 8.3 Performance Acceptance
- [ ] Page load time < 3 seconds under normal load
- [ ] Support 1,000+ concurrent users without degradation
- [ ] Auto-scaling triggers correctly on load increase
- [ ] Database scales with demand (Aurora Serverless v2)
- [ ] Cache hit ratio > 90% for application cache
- [ ] Zero-downtime deployment verified

### 8.4 Security Acceptance
- [ ] All traffic encrypted (HTTPS/TLS)
- [ ] Data encrypted at rest (database, cache, storage)
- [ ] Data encrypted in transit (EFS, ElastiCache)
- [ ] No public IP exposure on application instances
- [ ] Least-privilege security groups configured
- [ ] Secrets auto-rotation configured
- [ ] Penetration testing passed

---

## 9. Glossary

| Term | Definition |
|---|---|
| **Moodle** | Open-source Learning Management System (GNU GPL) |
| **ECS** | Amazon Elastic Container Service |
| **Fargate** | AWS serverless compute engine for containers |
| **Aurora Serverless v2** | Auto-scaling relational database compatible with MySQL/PostgreSQL |
| **ElastiCache** | AWS managed in-memory caching (Redis/Memcached) |
| **EFS** | Amazon Elastic File System (shared NFS storage) |
| **ALB** | Application Load Balancer (Layer 7) |
| **ACM** | AWS Certificate Manager |
| **WAF** | Web Application Firewall |
| **CDK** | AWS Cloud Development Kit (Infrastructure as Code) |
| **ACU** | Aurora Capacity Unit (compute unit for Aurora Serverless) |
| **ECPU** | ElastiCache Processing Unit |
| **MUC** | Moodle Universal Cache |
| **H5P** | HTML5 Package (interactive content framework) |
| **SSM** | AWS Systems Manager |

---

## 10. References

1. [AWS Guidance: Deploying Moodle LMS on AWS](https://aws.amazon.com/solutions/guidance/deploying-moodle-learning-management-system-on-aws/)
2. [AWS Blog: Modernize Moodle LMS with AWS Serverless Services](https://aws.amazon.com/blogs/publicsector/modernize-moodle-lms-with-aws-serverless-services/)
3. [AWS Blog: Modernize Moodle LMS with AWS Serverless Containers](https://aws.amazon.com/blogs/publicsector/modernize-moodle-lms-aws-serverless-containers/)
4. [AWS Moodle CloudFormation Reference Architecture (GitHub)](https://github.com/aws-samples/aws-refarch-moodle)
5. [AWS CDK ECS Moodle Reference Architecture (GitHub)](https://github.com/aws-samples/aws-cdk-ecs-refarch-moodle)
6. [AWS Blog: How to Scale and Optimize Moodle LMS on AWS](https://aws.amazon.com/blogs/publicsector/how-to-scale-and-optimize-moodle-lms-on-aws/)
7. ECV Learning Solutions Presentation (20260217)
