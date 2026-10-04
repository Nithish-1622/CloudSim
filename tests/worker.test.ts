import { describe, it, expect } from 'vitest';
import { RedisSimulationQueue } from '../workers/src/queue-abstraction';

describe('Worker Queue Abstraction Tests', () => {
  it('should enqueue and dequeue jobs correctly in local memory fallback mode', async () => {
    const queue = new RedisSimulationQueue();

    await queue.enqueue({
      id: 'job-101',
      simulationId: 'sim-101',
      config: {
        application: 'student_erp',
        virtualUsers: 1000,
        targetRps: 100,
        durationSeconds: 30,
        trafficPattern: 'NORMAL',
        cacheEnabled: true,
      },
    });

    const len = await queue.getQueueLength();
    expect(len).toBe(1);

    const dequeued = await queue.dequeue();
    expect(dequeued).not.toBeNull();
    expect(dequeued?.simulationId).toBe('sim-101');

    await queue.acknowledge('job-101');
    const finalLen = await queue.getQueueLength();
    expect(finalLen).toBe(0);
  });
});
