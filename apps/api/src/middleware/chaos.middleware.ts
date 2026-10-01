import { FastifyRequest, FastifyReply } from 'fastify';
import { ChaosService } from '../services/chaos.service';

export async function chaosMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // Only intercept SaaS workload API paths
  if (!request.url.startsWith('/api/erp') && !request.url.startsWith('/api/crm') && !request.url.startsWith('/api/ecommerce')) {
    return;
  }

  const chaos = await ChaosService.getConfig();

  // 1. Latency Injection
  if (chaos.latencyInjectionMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, chaos.latencyInjectionMs));
  }

  // 2. Error Injection
  if (chaos.errorInjectionPercentage > 0) {
    const random = Math.random() * 100;
    if (random < chaos.errorInjectionPercentage) {
      reply.header('x-chaos-injected', 'true');
      return reply.status(500).send({
        error: 'ChaosLab Injected Failure',
        message: 'Artificially generated 500 Internal Server Error per Chaos Experiment parameters.',
        statusCode: 500,
      });
    }
  }
}
