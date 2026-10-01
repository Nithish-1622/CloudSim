# CloudSim Simulation Engine

The simulation engine is designed for high-concurrency non-blocking workload generation.

## Virtual Users
Virtual users are **logical entities**, not OS processes or browser windows.
- 1 worker process handles up to 1,000,000 logical virtual users via non-blocking Promise loops.
- `VirtualUser` tracks session state, application profile, and generates the next operation request action.

## Traffic Generators
Calculates target RPS and active virtual users dynamically every tick (500ms):
- `NORMAL`: Stable traffic with ±5% natural jitter.
- `RAMP_UP`: Linear ramp from 10% to 100% target RPS over total duration.
- `RAMP_DOWN`: Linear decline from 100% to 10% target RPS over total duration.
- `SPIKE`: Mid-run traffic surge (250% of target RPS) during 35%-65% duration window.
- `BURST`: Alternating 5-second bursts between 160% and 30% of target RPS.
- `FLASH_SALE`: Immediate 300% surge followed by exponential decay.
- `CHAOS`: Unpredictable sine wave oscillation + random noise.

## Request Execution
- Uses Node `undici` `Agent` with persistent HTTP keep-alive connection pooling.
- Attaches request correlation headers: `x-request-id`, `x-simulation-id`, `x-virtual-user-id`.
