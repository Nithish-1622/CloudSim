# CloudSim — Cloud Simulation & SaaS Workload Playground

**CloudSim** is a local control plane and high-concurrency simulation engine for testing, observing, and benchmarking distributed SaaS workload behavior before cloud deployment.

---

## 🏗️ Architecture Overview

CloudSim is divided into three distinct planes:

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

---

## ✨ Key Features

1. **Simulated SaaS Workloads:**
   - **Student ERP:** Profile, Attendance, Marks, Timetables, Fees, Notifications.
   - **CRM Enterprise:** Customer lookup, Leads pipeline, Opportunities, Revenue Reports.
   - **E-Commerce:** Product catalog search, Cart operations, Checkout, Order History.

2. **Traffic Generators:**
   - `NORMAL` (steady baseline)
   - `RAMP_UP` (gradual climb)
   - `RAMP_DOWN` (gradual drop)
   - `SPIKE` (mid-run surge)
   - `BURST` (oscillating surges)
   - `FLASH_SALE` (initial spike with decay)
   - `CHAOS` (unpredictable wave)

3. **Logical Virtual Users:**
   - Simulates up to **1,000,000 logical users** per worker using Node.js asynchronous promises and `undici` HTTP connection pooling without launching bloated browser processes.

4. **Observability & Live Metrics:**
   - Real-time WebSocket metric stream (`WS /api/simulations/:id/stream`).
   - Percentile calculation (P50, P95, P99) and endpoint-level latency tracking.
   - Recharts dynamic trajectory line charts and KPI scorecards.

5. **Logical Infrastructure Map:**
   - Interactive diagram labeling **LOGICAL AWS ARCHITECTURE — NOT DEPLOYED** with local node modal inspector.

6. **Safe Local Chaos Lab:**
   - Artificial Latency Injection (+ms), 500 Error Injection (%), Redis Cache Bypass, and Traffic Surge toggles.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React, Recharts
- **Backend API:** Node.js 22, Fastify, TypeScript, `@fastify/websocket`, Zod
- **Database:** PostgreSQL 16, Prisma ORM 6
- **Cache & Queue:** Redis 7, `ioredis`, `SimulationQueue` abstraction
- **Containerization:** Docker, Docker Compose
- **Testing & Benchmarking:** Vitest, `tsx`

---

## ⚡ Quick Start (Local Setup)

### 1. Prerequisites
- Node.js >= 22.x
- Docker & Docker Compose

### 2. Setup Environment
```bash
cp .env.example .env
```

### 3. Install Monorepo Dependencies
```bash
npm install
```

### 4. Build Monorepo Packages
```bash
npm run build
```

### 5. Launch Infrastructure with Docker Compose
```bash
docker compose up --build
```

### 6. Seed Database
```bash
npm run seed
```

---

## 🧪 Running Tests & Benchmarks

### Run Automated Vitest Suite
```bash
npm run test
```

### Run Simulator Benchmark Suite
```bash
npm run benchmark
```

---

## 🌐 Application URLs

- **Dashboard UI:** http://localhost:3000
- **Fastify API Server:** http://localhost:4000
- **API Health Check:** http://localhost:4000/health
- **PostgreSQL Database:** `localhost:5432` (`user: cloudsim`, `db: cloudsim_db`)
- **Redis Cache:** `localhost:6379`

---

## ☁️ Future AWS Architecture Mapping

| Local Component | Target AWS Service |
| :--- | :--- |
| Next.js App (`apps/web`) | **S3 + CloudFront** |
| Fastify API (`apps/api`) | **ECS / Fargate + ALB** |
| PostgreSQL DB (`database`) | **RDS PostgreSQL Multi-AZ** |
| Redis Cache | **ElastiCache for Redis** |
| Local Queue (`SimulationQueue`) | **AWS SQS (Simple Queue Service)** |
| Simulation Worker (`workers`) | **ECS / Fargate Worker Tasks** |