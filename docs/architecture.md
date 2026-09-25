# CloudSim Local Architecture

CloudSim is conceptually divided into three decoupled planes:

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
                                      │ Stream Metrics
                                      ▼
               ┌──────────────────────────────────────────────┐
               │             OBSERVABILITY PLANE              │
               │  WebSocket Stream  ↔  PostgreSQL Time-Series  │
               └──────────────────────────────────────────────┘
```

## Planes Breakdown

### 1. Control Plane
- **Responsibilities:** User authentication, simulation configuration validation, project management, queue dispatch, REST API handlers for SaaS endpoints.
- **Components:** Next.js App Router (`apps/web`), Fastify TypeScript API (`apps/api`), Zod Schema Validation (`packages/shared`).

### 2. Simulation Plane
- **Responsibilities:** High-concurrency virtual user loop, traffic pattern generation, workload scenario execution, HTTP request execution using `undici`, in-memory percentile calculation.
- **Components:** Simulation Worker (`workers`), Simulation Engine (`simulator`), Redis Queue Abstraction (`SimulationQueue`).

### 3. Observability Plane
- **Responsibilities:** Live telemetry streaming over WebSocket (`ws://localhost:4000`), metric snapshot storage in PostgreSQL, chaos incident auditing.
- **Components:** `@fastify/websocket`, Redis Pub/Sub, PostgreSQL (`simulation_metrics`, `workload_events`).
