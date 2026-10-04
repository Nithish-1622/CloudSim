import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';
import { prisma } from '@cloudsim/database';
import { CreateSimulationSchema } from '@cloudsim/shared';
import { RedisSimulationQueue } from '@cloudsim/workers';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const queue = new RedisSimulationQueue(REDIS_URL);

export async function simulationsRoutes(fastify: FastifyInstance) {
  // Create Simulation (POST /api/simulations)
  fastify.post('/api/simulations', async (request, reply) => {
    const parseResult = CreateSimulationSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid Simulation Configuration',
        details: parseResult.error.format(),
      });
    }

    const input = parseResult.data;

    // Default project
    const project = await prisma.project.findFirst();

    const simulation = await prisma.simulation.create({
      data: {
        name: input.name || `${input.application.toUpperCase()} Workload Run`,
        description: input.description || `Simulated ${input.virtualUsers.toLocaleString()} virtual users targeting ${input.targetRps} RPS`,
        projectId: project?.id,
        application: input.application,
        virtualUsers: input.virtualUsers,
        targetRps: input.targetRps,
        durationSeconds: input.durationSeconds,
        trafficPattern: input.trafficPattern,
        cacheEnabled: input.cacheEnabled,
        intensity: input.intensity,
        status: 'QUEUED',
      },
    });

    await prisma.workloadEvent.create({
      data: {
        simulationId: simulation.id,
        eventType: 'INFO',
        message: 'Simulation created and submitted to queue.',
      },
    });

    // Enqueue job to simulation queue
    await queue.enqueue({
      id: `job-${simulation.id}`,
      simulationId: simulation.id,
      config: {
        application: input.application,
        virtualUsers: input.virtualUsers,
        targetRps: input.targetRps,
        durationSeconds: input.durationSeconds,
        trafficPattern: input.trafficPattern,
        cacheEnabled: input.cacheEnabled,
        intensity: input.intensity,
      },
    });

    return reply.status(201).send(simulation);
  });

  // List Simulations (GET /api/simulations)
  fastify.get('/api/simulations', async (request, reply) => {
    const simulations = await prisma.simulation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    return reply.send(simulations);
  });

  // Get Single Simulation Detail (GET /api/simulations/:id)
  fastify.get('/api/simulations/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const simulation = await prisma.simulation.findUnique({
      where: { id },
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
        events: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
    });

    if (!simulation) {
      return reply.status(404).send({ error: 'Simulation not found' });
    }

    return reply.send(simulation);
  });

  // Cancel Simulation (POST /api/simulations/:id/cancel)
  fastify.post('/api/simulations/:id/cancel', async (request, reply) => {
    const { id } = request.params as { id: string };
    const simulation = await prisma.simulation.update({
      where: { id },
      data: { status: 'CANCELLED', completedAt: new Date() },
    });

    await prisma.workloadEvent.create({
      data: {
        simulationId: id,
        eventType: 'WARN',
        message: 'Simulation manually cancelled via API endpoint.',
      },
    });

    return reply.send(simulation);
  });

  // Get Metrics History (GET /api/simulations/:id/metrics)
  fastify.get('/api/simulations/:id/metrics', async (request, reply) => {
    const { id } = request.params as { id: string };
    const metrics = await prisma.simulationMetric.findMany({
      where: { simulationId: id },
      orderBy: { timestamp: 'asc' },
    });

    return reply.send(metrics);
  });

  // Get Workload Events / Logs (GET /api/simulations/:id/events)
  fastify.get('/api/simulations/:id/events', async (request, reply) => {
    const { id } = request.params as { id: string };
    const events = await prisma.workloadEvent.findMany({
      where: { simulationId: id },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return reply.send(events);
  });

  // WebSocket Live Metrics Streaming (WS /api/simulations/:id/stream)
  fastify.get('/api/simulations/:id/stream', { websocket: true }, (connection, req) => {
    const { id } = req.params as { id: string };
    console.log(`🔌 Client connected to WebSocket live stream for simulation [${id}]`);

    const subRedis = new Redis(REDIS_URL, { lazyConnect: true });
    const channel = `cloudsim:metrics:${id}`;

    subRedis.connect().then(() => {
      subRedis.subscribe(channel);
      subRedis.subscribe('cloudsim:metrics:global');
    }).catch(() => {});

    subRedis.on('message', (chan, message) => {
      try {
        connection.socket.send(message);
      } catch (err) {}
    });

    connection.socket.on('close', () => {
      console.log(`🔌 Client disconnected from WebSocket stream [${id}]`);
      subRedis.quit();
    });
  });
}
