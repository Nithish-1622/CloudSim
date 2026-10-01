# CloudSim — Project Progress & Local Architecture Specification

---

## 1. Project Summary
**CloudSim** is a cloud simulation and SaaS workload playground designed for local development and cloud architecture experimentation. It enables engineering teams to simulate high-concurrency SaaS workloads (Student ERP, CRM, and E-Commerce), configure logical virtual user populations, enforce custom traffic patterns (SPIKE, RAMP_UP, BURST, FLASH_SALE, CHAOS), observe live WebSocket telemetry, interact with logical cloud infrastructure diagrams, and run safe local chaos engineering experiments.

---

## 2. Current Architecture
CloudSim is organized into three strictly decoupled architectural planes:

```text
               ┌──────────────────────────────────────────────┐
               │                CONTROL PLANE                 │
               │   Next.js Dashboard  ↔  Fastify REST API     │
               └──────────────────────┬───────────────────────┘
                                      │ Enqueue Jobs
                                      ▼
               ┌──────────────────────────────────────────────┐
               │               SIMULATION PLANE               │
               │  Redis Queue  →  Worker  →  Engine & undici   │
               └──────────────────────┬───────────────────────┘
                                      │ Stream Telemetry
                                      ▼
               ┌──────────────────────────────────────────────┐
               │             OBSERVABILITY PLANE              │
               │  WebSocket Stream  ↔  PostgreSQL Time-Series  │
               └──────────────────────────────────────────────┘
```

- **Control Plane:** Web dashboard UI, user authentication, simulation configuration validation, project lifecycle management, and Fastify REST API handlers for SaaS workloads.
- **Simulation Plane:** Asynchronous non-blocking virtual user engine, traffic pattern generator algorithms, scenario step selector, HTTP request execution with `undici`, and Redis job queue consumer.
- **Observability Plane:** Real-time telemetry broadcasting over WebSocket (`ws://localhost:4000`), metric snapshot history in PostgreSQL, and chaos failure incident tracking.

---

## 3. Technology Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React Icons, Recharts.
- **Backend:** Node.js 22, Fastify, TypeScript, `@fastify/cors`, `@fastify/websocket`, Zod.
- **Database:** PostgreSQL 16, Prisma ORM 6.
- **Cache & Queue:** Redis 7, `ioredis`, `SimulationQueue` Redis List & Pub/Sub Abstraction.
- **HTTP Client:** `undici` (high-performance connection pooling agent).
- **Containerization:** Docker, Docker Compose.
- **Testing:** Vitest, `tsx`.

---

## 4. Repository Structure
```text
cloudsim/
├── apps/
│   ├── web/                    # Next.js 14 App Router Frontend Dashboard
│   └── api/                    # Fastify Control Plane API Server
├── packages/
│   └── shared/                 # Shared Types, Zod Schemas & Constants
├── database/                   # Prisma Schema, Seeds & Migrations
├── simulator/                  # Asynchronous Concurrency Simulation Engine
├── workers/                    # Redis-backed Simulation Worker Processes
├── docs/                       # Comprehensive System Documentation (12 MD files)
├── scripts/                    # Benchmark Suite & Utility Scripts
├── tests/                      # Vitest Automated Test Suite
├── docker-compose.yml          # Container Orchestration
├── package.json                # Monorepo Workspace Configuration
├── .env.example                # Environment Variable Template
├── README.md                   # System Architecture & Setup Guide
└── PROJECT_PROGRESS.md         # Final Master Progress & Verification Document
```

---

## 5. Implemented Features
- [x] Control Plane REST API for Student ERP, CRM, and E-Commerce workloads.
- [x] High-concurrency logical Virtual User engine supporting up to 1,000,000 users.
- [x] 7 Traffic Pattern Algorithms: `NORMAL`, `RAMP_UP`, `RAMP_DOWN`, `SPIKE`, `BURST`, `FLASH_SALE`, `CHAOS`.
- [x] Async Job Queue (`SimulationQueue`) backed by Redis.
- [x] Real-time WebSocket metric streaming (`WS /api/simulations/:id/stream`).
- [x] Interactive AWS Architecture Map with Local Equivalent Modal Inspector.
- [x] Safe Local Chaos Lab (Artificial Latency Injection, 500 Error Injection, Cache Bypass, Traffic Spike Trigger).
- [x] Redis caching with response header tracking (`X-Cache: HIT` / `MISS`).
- [x] Request Correlation Headers (`x-request-id`, `x-simulation-id`, `x-virtual-user-id`).
- [x] Empirical Benchmark Suite measuring CPU, RAM, RPS, P50/P95/P99 latency, and Error Rate.

---

## 6. Frontend
- **Dark Cloud Aesthetic:** Slate `#090d16` background, cyan/indigo glow effects, technical glassmorphism cards.
- **Routes Implemented:**
  - `/login` — Dev credentials authentication portal.
  - `/dashboard` — System-wide KPI metrics, recent simulations, quick launch modal.
  - `/playground` — Cards for Student ERP, CRM, E-Commerce, characteristics, and workload distribution.
  - `/playground/erp` — Interactive Student ERP endpoint tester.
  - `/playground/crm` — Interactive CRM Enterprise endpoint tester.
  - `/playground/ecommerce` — Interactive E-Commerce endpoint tester.
  - `/simulations` — Filterable history of all simulation runs.
  - `/simulations/[id]` — Real-time WebSocket inspector with live gauges, Recharts trajectory line charts, endpoint statistics table, and event logs.
  - `/infrastructure` — Interactive AWS Architecture Diagram with local component modal details.
  - `/metrics` — Aggregate charts for RPS, Users, Latency percentiles, Error %, Throughput, Cache Hit %.
  - `/incidents` — Chaos experiment anomaly and failure incident audit stream.
  - `/chaos` — Chaos Lab control panel sliders and toggle switches.
  - `/settings` — Local execution limits and connection strings.

---

## 7. Backend
- **Framework:** Fastify TypeScript API running on `http://localhost:4000`.
- **API Routes:**
  - `POST /api/simulations` — Queue simulation job.
  - `GET /api/simulations` — List simulation runs.
  - `GET /api/simulations/:id` — Get single simulation detail.
  - `POST /api/simulations/:id/cancel` — Cancel active simulation run.
  - `GET /api/simulations/:id/metrics` — Historical time-series metrics.
  - `GET /api/simulations/:id/events` — Workload event logs.
  - `WS /api/simulations/:id/stream` — WebSocket live telemetry stream.
  - `GET /api/chaos`, `POST /api/chaos/config`, `POST /api/chaos/reset` — Chaos Lab controls.
  - `GET /api/infrastructure`, `GET /api/system/metrics` — Dashboard stats.
  - `/api/erp/*`, `/api/crm/*`, `/api/ecommerce/*` — SaaS Workload endpoints.

---

## 8. Database
- **PostgreSQL 16 Schema:**
  - `users`, `projects`, `simulations`, `simulation_metrics`, `workload_events`
  - `students`, `attendance`, `marks`, `timetables`, `fees`, `notifications` (Student ERP)
  - `customers`, `leads`, `opportunities` (CRM)
  - `products`, `carts`, `orders` (E-Commerce)
  - `chaos_configs` (Chaos experiment state)

---

## 9. Simulation Engine
- **Logical Virtual Users:** Asynchronous entities represented as lightweight state objects. 1 process runs up to 1,000,000 logical users without creating browser instances.
- **Traffic Pattern Algorithms:**
  - `NORMAL`: 100% target RPS with ±5% natural variance.
  - `RAMP_UP`: Linear increase 10% → 100% over total duration.
  - `RAMP_DOWN`: Linear decrease 100% → 10% over total duration.
  - `SPIKE`: 20% baseline surging to 250% during mid-run 35%-65% window.
  - `BURST`: 5-second alternating bursts between 160% and 30%.
  - `FLASH_SALE`: 300% initial surge followed by exponential decay.
  - `CHAOS`: Sine wave oscillation + pseudo-random noise wave.
- **Concurrency & HTTP Client:** `undici` Agent with persistent connection pooling and request correlation headers.

---

## 10. Worker System
- **Queue Architecture:** Redis-backed `SimulationQueue` supporting `enqueue`, `dequeue`, `acknowledge`, and `retry`.
- **Worker Process:** Polling worker in `workers/src/simulation-worker.ts` executing jobs via `JobHandler` and `SimulationEngine`.

---

## 11. Redis
- **Use Cases:**
  1. Caching GET endpoint responses (Student ERP profiles, timetables, CRM customers, E-Commerce product catalog) to measure hit/miss rates.
  2. Asynchronous simulation job queue list storage (`cloudsim:queue:simulations`).
  3. Real-time Pub/Sub live metric snapshot transport (`cloudsim:metrics:<id>`).

---

## 12. Docker
- `docker-compose.yml` configures:
  - `postgres` (port 5432)
  - `redis` (port 6379)
  - `api` (port 4000)
  - `web` (port 3000)
  - `worker`

---

## 13. API Documentation
Detailed request and response models documented in `docs/api.md`.

---

## 14. Environment Variables
- `DATABASE_URL`
- `REDIS_URL`
- `API_PORT`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL`
- `JWT_SECRET`
- `MAX_LOCAL_VIRTUAL_USERS`
- `MAX_LOCAL_TARGET_RPS`

---

## 15. Testing
Automated test suite (`vitest`) verifying:
- Traffic generator algorithms (`NORMAL`, `SPIKE`, `RAMP_UP`)
- Workload selector probability distributions
- MetricsCollector percentile precision (P50, P95, P99)
- Local queue abstraction enqueue, dequeue, and acknowledge

**Test Results:**
```text
✓ tests/simulator.test.ts (4 tests)
✓ tests/worker.test.ts (1 test)
Test Files: 2 passed (2)
Tests: 5 passed (5)
```

---

## 16. Performance Benchmarks (Empirical Results)
Measured via `scripts/benchmark.ts` against local API server:

| Logical Users | Target RPS | Achieved RPS | P50 (ms) | P95 (ms) | P99 (ms) | Error Rate | Heap Memory (MB) | Memory Delta (MB) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **100** | 100 RPS | 61.8 req/s | 48 ms | 240 ms | 2964 ms | 0% | 38.2 MB | +13.73 MB |
| **1,000** | 1,000 RPS | 665.2 req/s | 132 ms | 198 ms | 210 ms | 0% | 51.1 MB | +12.88 MB |
| **10,000** | 1,000 RPS | 730.7 req/s | 115 ms | 185 ms | 211 ms | 0% | 114.0 MB | +62.94 MB |
| **100,000** | 1,000 RPS | 713.3 req/s | 123 ms | 190 ms | 213 ms | 0% | 63.4 MB | -50.61 MB |

*Note: All benchmark runs achieved 0% request failure rate under async promise concurrency.*

---

## 17. Known Issues
- Extremely high RPS (>10,000 req/s) on low-end local dual-core machines may experience OS network socket exhaustion (port reuse delays).

---

## 18. Technical Decisions
Documented in `docs/architecture-decisions.md` (ADR 1: Fastify over Express; ADR 2: Queue Abstraction over raw Redis commands; ADR 3: Async Promises over Browser instances).

---

## 19. Future AWS Mapping
Documented in `docs/future-aws-architecture.md`. Next.js → CloudFront+S3, Fastify → ECS Fargate+ALB, Postgres → RDS, Redis → ElastiCache, Local Queue → SQS, Workers → ECS Worker Tasks.

---

## 20. AWS Phase Readiness
The entire local application is modularized into clean packages (`@cloudsim/shared`, `@cloudsim/database`, `@cloudsim/simulator`, `@cloudsim/workers`, `@cloudsim/api`, `@cloudsim/web`) with zero direct coupling to cloud provider SDKs, enabling a seamless migration to AWS infrastructure in Phase 2.

---

## 21. Not Implemented (AWS Phase 2 Scope)
- AWS Terraform IaC files
- AWS ECS Task definitions
- AWS SQS queues & SNS topics
- AWS ElastiCache cluster configuration
- AWS CloudFront distributions & WAF rules
- AWS Cognito Identity Pools
- AWS CloudWatch Alarms & X-Ray Tracing
