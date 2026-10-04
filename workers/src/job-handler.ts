import Redis from 'ioredis';
import { prisma } from '@cloudsim/database';
import { SimulationEngine } from '@cloudsim/simulator';
import { MetricSnapshot } from '@cloudsim/shared';
import { SimulationJob } from './queue-abstraction';

export class JobHandler {
  private pubRedis: Redis | null = null;
  private apiBaseUrl: string;

  constructor(redisUrl?: string, apiBaseUrl = 'http://localhost:4000') {
    this.apiBaseUrl = apiBaseUrl;
    if (redisUrl) {
      try {
        this.pubRedis = new Redis(redisUrl, {
          lazyConnect: true,
        });
        this.pubRedis.connect().catch(() => {
          this.pubRedis = null;
        });
      } catch (err) {
        this.pubRedis = null;
      }
    }
  }

  public async processJob(job: SimulationJob): Promise<void> {
    const { simulationId, config } = job;
    console.log(`▶️ Processing simulation job [${simulationId}] for app: ${config.application}`);

    // Update simulation status to STARTING
    await prisma.simulation.update({
      where: { id: simulationId },
      data: {
        status: 'STARTING',
        startedAt: new Date(),
      },
    });

    await prisma.workloadEvent.create({
      data: {
        simulationId,
        eventType: 'STATUS_CHANGE',
        message: 'Simulation status transitioned from QUEUED to STARTING',
      },
    });

    // Update to RUNNING
    await prisma.simulation.update({
      where: { id: simulationId },
      data: { status: 'RUNNING' },
    });

    const engine = new SimulationEngine({
      config,
      simulationId,
      baseUrl: this.apiBaseUrl,

      onSnapshot: async (snapshot: MetricSnapshot) => {
        // 1. Publish live metric snapshot over Redis Pub/Sub
        if (this.pubRedis && this.pubRedis.status === 'ready') {
          const channel = `cloudsim:metrics:${simulationId}`;
          await this.pubRedis.publish(channel, JSON.stringify(snapshot));
          await this.pubRedis.publish('cloudsim:metrics:global', JSON.stringify(snapshot));
        }

        // 2. Periodically persist snapshot to database
        try {
          await prisma.simulationMetric.create({
            data: {
              simulationId,
              timestamp: new Date(snapshot.timestamp),
              activeUsers: snapshot.activeUsers,
              currentRps: snapshot.currentRps,
              targetRps: snapshot.targetRps,
              totalRequests: snapshot.totalRequests,
              successfulRequests: snapshot.successfulRequests,
              failedRequests: snapshot.failedRequests,
              avgLatencyMs: snapshot.avgLatencyMs,
              p50LatencyMs: snapshot.p50LatencyMs,
              p95LatencyMs: snapshot.p95LatencyMs,
              p99LatencyMs: snapshot.p99LatencyMs,
              minLatencyMs: snapshot.minLatencyMs,
              maxLatencyMs: snapshot.maxLatencyMs,
              errorRatePercentage: snapshot.errorRatePercentage,
              cacheHitRate: snapshot.cacheHitRate,
              throughputKbps: snapshot.throughputKbps,
              endpointMetrics: snapshot.endpointMetrics as any,
            },
          });
        } catch (dbErr) {
          // Ignore transient DB metric persist errors
        }
      },

      onEvent: async (eventType: string, message: string, meta?: any) => {
        try {
          await prisma.workloadEvent.create({
            data: {
              simulationId,
              eventType,
              message,
              metadata: meta || undefined,
            },
          });
        } catch (err) {}
      },

      isCancelledCheck: async () => {
        const sim = await prisma.simulation.findUnique({
          where: { id: simulationId },
          select: { status: true },
        });
        return sim?.status === 'CANCELLED';
      },
    });

    try {
      const finalSnapshot = await engine.run();

      const currentStatus = (
        await prisma.simulation.findUnique({
          where: { id: simulationId },
          select: { status: true },
        })
      )?.status;

      if (currentStatus !== 'CANCELLED') {
        await prisma.simulation.update({
          where: { id: simulationId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        await prisma.workloadEvent.create({
          data: {
            simulationId,
            eventType: 'STATUS_CHANGE',
            message: `Simulation completed successfully. Total requests: ${finalSnapshot.totalRequests}`,
          },
        });
      }
    } catch (err: any) {
      console.error(`❌ Simulation job failed [${simulationId}]:`, err);
      await prisma.simulation.update({
        where: { id: simulationId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
        },
      });

      await prisma.workloadEvent.create({
        data: {
          simulationId,
          eventType: 'ERROR',
          message: `Simulation execution failed: ${err?.message || 'Unknown error'}`,
        },
      });
    }
  }

  public async close(): Promise<void> {
    if (this.pubRedis) {
      await this.pubRedis.quit();
    }
  }
}
