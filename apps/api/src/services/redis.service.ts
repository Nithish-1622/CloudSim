import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export class RedisService {
  private static client: Redis | null = null;
  private static inMemoryCache = new Map<string, { value: string; expiresAt: number }>();

  public static getClient(): Redis | null {
    if (!this.client) {
      try {
        this.client = new Redis(REDIS_URL, {
          lazyConnect: true,
          retryStrategy: (times) => Math.min(times * 100, 2000),
        });
        this.client.connect().catch(() => {
          this.client = null;
        });
      } catch (err) {
        this.client = null;
      }
    }
    return this.client;
  }

  public static async get(key: string): Promise<string | null> {
    const redis = this.getClient();
    if (redis && redis.status === 'ready') {
      try {
        return await redis.get(key);
      } catch (e) {}
    }

    // Fallback in-memory cache
    const item = this.inMemoryCache.get(key);
    if (item) {
      if (Date.now() > item.expiresAt) {
        this.inMemoryCache.delete(key);
        return null;
      }
      return item.value;
    }
    return null;
  }

  public static async set(key: string, value: string, ttlSeconds = 60): Promise<void> {
    const redis = this.getClient();
    if (redis && redis.status === 'ready') {
      try {
        await redis.setex(key, ttlSeconds, value);
        return;
      } catch (e) {}
    }

    this.inMemoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
}
