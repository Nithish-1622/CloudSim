import { RedisSimulationQueue } from './queue-abstraction';
import { JobHandler } from './job-handler';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const API_URL = process.env.API_URL || 'http://localhost:4000';

async function startWorker() {
  console.log('⚡ Starting CloudSim Simulation Worker Service...');
  const queue = new RedisSimulationQueue(REDIS_URL);
  const handler = new JobHandler(REDIS_URL, API_URL);

  let isStopping = false;

  const shutdown = async () => {
    if (isStopping) return;
    isStopping = true;
    console.log('🛑 Gracefully shutting down worker process...');
    await queue.close();
    await handler.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.log('👂 Worker is listening for incoming simulation jobs...');

  while (!isStopping) {
    try {
      const job = await queue.dequeue(2);
      if (job) {
        await handler.processJob(job);
        await queue.acknowledge(job.id);
      }
    } catch (err: any) {
      console.error('❌ Error processing queue item:', err);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

if (require.main === module) {
  startWorker().catch((err) => {
    console.error('Fatal worker error:', err);
    process.exit(1);
  });
}
