delete process.env.DATABASE_URL;

import { buildServer } from '../apps/api/src/server';
import { SimulationEngine } from '../simulator/src/engine';

async function runBenchmark() {
  console.log('====================================================');
  console.log('🚀 CLOUDSIM SIMULATOR LOCAL BENCHMARK SUITE');
  console.log('====================================================\n');

  const server = await buildServer();
  const address = await server.listen({ port: 4005, host: '127.0.0.1' });
  console.log(`[API Server] Running locally at ${address}\n`);

  const scales = [100, 1000, 10000, 100000];
  const benchmarkResults = [];

  for (const vuCount of scales) {
    console.log(`\n----------------------------------------------------`);
    console.log(`📊 Benchmarking scale: ${vuCount.toLocaleString()} Logical Users...`);
    console.log(`----------------------------------------------------`);

    const startMem = process.memoryUsage().heapUsed / 1024 / 1024;
    const startTime = performance.now();

    const targetRps = Math.min(vuCount, 1000);
    const engine = new SimulationEngine({
      config: {
        application: 'student_erp',
        virtualUsers: vuCount,
        targetRps: targetRps,
        durationSeconds: 10,
        trafficPattern: 'NORMAL',
        cacheEnabled: true,
      },
      simulationId: `bench-${vuCount}`,
      baseUrl: 'http://127.0.0.1:4005',
    });

    const snapshot = await engine.run();

    const endTime = performance.now();
    const endMem = process.memoryUsage().heapUsed / 1024 / 1024;

    const durationSec = (endTime - startTime) / 1000;
    const achievedRps = parseFloat((snapshot.totalRequests / durationSec).toFixed(1));
    const memoryDeltaMb = parseFloat((endMem - startMem).toFixed(2));

    const res = {
      logicalUsers: vuCount,
      targetRps,
      durationSec: parseFloat(durationSec.toFixed(1)),
      totalRequests: snapshot.totalRequests,
      achievedRps,
      p50Ms: snapshot.p50LatencyMs,
      p95Ms: snapshot.p95LatencyMs,
      p99Ms: snapshot.p99LatencyMs,
      errorRatePct: snapshot.errorRatePercentage,
      heapMemUsedMb: parseFloat(endMem.toFixed(1)),
      memoryDeltaMb,
    };

    benchmarkResults.push(res);

    console.log(`  Achieved RPS: ${achievedRps} req/s`);
    console.log(`  P50: ${snapshot.p50LatencyMs}ms | P95: ${snapshot.p95LatencyMs}ms | P99: ${snapshot.p99LatencyMs}ms`);
    console.log(`  Error Rate: ${snapshot.errorRatePercentage}%`);
    console.log(`  RAM Usage: ${endMem.toFixed(1)} MB (Delta: +${memoryDeltaMb} MB)`);
  }

  console.log('\n====================================================');
  console.log('📈 BENCHMARK SUMMARY SUMMARY TABLE');
  console.log('====================================================');
  console.table(benchmarkResults);

  await server.close();
  process.exit(0);
}

runBenchmark().catch((err) => {
  console.error('Benchmark error:', err);
  process.exit(1);
});
