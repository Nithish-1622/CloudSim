import { FastifyInstance } from 'fastify';
import { ChaosService } from '../services/chaos.service';
import { UpdateChaosConfigSchema } from '@cloudsim/shared';

export async function chaosRoutes(fastify: FastifyInstance) {
  // Get Chaos Config (GET /api/chaos)
  fastify.get('/api/chaos', async (request, reply) => {
    const config = await ChaosService.getConfig();
    return reply.send(config);
  });

  // Update Chaos Config (POST /api/chaos/config)
  fastify.post('/api/chaos/config', async (request, reply) => {
    const parseResult = UpdateChaosConfigSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid Chaos Configuration',
        details: parseResult.error.format(),
      });
    }

    const updated = await ChaosService.updateConfig(parseResult.data);
    return reply.send(updated);
  });

  // Reset Chaos Config (POST /api/chaos/reset)
  fastify.post('/api/chaos/reset', async (request, reply) => {
    const reset = await ChaosService.reset();
    return reply.send(reset);
  });
}
