import { FastifyInstance } from 'fastify';
import { prisma } from '@cloudsim/database';
import { INFRASTRUCTURE_COMPONENTS, LogicalInfraComponent } from '@cloudsim/shared';

export async function infrastructureRoutes(fastify: FastifyInstance) {
  // Logical AWS Architecture Components (GET /api/infrastructure)
  fastify.get('/api/infrastructure', async (request, reply) => {
    // Get live metrics from recent simulations to populate infrastructure component stats dynamically
    const recentMetrics = await prisma.simulationMetric.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    const components = INFRASTRUCTURE_COMPONENTS.map((comp: LogicalInfraComponent) => {
      const copy = { ...comp, metrics: { ...comp.metrics } };
      if (recentMetrics && copy.metrics) {
        if (copy.category === 'COMPUTE' || copy.category === 'LOAD_BALANCER' || copy.category === 'CDN') {
          copy.metrics.rps = recentMetrics.currentRps;
          copy.metrics.latencyMs = recentMetrics.avgLatencyMs;
        }
        if (copy.category === 'CACHE') {
          copy.metrics.cacheHitRate = recentMetrics.cacheHitRate;
        }
      }
      return copy;
    });

    return reply.send({
      disclaimer: 'LOGICAL AWS ARCHITECTURE — LOCAL EQUIVALENT ENVIRONMENT',
      components,
    });
  });

  // System Overall Dashboard Metrics (GET /api/system/metrics)
  fastify.get('/api/system/metrics', async (request, reply) => {
    const totalSimulations = await prisma.simulation.count();
    const activeSimulations = await prisma.simulation.count({
      where: { status: { in: ['STARTING', 'RUNNING'] } },
    });
    const completedSimulations = await prisma.simulation.count({
      where: { status: 'COMPLETED' },
    });
    const failedSimulations = await prisma.simulation.count({
      where: { status: 'FAILED' },
    });

    const simAggregate = await prisma.simulation.aggregate({
      _sum: {
        virtualUsers: true,
      },
    });

    const recentMetric = await prisma.simulationMetric.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    const recentSims = await prisma.simulation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return reply.send({
      totalSimulations,
      activeSimulations,
      completedSimulations,
      failedSimulations,
      totalLogicalUsersSimulated: simAggregate._sum.virtualUsers || 0,
      totalRequests: recentMetric?.totalRequests || 0,
      avgLatencyMs: recentMetric?.avgLatencyMs || 0,
      p50LatencyMs: recentMetric?.p50LatencyMs || 0,
      p95LatencyMs: recentMetric?.p95LatencyMs || 0,
      p99LatencyMs: recentMetric?.p99LatencyMs || 0,
      errorRatePercentage: recentMetric?.errorRatePercentage || 0,
      recentSimulations: recentSims,
    });
  });
}
