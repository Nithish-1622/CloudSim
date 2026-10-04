import { FastifyInstance } from 'fastify';
import { prisma } from '@cloudsim/database';
import { RedisService } from '../services/redis.service';
import { ChaosService } from '../services/chaos.service';

export async function crmRoutes(fastify: FastifyInstance) {
  // CRM Login
  fastify.post('/api/crm/auth/login', async (request, reply) => {
    return reply.send({
      success: true,
      token: `crm-token-${Date.now()}`,
      user: { name: 'Sales Agent', role: 'ACCOUNT_EXECUTIVE' },
    });
  });

  // Get Customers List (GET /api/crm/customers)
  fastify.get('/api/crm/customers', async (request, reply) => {
    const chaos = await ChaosService.getConfig();
    const cacheKey = 'crm:customers:all';

    if (!chaos.cacheDisabled) {
      const cached = await RedisService.get(cacheKey);
      if (cached) {
        reply.header('X-Cache', 'HIT');
        return reply.send(JSON.parse(cached));
      }
    }

    reply.header('X-Cache', 'MISS');
    const customers = await prisma.customer.findMany({ take: 20 });

    if (!chaos.cacheDisabled) {
      await RedisService.set(cacheKey, JSON.stringify(customers), 30);
    }

    return reply.send(customers);
  });

  // Get Single Customer Detail (GET /api/crm/customers/:id)
  fastify.get('/api/crm/customers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    reply.header('X-Cache', 'MISS');

    const customer = await prisma.customer.findFirst({
      where: { id },
      include: { leads: true, opportunities: true },
    });

    return reply.send(
      customer || {
        id,
        name: 'Acme Corp Executive',
        company: 'Acme Corp',
        industry: 'Retail',
        status: 'ACTIVE',
      }
    );
  });

  // Get Leads (GET /api/crm/leads)
  fastify.get('/api/crm/leads', async (request, reply) => {
    reply.header('X-Cache', 'MISS');
    const leads = await prisma.lead.findMany({ take: 20 });
    return reply.send(leads);
  });

  // Create Lead (POST /api/crm/leads)
  fastify.post('/api/crm/leads', async (request, reply) => {
    const body = (request.body as any) || {};
    reply.header('X-Cache', 'MISS');

    const lead = await prisma.lead.create({
      data: {
        title: body.title || 'New Inbound Lead',
        value: body.value || 25000.0,
        status: body.status || 'NEW',
        source: body.source || 'API Simulation',
      },
    });

    return reply.status(201).send(lead);
  });

  // Get Opportunities (GET /api/crm/opportunities)
  fastify.get('/api/crm/opportunities', async (request, reply) => {
    reply.header('X-Cache', 'MISS');
    const opps = await prisma.opportunity.findMany({ take: 20 });
    return reply.send(opps);
  });

  // Create Opportunity (POST /api/crm/opportunities)
  fastify.post('/api/crm/opportunities', async (request, reply) => {
    const body = (request.body as any) || {};
    reply.header('X-Cache', 'MISS');

    const customer = await prisma.customer.findFirst();
    if (!customer) {
      return reply.status(400).send({ error: 'No customer available for opportunity creation' });
    }

    const opp = await prisma.opportunity.create({
      data: {
        customerId: customer.id,
        name: body.name || 'Enterprise Cloud Renewal',
        amount: body.amount || 150000.0,
        stage: 'PROSPECTING',
        probability: 0.5,
        closeDate: new Date('2026-12-31'),
      },
    });

    return reply.status(201).send(opp);
  });

  // Get Revenue Reports (GET /api/crm/reports)
  fastify.get('/api/crm/reports', async (request, reply) => {
    reply.header('X-Cache', 'MISS');
    return reply.send({
      quarter: 'Q3 2026',
      pipelineValue: 1250000.0,
      wonDealsCount: 14,
      winRatePercentage: 68.5,
      topPerformers: ['Alice Johnson', 'Bob Smith'],
    });
  });
}
