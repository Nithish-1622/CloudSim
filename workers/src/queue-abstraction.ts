import Redis from 'ioredis';
import { SimulationConfig } from '@cloudsim/shared';

export interface SimulationJob {
  id: string;
  simulationId: string;
  config: SimulationConfig;
  createdAt: string;
  attempts: number;
}

export interface ISimulationQueue {
  enqueue(job: Omit<SimulationJob, 'createdAt' | 'attempts'>): Promise<void>;
  dequeue(timeoutSeconds?: number): Promise<SimulationJob | null>;
  acknowledge(jobId: string): Promise<void>;
  retry(job: SimulationJob, error: string): Promise<void>;
  getQueueLength(): Promise<number>;
  close(): Promise<void>;
}

export class RedisSimulationQueue implements ISimulationQueue {
  private redis: Redis | null = null;
  private queueKey = 'cloudsim:queue:simulations';
  private processingKey = 'cloudsim:queue:processing';
  private memoryQueue: SimulationJob[] = [];

  constructor(redisUrl?: string) {
    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl, {
          lazyConnect: true,
          retryStrategy: (times) => Math.min(times * 100, 2000),
        });
        this.redis.connect().catch(() => {
          console.warn('⚠️ Could not connect to Redis. Falling back to local queue mode.');
          this.redis = null;
        });
      } catch (err) {
        console.warn('⚠️ Redis initialization failed. Using memory queue abstraction.');
      }
    }
  }

  public async enqueue(jobData: Omit<SimulationJob, 'createdAt' | 'attempts'>): Promise<void> {
    const job: SimulationJob = {
      ...jobData,
      createdAt: new Date().toISOString(),
      attempts: 0,
    };

    if (this.redis && this.redis.status === 'ready') {
      await this.redis.rpush(this.queueKey, JSON.stringify(job));
    } else {
      this.memoryQueue.push(job);
    }
  }

  public async dequeue(timeoutSeconds = 2): Promise<SimulationJob | null> {
    if (this.redis && this.redis.status === 'ready') {
      try {
        const raw = await this.redis.blpop(this.queueKey, timeoutSeconds);
        if (raw && raw[1]) {
          const job: SimulationJob = JSON.parse(raw[1]);
          await this.redis.hset(this.processingKey, job.id, JSON.stringify(job));
          return job;
        }
      } catch (err) {
        // Fallthrough to memory queue
      }
    }

    if (this.memoryQueue.length > 0) {
      return this.memoryQueue.shift() || null;
    }
    return null;
  }

  public async acknowledge(jobId: string): Promise<void> {
    if (this.redis && this.redis.status === 'ready') {
      await this.redis.hdel(this.processingKey, jobId);
    }
  }

  public async retry(job: SimulationJob, error: string): Promise<void> {
    job.attempts++;
    if (job.attempts < 3) {
      if (this.redis && this.redis.status === 'ready') {
        await this.redis.rpush(this.queueKey, JSON.stringify(job));
        await this.redis.hdel(this.processingKey, job.id);
      } else {
        this.memoryQueue.push(job);
      }
    } else {
      await this.acknowledge(job.id);
    }
  }

  public async getQueueLength(): Promise<number> {
    if (this.redis && this.redis.status === 'ready') {
      return await this.redis.llen(this.queueKey);
    }
    return this.memoryQueue.length;
  }

  public async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}
