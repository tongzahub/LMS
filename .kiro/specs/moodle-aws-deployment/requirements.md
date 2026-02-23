# Requirements Document

## Introduction

This document defines the requirements for deploying Moodle LMS on AWS infrastructure for ECV Learning Solutions. The project provisions a production-grade, serverless-first AWS environment using AWS CDK v2 (TypeScript) to host Moodle, an open-source PHP-based learning management system. The focus is on infrastructure-as-code, security, scalability, cost optimization, and operational excellence — not on customizing Moodle application code itself.

## Glossary

- **CDK_Stack**: An AWS CDK v2 construct representing a deployable unit of AWS infrastructure defined in TypeScript
- **ECS_Service**: An Amazon ECS Fargate service running containerized Moodle tasks behind an Application Load Balancer
- **Aurora_Cluster**: An Amazon Aurora Serverless v2 MySQL-compatible database cluster providing the Moodle data layer
- **ElastiCache_Cluster**: An Amazon ElastiCache Serverless (Redis/Valkey) cluster used for Moodle session and application caching
- **EFS_FileSystem**: An Amazon Elastic File System providing shared persistent storage for Moodle data across ECS tasks
- **WAF_Stack**: An AWS WAF WebACL deployed in us-east-1 and associated with the CloudFront distribution
- **VPC_Network**: An Amazon VPC spanning multiple Availability Zones with public and private subnets
- **ALB**: Application Load Balancer terminating HTTPS and distributing traffic to ECS tasks
- **CloudFront_Distribution**: An Amazon CloudFront CDN distribution for static asset caching and WAF integration
- **Secrets_Manager**: AWS Secrets Manager storing and auto-rotating database credentials, admin passwords, and API keys
- **MUC**: Moodle Universal Cache — Moodle's pluggable caching layer configured to use ElastiCache
- **Moodledata**: The shared filesystem directory (`/var/www/moodle/data`) storing user uploads, cache, and temp files on EFS
- **ACM_Certificate**: An AWS Certificate Manager TLS certificate for HTTPS termination
- **Circuit_Breaker**: ECS deployment circuit breaker that automatically rolls back failed deployments

## Requirements

### Requirement 1: VPC and Network Foundation

**User Story:** As an IT operations engineer, I want a multi-AZ VPC with properly isolated public and private subnets, so that all application components are network-isolated and highly available.

#### Acceptance Criteria

1. THE CDK_Stack SHALL provision a VPC_Network spanning at least 2 Availability Zones in the target AWS region
2. THE VPC_Network SHALL contain public subnets for the ALB and NAT Gateways and private subnets for ECS_Service, Aurora_Cluster, ElastiCache_Cluster, and EFS_FileSystem
3. THE CDK_Stack SHALL create NAT Gateways in public subnets to allow private subnet resources to reach the internet for outbound traffic
4. THE CDK_Stack SHALL provision VPC interface endpoints for ECR and a gateway endpoint for S3 to support Fargate platform version 1.4.0 and later
5. THE CDK_Stack SHALL enable VPC Flow Logs delivered to CloudWatch Logs for network traffic monitoring
6. WHEN defining security groups, THE CDK_Stack SHALL follow a least-privilege model where each component only accepts inbound traffic from its direct upstream dependency

### Requirement 2: Database Layer

**User Story:** As an IT operations engineer, I want a managed, auto-scaling MySQL-compatible database with automated backups, so that Moodle has a reliable and recoverable data store.

#### Acceptance Criteria

1. THE CDK_Stack SHALL provision an Aurora_Cluster using Aurora Serverless v2 with MySQL compatibility
2. THE Aurora_Cluster SHALL scale between a minimum of 0.5 ACU and a maximum of 10 ACU based on demand
3. THE Aurora_Cluster SHALL be deployed in a Multi-AZ configuration with reader instances in a separate Availability Zone
4. THE CDK_Stack SHALL enable automated backups on the Aurora_Cluster with a 7-day retention period
5. THE CDK_Stack SHALL store the Aurora_Cluster master credentials in Secrets_Manager with automatic rotation enabled
6. THE Aurora_Cluster SHALL encrypt data at rest using an AWS KMS key
7. THE Aurora_Cluster security group SHALL only accept inbound connections from the ECS_Service security group on the MySQL port

### Requirement 3: Caching Layer

**User Story:** As an IT operations engineer, I want dedicated, encrypted caching clusters for Moodle sessions and application cache, so that the platform delivers fast response times and supports horizontal scaling of compute.

#### Acceptance Criteria

1. THE CDK_Stack SHALL provision an ElastiCache_Cluster using ElastiCache Serverless with Redis or Valkey engine for MUC application caching
2. THE CDK_Stack SHALL provision a separate ElastiCache_Cluster for Moodle session management
3. EACH ElastiCache_Cluster SHALL scale between 1 and 100 ECPU and up to 10 GB of data storage
4. EACH ElastiCache_Cluster SHALL enforce TLS encryption for data in transit
5. EACH ElastiCache_Cluster security group SHALL only accept inbound connections from the ECS_Service security group on the Redis port

### Requirement 4: Shared File Storage

**User Story:** As an IT operations engineer, I want a shared, encrypted, auto-scaling filesystem accessible by all ECS tasks, so that Moodle user data and cache files are persistent and shared across containers.

#### Acceptance Criteria

1. THE CDK_Stack SHALL provision an EFS_FileSystem with elastic throughput mode
2. THE EFS_FileSystem SHALL enforce encryption in transit for all mount connections
3. THE CDK_Stack SHALL configure an EFS lifecycle policy to transition files not accessed for 30 days to Infrequent Access storage class
4. THE EFS_FileSystem SHALL have mount targets in each private subnet across all Availability Zones used by the VPC_Network
5. THE EFS_FileSystem security group SHALL only accept inbound NFS connections from the ECS_Service security group

### Requirement 5: Compute Layer (ECS Fargate)

**User Story:** As an IT operations engineer, I want containerized Moodle tasks running on Fargate with auto-scaling and OPcache optimization, so that the platform scales with demand and delivers fast page loads.

#### Acceptance Criteria

1. THE CDK_Stack SHALL provision an ECS_Service running Fargate tasks with 2048 CPU units and 4096 MiB of memory per task
2. THE ECS_Service SHALL use a capacity provider strategy of 75% Fargate Spot and 25% Fargate standard
3. THE CDK_Stack SHALL configure ECS auto-scaling with CPU utilization target tracking at 50% with a minimum of 1 task and a maximum of 10 tasks
4. THE ECS_Service task definition SHALL mount the EFS_FileSystem at the Moodledata path and related shared directories
5. THE ECS_Service task definition SHALL configure PHP OPcache with 256 to 512 MB memory allocation
6. THE CDK_Stack SHALL configure the ECS_Service with a Circuit_Breaker that automatically rolls back failed deployments
7. THE ECS_Service SHALL run tasks exclusively in private subnets with no public IP addresses assigned
8. THE CDK_Stack SHALL store Moodle Docker images in an Amazon ECR repository

### Requirement 6: Load Balancing and HTTPS

**User Story:** As an IT operations engineer, I want an Application Load Balancer with HTTPS termination and health checks, so that traffic is securely distributed across healthy Moodle containers.

#### Acceptance Criteria

1. THE CDK_Stack SHALL provision an ALB in the public subnets of the VPC_Network
2. THE ALB SHALL terminate HTTPS using an ACM_Certificate provisioned in the same region as the ALB
3. WHEN the ALB receives an HTTP request on port 80, THE ALB SHALL redirect the request to HTTPS on port 443
4. THE ALB SHALL perform health checks against the ECS_Service targets and only route traffic to healthy tasks
5. THE ALB security group SHALL only accept inbound traffic on ports 80 and 443

### Requirement 7: CDN and WAF

**User Story:** As an IT operations engineer, I want a CloudFront distribution with WAF protection, so that static assets are served from edge locations and the application is protected from common web exploits.

#### Acceptance Criteria

1. THE CDK_Stack SHALL provision a CloudFront_Distribution with the ALB as its origin
2. THE CloudFront_Distribution SHALL cache static assets at edge locations to reduce latency
3. THE CDK_Stack SHALL deploy a WAF_Stack in us-east-1 containing a WebACL with managed rule groups for common web exploits
4. THE WAF_Stack WebACL SHALL be associated with the CloudFront_Distribution
5. THE CloudFront_Distribution SHALL use an ACM_Certificate provisioned in us-east-1 for HTTPS
6. THE CloudFront_Distribution SHALL forward appropriate headers to the ALB origin to support Moodle session handling

### Requirement 8: Secrets and Encryption

**User Story:** As a security administrator, I want all credentials managed through Secrets Manager with auto-rotation and all data encrypted at rest and in transit, so that the platform meets enterprise security and compliance standards.

#### Acceptance Criteria

1. THE CDK_Stack SHALL store all sensitive credentials (database passwords, Moodle admin password, API keys) in Secrets_Manager
2. THE CDK_Stack SHALL enable automatic rotation on all secrets stored in Secrets_Manager
3. THE CDK_Stack SHALL enable encryption at rest for Aurora_Cluster, ElastiCache_Cluster, and EFS_FileSystem using AWS KMS keys
4. THE CDK_Stack SHALL enforce encryption in transit (TLS) for all connections between ECS_Service and Aurora_Cluster, ElastiCache_Cluster, and EFS_FileSystem
5. THE ECS_Service task definition SHALL retrieve credentials from Secrets_Manager at runtime rather than embedding them in environment variables or container images

### Requirement 9: Monitoring, Logging, and Alerting

**User Story:** As an IT operations engineer, I want centralized logging, performance metrics, and automated alerts, so that I can monitor platform health and respond to issues proactively.

#### Acceptance Criteria

1. THE CDK_Stack SHALL configure the ECS_Service to send all container logs to CloudWatch Logs
2. THE CDK_Stack SHALL create CloudWatch alarms for ECS_Service CPU utilization, memory utilization, and ALB target response time
3. THE CDK_Stack SHALL enable CloudTrail with logs delivered to an encrypted S3 bucket for API audit logging
4. THE CDK_Stack SHALL configure Aurora_Cluster event subscriptions to send SNS notifications for availability events, failure events, maintenance events, and low storage events
5. THE CDK_Stack SHALL create CloudWatch dashboards displaying key metrics for ECS_Service, Aurora_Cluster, ElastiCache_Cluster, and ALB

### Requirement 10: Moodle Container Image

**User Story:** As an IT operations engineer, I want a reproducible Moodle Docker image with proper PHP configuration and filesystem layout, so that deployments are consistent and optimized for the AWS environment.

#### Acceptance Criteria

1. THE CDK_Stack SHALL define a Dockerfile that installs Moodle with PHP and required extensions on a supported base image
2. THE Dockerfile SHALL configure the filesystem layout with application code at /var/www/moodle/html, local cache at /var/www/moodle/local, and EFS-mounted directories for data, cache, and temp
3. THE Dockerfile SHALL configure PHP OPcache settings including memory consumption between 256 and 512 MB and a high max_accelerated_files value
4. THE Dockerfile SHALL configure a Moodle cron job to execute every 1 minute as recommended by Moodle documentation
5. THE Dockerfile SHALL not contain any hardcoded credentials or secrets

### Requirement 11: CDK Project Structure and Deployment Pipeline

**User Story:** As an IT operations engineer, I want a well-structured CDK v2 TypeScript project with parameterized configuration and a clear deployment sequence, so that I can reliably deploy and update the entire infrastructure.

#### Acceptance Criteria

1. THE CDK_Stack project SHALL be written in TypeScript using AWS CDK v2
2. THE CDK_Stack project SHALL separate the WAF_Stack (deployed to us-east-1) from the main infrastructure stack (deployed to the target region)
3. THE CDK_Stack project SHALL accept configurable parameters for instance sizing, scaling limits, domain name, and AWS region
4. WHEN a developer runs the CDK deploy command, THE CDK_Stack SHALL deploy all resources in the correct dependency order
5. THE CDK_Stack project SHALL include a README documenting prerequisites, configuration parameters, and the deployment sequence
6. THE CDK_Stack project SHALL define all infrastructure as code with no manual console steps required for resource provisioning

### Requirement 12: Cost Optimization

**User Story:** As a platform administrator, I want the infrastructure to use serverless and spot capacity where possible with appropriate storage tiering, so that operational costs are minimized without sacrificing reliability.

#### Acceptance Criteria

1. THE CDK_Stack SHALL use Aurora Serverless v2, ElastiCache Serverless, and EFS with elastic throughput to enable pay-per-use scaling
2. THE CDK_Stack SHALL configure the ECS_Service capacity provider with a 75% Fargate Spot and 25% Fargate standard split
3. THE CDK_Stack SHALL configure EFS lifecycle policies to move infrequently accessed files to the Infrequent Access storage class after 30 days
4. THE CDK_Stack SHALL tag all provisioned resources with cost-allocation tags for billing visibility
