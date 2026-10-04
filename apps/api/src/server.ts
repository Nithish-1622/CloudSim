import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { chaosMiddleware } from './middleware/chaos.middleware';
import { simulationsRoutes } from './routes/simulations.routes';
import { chaosRoutes } from './routes/chaos.routes';
import { infrastructureRoutes } from './routes/infrastructure.routes';
import { erpRoutes } from './routes/erp.routes';
import { crmRoutes } from './routes/crm.routes';
import { ecommerceRoutes } from './routes/ecommerce.routes';

const PORT = parseInt(process.env.API_PORT || '4000', 10);
const HOST = process.env.API_HOST || '0.0.0.0';

export async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
    },
  });

  // Plugins
  await fastify.register(cors, { origin: true });
  await fastify.register(websocket);

  // Request Correlation ID Middleware
  fastify.addHook('onRequest', async (request, reply) => {
    const reqId = (request.headers['x-request-id'] as string) || `req-${Math.random().toString(36).substring(2, 9)}`;
    reply.header('x-request-id', reqId);
  });

  // Chaos Middleware for SaaS Workloads
  fastify.addHook('preHandler', chaosMiddleware);

  // Healthcheck endpoint
  fastify.get('/health', async () => ({ status: 'UP', service: 'CloudSim Control Plane API', timestamp: new Date() }));

  // Register Route Modules
  await fastify.register(simulationsRoutes);
  await fastify.register(chaosRoutes);
  await fastify.register(infrastructureRoutes);
  await fastify.register(erpRoutes);
  await fastify.register(crmRoutes);
  await fastify.register(ecommerceRoutes);

  return fastify;
}

if (require.main === module) {
  buildServer()
    .then((fastify) => {
      fastify.listen({ port: PORT, host: HOST }, (err, address) => {
        if (err) {
          fastify.log.error(err);
          process.exit(1);
        }
        console.log(`🚀 CloudSim Fastify API Server running at ${address}`);
      });
    })
    .catch((err) => {
      console.error('Fatal API bootstrap error:', err);
      process.exit(1);
    });
}
