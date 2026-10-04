import { MetricSnapshot, EndpointMetric } from '@cloudsim/shared';
import { RequestExecutionResult } from './request-executor';

export class MetricsCollector {
  private simulationId: string;
  private targetRps: number;
  private totalRequests = 0;
  private successfulRequests = 0;
  private failedRequests = 0;
  private totalBytesReceived = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private latencyWindow: number[] = [];
  private endpointMap: Map<string, { requests: number; successes: number; failures: number; latencies: number[] }> = new Map();

  constructor(simulationId: string, targetRps: number) {
    this.simulationId = simulationId;
    this.targetRps = targetRps;
  }

  public recordRequest(result: RequestExecutionResult): void {
    this.totalRequests++;
    if (result.success) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
    }

    this.totalBytesReceived += result.bytesReceived;

    if (result.cacheHit) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }

    // Keep latency window bounded (last 5000 requests for accurate percentile calculation without memory leak)
    this.latencyWindow.push(result.latencyMs);
    if (this.latencyWindow.length > 5000) {
      this.latencyWindow.shift();
    }

    // Endpoint breakdown
    let ep = this.endpointMap.get(result.endpoint);
    if (!ep) {
      ep = { requests: 0, successes: 0, failures: 0, latencies: [] };
      this.endpointMap.set(result.endpoint, ep);
    }
    ep.requests++;
    if (result.success) ep.successes++;
    else ep.failures++;

    ep.latencies.push(result.latencyMs);
    if (ep.latencies.length > 1000) ep.latencies.shift();
  }

  public generateSnapshot(activeUsers: number, currentRps: number, sampleWindowSeconds: number): MetricSnapshot {
    const latencies = [...this.latencyWindow].sort((a, b) => a - b);
    const count = latencies.length;

    const avgLatencyMs = count > 0 ? parseFloat((latencies.reduce((a, b) => a + b, 0) / count).toFixed(1)) : 0;
    const minLatencyMs = count > 0 ? latencies[0] : 0;
    const maxLatencyMs = count > 0 ? latencies[count - 1] : 0;
    const p50LatencyMs = count > 0 ? latencies[Math.max(0, Math.floor(count * 0.5) - 1)] : 0;
    const p95LatencyMs = count > 0 ? latencies[Math.max(0, Math.floor(count * 0.95) - 1)] : 0;
    const p99LatencyMs = count > 0 ? latencies[Math.max(0, Math.floor(count * 0.99) - 1)] : 0;

    const errorRatePercentage = this.totalRequests > 0
      ? parseFloat(((this.failedRequests / this.totalRequests) * 100).toFixed(2))
      : 0;

    const totalCacheAccess = this.cacheHits + this.cacheMisses;
    const cacheHitRate = totalCacheAccess > 0
      ? parseFloat(((this.cacheHits / totalCacheAccess) * 100).toFixed(1))
      : 0;

    const throughputKbps = sampleWindowSeconds > 0
      ? parseFloat(((this.totalBytesReceived * 8) / (sampleWindowSeconds * 1024)).toFixed(1))
      : 0;

    const endpointMetrics: Record<string, EndpointMetric> = {};
    for (const [epPath, data] of this.endpointMap.entries()) {
      const epLats = [...data.latencies].sort((a, b) => a - b);
      const epCount = epLats.length;
      endpointMetrics[epPath] = {
        endpoint: epPath,
        requests: data.requests,
        successes: data.successes,
        failures: data.failures,
        avgLatencyMs: epCount > 0 ? Math.round(epLats.reduce((a, b) => a + b, 0) / epCount) : 0,
        p95LatencyMs: epCount > 0 ? epLats[Math.floor(epCount * 0.95)] : 0,
        p99LatencyMs: epCount > 0 ? epLats[Math.floor(epCount * 0.99)] : 0,
      };
    }

    return {
      timestamp: Date.now(),
      simulationId: this.simulationId,
      activeUsers,
      currentRps,
      targetRps: this.targetRps,
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      avgLatencyMs,
      p50LatencyMs,
      p95LatencyMs,
      p99LatencyMs,
      minLatencyMs,
      maxLatencyMs,
      errorRatePercentage,
      throughputKbps,
      cacheHitCount: this.cacheHits,
      cacheMissCount: this.cacheMisses,
      cacheHitRate,
      endpointMetrics,
    };
  }
}
