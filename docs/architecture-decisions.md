# Architecture Decision Records (ADR)

## ADR 1: Node.js + Fastify over Express or Python
- **Context:** Need high-throughput non-blocking asynchronous REST/WS API.
- **Decision:** Use Fastify with Node.js 22.
- **Reason:** Fastify offers lower overhead, schema validation integration, native TypeScript support, and high RPS capabilities.
- **Future AWS Equivalent:** ECS Fargate task behind Application Load Balancer.

## ADR 2: Redis List SimulationQueue Abstraction over direct Redis dependence
- **Context:** Decouple queue consumption from implementation details for future cloud migration.
- **Decision:** Build an `ISimulationQueue` interface wrapping Redis commands (`RPUSH`, `BLPOP`).
- **Reason:** Allows swapping Redis for AWS SQS in Phase 2 without modifying API or worker handlers.
- **Future AWS Equivalent:** AWS Simple Queue Service (SQS).

## ADR 3: Async Promises & `undici` over OS Browser Instances
- **Context:** Simulate 100,000+ virtual users locally without exhausting RAM/CPU.
- **Decision:** Logical Virtual Users running asynchronous promise batches using `undici` HTTP Agent.
- **Reason:** Running full browser sessions for 100k users requires thousands of GBs of RAM. Logical virtual users require only minimal heap memory.
- **Future AWS Equivalent:** Distributed ECS task clusters.
