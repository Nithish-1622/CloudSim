# Database Schema & Relational Design

PostgreSQL 16 managed via Prisma ORM (`database/prisma/schema.prisma`).

## Tables
- `users`: Platform admin & user credentials
- `projects`: Simulation project organization
- `simulations`: Simulation config & status lifecycle
- `simulation_metrics`: Time-series telemetry snapshots (active users, RPS, P50/P95/P99 latency, cache hit rate)
- `workload_events`: Structured event log stream
- `students`, `attendance`, `marks`, `timetables`, `fees`, `notifications`: Student ERP tables
- `customers`, `leads`, `opportunities`: CRM Enterprise tables
- `products`, `carts`, `orders`: E-Commerce platform tables
- `chaos_configs`: Persistent chaos experiment parameters
