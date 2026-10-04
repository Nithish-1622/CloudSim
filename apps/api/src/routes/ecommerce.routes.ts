import { FastifyInstance } from 'fastify';
import { prisma } from '@cloudsim/database';
import { RedisService } from '../services/redis.service';
import { ChaosService } from '../services/chaos.service';

export async function ecommerceRoutes(fastify: FastifyInstance) {
  // Get Catalog Products (GET /api/ecommerce/products)
  fastify.get('/api/ecommerce/products', async (request, reply) => {
    const chaos = await ChaosService.getConfig();
    const cacheKey = 'ecom:products:all';

    if (!chaos.cacheDisabled) {
      const cached = await RedisService.get(cacheKey);
      if (cached) {
        reply.header('X-Cache', 'HIT');
        return reply.send(JSON.parse(cached));
      }
    }

    reply.header('X-Cache', 'MISS');
    const products = await prisma.product.findMany({ take: 20 });

    if (!chaos.cacheDisabled) {
      await RedisService.set(cacheKey, JSON.stringify(products), 60);
    }

    return reply.send(products);
  });

  // Search Products (GET /api/ecommerce/products/search)
  fastify.get('/api/ecommerce/products/search', async (request, reply) => {
    const { q } = (request.query as { q?: string }) || {};
    reply.header('X-Cache', 'MISS');

    const products = await prisma.product.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { category: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      take: 10,
    });

    return reply.send({ query: q || '', totalHits: products.length, products });
  });

  // Get Product Detail (GET /api/ecommerce/products/:id)
  fastify.get('/api/ecommerce/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const chaos = await ChaosService.getConfig();
    const cacheKey = `ecom:product:${id}`;

    if (!chaos.cacheDisabled) {
      const cached = await RedisService.get(cacheKey);
      if (cached) {
        reply.header('X-Cache', 'HIT');
        return reply.send(JSON.parse(cached));
      }
    }

    reply.header('X-Cache', 'MISS');
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { sku: id }] },
    });

    const result = product || {
      id,
      name: 'CloudSim Wireless Router',
      sku: 'ROUTER-PRO-01',
      category: 'Networking',
      price: 199.99,
      stock: 450,
      description: 'High-speed Wi-Fi 6E cloud managed router.',
    };

    if (!chaos.cacheDisabled) {
      await RedisService.set(cacheKey, JSON.stringify(result), 120);
    }

    return reply.send(result);
  });

  // Add Item to Cart (POST /api/ecommerce/cart)
  fastify.post('/api/ecommerce/cart', async (request, reply) => {
    const { userId, productId, quantity } = (request.body as any) || {};
    reply.header('X-Cache', 'MISS');

    const targetUserId = userId || 'anonymous-user';
    const cart = await prisma.cart.upsert({
      where: { userId: targetUserId },
      update: {
        items: [{ productId: productId || 'prod-1', quantity: quantity || 1, price: 199.99 }],
        totalAmount: 199.99 * (quantity || 1),
      },
      create: {
        userId: targetUserId,
        items: [{ productId: productId || 'prod-1', quantity: quantity || 1, price: 199.99 }],
        totalAmount: 199.99 * (quantity || 1),
      },
    });

    return reply.status(200).send(cart);
  });

  // Get Cart (GET /api/ecommerce/cart/:id)
  fastify.get('/api/ecommerce/cart/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    reply.header('X-Cache', 'MISS');

    const cart = await prisma.cart.findFirst({
      where: { OR: [{ id }, { userId: id }] },
    });

    return reply.send(
      cart || {
        id,
        userId: id,
        items: [{ productId: 'ROUTER-PRO-01', quantity: 1, price: 199.99 }],
        totalAmount: 199.99,
      }
    );
  });

  // Checkout (POST /api/ecommerce/checkout)
  fastify.post('/api/ecommerce/checkout', async (request, reply) => {
    const { userId } = (request.body as any) || {};
    reply.header('X-Cache', 'MISS');

    const targetUserId = userId || 'user-1';
    const order = await prisma.order.create({
      data: {
        userId: targetUserId,
        totalAmount: 199.99,
        status: 'COMPLETED',
        items: [{ productId: 'ROUTER-PRO-01', quantity: 1, price: 199.99 }],
      },
    });

    return reply.status(201).send(order);
  });

  // Get Order History (GET /api/ecommerce/orders)
  fastify.get('/api/ecommerce/orders', async (request, reply) => {
    const { userId } = (request.query as { userId?: string }) || {};
    reply.header('X-Cache', 'MISS');

    const orders = await prisma.order.findMany({
      where: userId ? { userId } : undefined,
      take: 10,
    });

    return reply.send(orders);
  });

  // Get Order Detail (GET /api/ecommerce/orders/:id)
  fastify.get('/api/ecommerce/orders/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    reply.header('X-Cache', 'MISS');

    const order = await prisma.order.findUnique({
      where: { id },
    });

    return reply.send(
      order || {
        id,
        userId: 'user-1',
        totalAmount: 199.99,
        status: 'COMPLETED',
        items: [{ productId: 'ROUTER-PRO-01', quantity: 1, price: 199.99 }],
      }
    );
  });
}
