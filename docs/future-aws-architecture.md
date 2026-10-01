# Future AWS Architecture Migration Strategy

This document outlines how the local CloudSim implementation maps directly to AWS services for Phase 2:

| Local Component | Target AWS Service | Migration Rationale |
| :--- | :--- | :--- |
| Next.js App (`apps/web`) | **S3 + CloudFront** | Static asset hosting with edge CDN caching and global low latency. |
| Fastify Control API (`apps/api`) | **ECS / Fargate + ALB** | Containerized REST & WebSocket server behind Application Load Balancer. |
| PostgreSQL DB (`database`) | **RDS PostgreSQL Multi-AZ** | Managed relational persistence with automated failover and snapshots. |
| Redis Cache & PubSub | **ElastiCache for Redis** | Fully managed in-memory caching and real-time messaging cluster. |
| Local Queue (`SimulationQueue`) | **AWS SQS (Simple Queue Service)** | Decoupled asynchronous job queue with dead-letter queue (DLQ) support. |
| Simulation Worker (`workers`) | **ECS / Fargate Worker Tasks** | Auto-scaling worker tasks consuming jobs from SQS. |
| SaaS Workloads | **Serverless Lambda / ECS** | Microservices target environment for simulated workloads. |
| Chaos Controller | **AWS FIS (Fault Injection Service)** | Managed chaos engineering experiments on AWS resources. |
| Observability & Metrics | **Amazon CloudWatch & X-Ray** | Metric collection, alarm triggers, and distributed tracing. |
| Auth & Security | **Cognito + WAF + KMS** | Managed identity pool, layer-7 firewall, and encryption keys. |
