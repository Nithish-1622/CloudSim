import { SimulationConfig, MetricSnapshot } from '@cloudsim/shared';
import { calculateTrafficState } from './traffic-generator';
import { VirtualUser } from './virtual-user';
import { executeRequest, RequestExecutionResult } from './request-executor';
import { MetricsCollector } from './metrics-collector';

export interface SimulationEngineOptions {
  config: SimulationConfig;
  simulationId: string;
  baseUrl: string;
  onSnapshot?: (snapshot: MetricSnapshot) => void | Promise<void>;
  onEvent?: (eventType: string, message: string, meta?: any) => void | Promise<void>;
  isCancelledCheck?: () => Promise<boolean> | boolean;
}

export class SimulationEngine {
  private config: SimulationConfig;
  private simulationId: string;
  private baseUrl: string;
  private onSnapshot?: (snapshot: MetricSnapshot) => void | Promise<void>;
  private onEvent?: (eventType: string, message: string, meta?: any) => void | Promise<void>;
  private isCancelledCheck?: () => Promise<boolean> | boolean;

  private metricsCollector: MetricsCollector;
  private virtualUsers: VirtualUser[] = [];
  private isRunning = false;

  constructor(options: SimulationEngineOptions) {
    this.config = options.config;
    this.simulationId = options.simulationId;
    this.baseUrl = options.baseUrl;
    this.onSnapshot = options.onSnapshot;
    this.onEvent = options.onEvent;
    this.isCancelledCheck = options.isCancelledCheck;

    this.metricsCollector = new MetricsCollector(this.simulationId, this.config.targetRps);

    // Initialize virtual user pool pool size up to max 1000 active instances locally
    const initialUserCount = Math.min(this.config.virtualUsers, 1000);
    for (let i = 0; i < initialUserCount; i++) {
      this.virtualUsers.push(new VirtualUser(i + 1, this.config.application));
    }
  }

  public async run(): Promise<MetricSnapshot> {
    this.isRunning = true;
    const startTime = Date.now();
    const totalDurationMs = this.config.durationSeconds * 1000;

    if (this.onEvent) {
      await this.onEvent(
        'INFO',
        `Simulation started with ${this.config.virtualUsers.toLocaleString()} virtual users targeting ${this.config.targetRps} RPS using ${this.config.trafficPattern} pattern.`
      );
    }

    const tickIntervalMs = 500; // Tick every 500ms
    let elapsedMs = 0;

    while (this.isRunning && elapsedMs < totalDurationMs) {
      // Check for cancellation signal
      if (this.isCancelledCheck && (await this.isCancelledCheck())) {
        this.isRunning = false;
        if (this.onEvent) {
          await this.onEvent('WARN', 'Simulation cancelled by user command.');
        }
        break;
      }

      const currentElapsedSec = elapsedMs / 1000;
      const traffic = calculateTrafficState(
        this.config.trafficPattern,
        this.config.targetRps,
        this.config.virtualUsers,
        currentElapsedSec,
        this.config.durationSeconds
      );

      // Target requests for this 500ms tick
      const targetRequestsThisTick = Math.ceil(traffic.currentRps * (tickIntervalMs / 1000));

      const batchPromises: Promise<RequestExecutionResult>[] = [];
      for (let r = 0; r < targetRequestsThisTick; r++) {
        const vuIndex = r % this.virtualUsers.length;
        const vu = this.virtualUsers[vuIndex];
        const action = vu.getNextAction();

        batchPromises.push(
          executeRequest(
            this.baseUrl,
            this.simulationId,
            vu.id,
            action.operation.name,
            action.path,
            action.method,
            action.body
          )
        );
      }

      // Execute request batch asynchronously
      const results = await Promise.all(batchPromises);

      // Record metrics
      for (const res of results) {
        this.metricsCollector.recordRequest(res);
      }

      // Generate current tick snapshot
      const snapshot = this.metricsCollector.generateSnapshot(
        traffic.activeUsers,
        traffic.currentRps,
        currentElapsedSec
      );

      if (this.onSnapshot) {
        await this.onSnapshot(snapshot);
      }

      await new Promise((resolve) => setTimeout(resolve, tickIntervalMs));
      elapsedMs = Date.now() - startTime;
    }

    this.isRunning = false;
    const finalSnapshot = this.metricsCollector.generateSnapshot(
      0,
      0,
      (Date.now() - startTime) / 1000
    );

    if (this.onEvent) {
      await this.onEvent(
        'INFO',
        `Simulation finished. Generated ${finalSnapshot.totalRequests} total requests with ${finalSnapshot.errorRatePercentage}% error rate.`
      );
    }

    return finalSnapshot;
  }
}
