import { describe, it, expect } from 'vitest';
import { calculateTrafficState } from '../simulator/src/traffic-generator';
import { selectWorkloadOperation } from '../simulator/src/workload-selector';
import { MetricsCollector } from '../simulator/src/metrics-collector';

describe('Simulator Engine Tests', () => {
  it('should correctly calculate NORMAL traffic pattern multiplier near target RPS', () => {
    const traffic = calculateTrafficState('NORMAL', 500, 10000, 10, 60);
    expect(traffic.currentRps).toBeGreaterThanOrEqual(450);
    expect(traffic.currentRps).toBeLessThanOrEqual(550);
  });

  it('should generate SPIKE pattern surge during mid-run window', () => {
    const baseline = calculateTrafficState('SPIKE', 500, 10000, 5, 60); // 5s into 60s -> baseline ~20%
    const spike = calculateTrafficState('SPIKE', 500, 10000, 30, 60); // 30s into 60s -> spike ~250%

    expect(spike.currentRps).toBeGreaterThan(baseline.currentRps);
    expect(spike.currentRps).toBeGreaterThanOrEqual(1000);
  });

  it('should select operations according to weighted probabilities for Student ERP', () => {
    const operations = Array.from({ length: 100 }, () => selectWorkloadOperation('student_erp'));
    expect(operations.length).toBe(100);
    const logins = operations.filter((op) => op.name === 'ERP Login');
    expect(logins.length).toBeGreaterThan(10); // Expect ~30%
  });

  it('should calculate accurate P50, P95, P99 percentiles in MetricsCollector', () => {
    const collector = new MetricsCollector('sim-test', 500);

    for (let i = 1; i <= 100; i++) {
      collector.recordRequest({
        endpoint: '/api/erp/students/1',
        operationName: 'Test Op',
        statusCode: 200,
        latencyMs: i,
        success: true,
        bytesReceived: 500,
        cacheHit: i % 2 === 0,
      });
    }

    const snapshot = collector.generateSnapshot(1000, 500, 10);
    expect(snapshot.totalRequests).toBe(100);
    expect(snapshot.p50LatencyMs).toBe(50);
    expect(snapshot.p95LatencyMs).toBe(95);
    expect(snapshot.p99LatencyMs).toBe(99);
    expect(snapshot.cacheHitRate).toBe(50);
  });
});
