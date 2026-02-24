# AWS Infrastructure Inventory & Cost Estimate

## ECV Learning Solutions — Moodle LMS on AWS

Region: `ap-southeast-1` (Singapore)  
Pricing basis: AWS public pricing as of Q1 2026 (pay-as-you-go, no Savings Plans applied)  
Currency: USD/month  

---

## 1. Service Inventory

### 1.1 Networking (VPC)

| Resource | Configuration | Quantity |
|---|---|---|
| VPC | 2 AZs, public + private subnets | 1 |
| NAT Gateway | 1 per AZ | 2 |
| VPC Interface Endpoints | ECR API, ECR Docker | 2 |
| VPC Gateway Endpoint | S3 | 1 (free) |
| VPC Flow Logs | CloudWatch Logs, 30-day retention | 1 |
| Security Groups | ALB, ECS, Aurora, ElastiCache, EFS | 5 |

### 1.2 Compute (ECS Fargate)

| Resource | Configuration |
|---|---|
| ECS Cluster | Fargate capacity providers (75% Spot / 25% On-Demand) |
| Task Definition | 2 vCPU, 4 GB memory per task |
| Desired Count | 1 (min) — 10 (max) |
| Auto-Scaling | CPU target tracking at 50% |
| Circuit Breaker | Enabled with rollback |
| SSM Execute Command | Enabled (remote access, no SSH) |
| ECR Repository | 1 private repository, image scan on push |
| CloudWatch Log Group | `/ecs/moodle-production`, 30-day retention |

### 1.3 Database (Aurora Serverless v2)

| Resource | Configuration |
|---|---|
| Engine | Aurora MySQL 3.05.2 (MySQL 8.0 compatible) |
| Capacity | 0.5 ACU (min) — 10 ACU (max) |
| Instances | 1 Writer + 1 Reader (serverless v2, scale with writer) |
| Storage | Encrypted at rest (KMS), auto-scaling |
| Backup | 7-day automated retention |
| Multi-AZ | Yes (reader in separate AZ) |
| Deletion Protection | Enabled |
| Default Database | `moodle` |

### 1.4 Caching (ElastiCache Serverless)

| Resource | Configuration |
|---|---|
| Session Cache | Valkey engine, serverless, max 100 ECPU/s, max 10 GB |
| MUC Cache | Valkey engine, serverless, max 100 ECPU/s, max 10 GB |
| Encryption | In-transit (TLS) |
| Placement | Private subnets, 2 AZs |

### 1.5 Storage

| Resource | Configuration |
|---|---|
| EFS | Elastic throughput, encrypted (KMS), lifecycle to IA after 30 days |
| EFS Access Points | 3 (data, cache, temp) — POSIX user www-data (33:33) |
| S3 | Backups, static content, CloudFront origin |

### 1.6 Load Balancer (ALB)

| Resource | Configuration |
|---|---|
| ALB | Internet-facing, public subnets, 2 AZs |
| Listeners | HTTPS (443) with ACM certificate, HTTP (80) redirect |
| Target Group | ECS Fargate tasks, health check on `/login/index.php` |

### 1.7 CDN & Security

| Resource | Configuration |
|---|---|
| CloudFront | HTTP/2+3, PriceClass 200, TLS 1.2 minimum |
| Cache Behaviors | Static assets (theme/*, lib/*, pluginfile.php/*) cached 1–30 days; dynamic content pass-through |
| WAF WebACL | Deployed in `us-east-1`, associated with CloudFront |
| ACM Certificates | 2 (CloudFront in us-east-1, ALB in ap-southeast-1) |

### 1.8 Authentication (Cognito)

| Resource | Configuration |
|---|---|
| User Pool | Email/password, social login (Google, Facebook, Apple), MFA (TOTP + SMS) |
| User Groups | ADMINS, TEACHERS, STUDENTS |
| Lambda Triggers | Post-Confirmation, Pre-Token Generation, Custom Message (Node.js 20.x) |
| Custom Attributes | `moodle_user_id`, `permissions` |

### 1.9 Secrets & Security

| Resource | Configuration |
|---|---|
| Secrets Manager | Aurora credentials (auto-generated), Moodle WS token |
| KMS | Customer-managed key for Aurora + EFS encryption |

### 1.10 Monitoring & Audit

| Resource | Configuration |
|---|---|
| CloudWatch Logs | ECS container logs, VPC flow logs |
| CloudWatch Alarms | CPU, memory, database connections, error rates |
| CloudTrail | API-level audit logging |
| SNS | Alarm notification topic |

### 1.11 Frontend Portal (Amplify Hosting / Vercel)

| Resource | Configuration |
|---|---|
| Next.js 15 App | App Router, SSR, API routes (BFF layer) |
| Hosting | Amplify Hosting or Vercel (external to CDK) |

---

## 2. Monthly Cost Estimate

ประเมินราคาสำหรับ 3 scenarios: Idle (ไม่มี traffic), Normal (1,000 concurrent users), Peak (5,000+ concurrent users)

### Scenario A: Idle / Development (~$350–450/mo)

สถานะ: ระบบเปิดอยู่แต่ไม่มี traffic, Fargate 1 task, Aurora ที่ minimum ACU

| Service | Specification | Est. Cost/mo |
|---|---|---|
| NAT Gateway | 2 × $0.045/hr × 730 hrs | $65.70 |
| VPC Endpoints | 2 interface endpoints × $0.01/hr × 730 hrs | $14.60 |
| ECS Fargate (On-Demand) | 1 task × 2 vCPU × $0.04856/hr × 730 hrs | $70.90 |
| ECS Fargate (memory) | 1 task × 4 GB × $0.00532/hr × 730 hrs | $15.53 |
| Aurora Serverless v2 | Writer 0.5 ACU × $0.14/hr × 730 hrs | $51.10 |
| Aurora Serverless v2 | Reader 0.5 ACU × $0.14/hr × 730 hrs | $51.10 |
| Aurora Storage | ~10 GB × $0.12/GB | $1.20 |
| ElastiCache Serverless | 2 clusters × minimum ~$6/mo each | $12.00 |
| EFS | ~5 GB standard × $0.36/GB | $1.80 |
| ALB | 1 × $0.0252/hr × 730 hrs + minimal LCU | $20.00 |
| CloudFront | Minimal traffic | $1.00 |
| WAF | 1 WebACL ($5) + ~5 rules ($5) | $10.00 |
| Cognito | <50 MAU (free tier) | $0.00 |
| Secrets Manager | 2 secrets × $0.40 | $0.80 |
| KMS | 1 key × $1.00 + minimal API calls | $1.50 |
| CloudWatch | Logs (~1 GB) + basic metrics | $5.00 |
| CloudTrail | 1 trail (management events free) | $0.00 |
| Lambda (Cognito triggers) | Minimal invocations | $0.00 |
| **รวม** | | **~$322–350** |

### Scenario B: Normal Load — 1,000 Concurrent Users (~$800–1,200/mo)

สถานะ: ใช้งานปกติ, 3–4 Fargate tasks, Aurora 2–4 ACU, moderate traffic

| Service | Specification | Est. Cost/mo |
|---|---|---|
| NAT Gateway | 2 × $0.045/hr × 730 hrs + data processing ~50 GB | $68.00 |
| VPC Endpoints | 2 × $0.01/hr × 730 hrs | $14.60 |
| ECS Fargate (On-Demand 25%) | 1 task × 2 vCPU/4 GB × 730 hrs | $86.43 |
| ECS Fargate (Spot 75%) | 3 tasks × 2 vCPU/4 GB × 730 hrs × ~0.30 discount | $181.50 |
| Aurora Serverless v2 | Writer avg 3 ACU × $0.14/hr × 730 hrs | $306.60 |
| Aurora Serverless v2 | Reader avg 2 ACU × $0.14/hr × 730 hrs | $204.40 |
| Aurora Storage | ~50 GB × $0.12/GB | $6.00 |
| Aurora I/O | ~10M I/O requests × $0.22/M | $2.20 |
| ElastiCache Serverless | 2 clusters, moderate ECPU usage | $30.00 |
| EFS | ~20 GB standard + 10 GB IA | $8.80 |
| ALB | $18.40 + ~10 LCU × $0.008/hr × 730 hrs | $76.80 |
| CloudFront | ~100 GB transfer (Asia) × $0.14/GB | $14.00 |
| WAF | $10 + ~5M requests × $0.60/M | $13.00 |
| Cognito | ~2,000 MAU × $0.0055 (Essentials tier) | $11.00 |
| Secrets Manager | 2 secrets + API calls | $1.50 |
| KMS | 1 key + API calls | $3.00 |
| CloudWatch | Logs (~10 GB) + metrics + alarms | $20.00 |
| Lambda (Cognito triggers) | ~2,000 invocations | $0.00 |
| **รวม** | | **~$1,048** |

### Scenario C: Peak Load — 5,000+ Concurrent Users (~$2,500–3,500/mo)

สถานะ: ช่วงสอบหรือเปิดเทอม, 8–10 Fargate tasks, Aurora 6–10 ACU, heavy traffic

| Service | Specification | Est. Cost/mo |
|---|---|---|
| NAT Gateway | 2 × $0.045/hr × 730 hrs + data ~200 GB | $80.00 |
| VPC Endpoints | 2 × $0.01/hr × 730 hrs | $14.60 |
| ECS Fargate (On-Demand 25%) | 2.5 tasks avg × 2 vCPU/4 GB × 730 hrs | $216.08 |
| ECS Fargate (Spot 75%) | 7.5 tasks avg × 2 vCPU/4 GB × 730 hrs × ~0.30 discount | $453.75 |
| Aurora Serverless v2 | Writer avg 7 ACU × $0.14/hr × 730 hrs | $715.40 |
| Aurora Serverless v2 | Reader avg 5 ACU × $0.14/hr × 730 hrs | $511.00 |
| Aurora Storage | ~100 GB × $0.12/GB | $12.00 |
| Aurora I/O | ~50M I/O requests × $0.22/M | $11.00 |
| ElastiCache Serverless | 2 clusters, high ECPU usage | $80.00 |
| EFS | ~50 GB standard + 30 GB IA | $19.80 |
| ALB | $18.40 + ~30 LCU × $0.008/hr × 730 hrs | $193.60 |
| CloudFront | ~500 GB transfer (Asia) × $0.14/GB | $70.00 |
| WAF | $10 + ~20M requests × $0.60/M | $22.00 |
| Cognito | ~10,000 MAU × $0.0055 | $55.00 |
| Secrets Manager | 2 secrets + API calls | $2.00 |
| KMS | 1 key + API calls | $5.00 |
| CloudWatch | Logs (~50 GB) + metrics + alarms | $50.00 |
| Lambda (Cognito triggers) | ~10,000 invocations | $0.00 |
| **รวม** | | **~$2,511** |

---

## 3. Cost Optimization Opportunities

| Strategy | Potential Savings | Notes |
|---|---|---|
| Fargate Spot (75%) | ~30% on compute | Already configured; risk of interruption during capacity shortages |
| Aurora Serverless v2 min 0.5 ACU | Scales to zero-ish | Minimum cost ~$51/mo per instance even at idle |
| Compute Savings Plans (1-yr) | ~17% on Fargate | Commit to $/hr usage for On-Demand portion |
| Database Savings Plans (1-yr) | ~20% on Aurora | Commit to $/hr ACU usage |
| NAT Gateway → NAT Instance | ~50% on NAT costs | Trade reliability for cost; not recommended for production |
| Single NAT Gateway | ~50% on NAT costs | Reduces availability; acceptable for non-prod |
| Remove Aurora Reader | ~50% on Aurora idle cost | Reduces read capacity and availability |
| CloudFront caching | Reduces ALB/origin load | Static assets already cached; tune TTLs for more savings |
| EFS Intelligent-Tiering | ~60% on infrequent data | Already configured (lifecycle to IA after 30 days) |
| Reserved Capacity (ElastiCache) | ~30% | If usage is predictable |

---

## 4. Cost Summary Table

| Scenario | Concurrent Users | Fargate Tasks | Aurora ACU | Est. Monthly Cost |
|---|---|---|---|---|
| Idle / Dev | 0 | 1 | 0.5 | **~$350** |
| Normal | 1,000 | 3–4 | 2–4 | **~$1,050** |
| Peak | 5,000+ | 8–10 | 6–10 | **~$2,500** |
| Max Scale | 10,000+ | 10 | 10 | **~$3,500** |

---

## 5. Free Tier & One-Time Costs

| Item | Details |
|---|---|
| Cognito Free Tier | First 10,000 MAU free (Lite tier) |
| CloudFront Free Tier | 1 TB transfer + 10M requests/mo (first 12 months) |
| CloudTrail | 1 management trail free |
| ACM Certificates | Free (public certificates) |
| SNS | First 1M requests free |
| Lambda | First 1M requests + 400K GB-seconds free |
| One-time: Domain registration | ~$12/yr (Route 53) |
| One-time: Docker image build | CI/CD pipeline costs (CodePipeline/GitHub Actions) |

---

## 6. หมายเหตุ

- ราคาทั้งหมดเป็นการประเมินจาก AWS public pricing สำหรับ region `ap-southeast-1` ณ Q1 2026
- ราคาจริงอาจแตกต่างตามปริมาณการใช้งาน, data transfer, และ I/O patterns
- ยังไม่รวมค่า hosting สำหรับ Next.js frontend portal (Amplify Hosting หรือ Vercel แยกต่างหาก)
- Fargate Spot pricing ประมาณ 70% discount จาก On-Demand แต่อาจเปลี่ยนแปลงตาม capacity
- Aurora Serverless v2 pricing ใน ap-southeast-1 อยู่ที่ประมาณ $0.14/ACU-hour (สูงกว่า us-east-1 ที่ $0.12)
- แนะนำให้ใช้ [AWS Pricing Calculator](https://calculator.aws/) สำหรับการประเมินที่แม่นยำยิ่งขึ้น
