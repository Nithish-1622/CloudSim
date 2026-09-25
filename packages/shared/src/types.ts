export type ApplicationType = 'student_erp' | 'crm' | 'ecommerce';

export type TrafficPattern =
  | 'NORMAL'
  | 'RAMP_UP'
  | 'RAMP_DOWN'
  | 'SPIKE'
  | 'BURST'
  | 'FLASH_SALE'
  | 'CHAOS';

export type WorkloadIntensity = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export type SimulationStatus =
  | 'QUEUED'
  | 'STARTING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface SimulationConfig {
  application: ApplicationType;
  virtualUsers: number;
  targetRps: number;
  durationSeconds: number;
  trafficPattern: TrafficPattern;
  cacheEnabled: boolean;
  intensity?: WorkloadIntensity;
  name?: string;
  description?: string;
}

export interface MetricSnapshot {
  timestamp: number;
  simulationId: string;
  activeUsers: number;
  currentRps: number;
  targetRps: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  errorRatePercentage: number;
  throughputKbps: number;
  cacheHitCount: number;
  cacheMissCount: number;
  cacheHitRate: number;
  endpointMetrics: Record<string, EndpointMetric>;
}

export interface EndpointMetric {
  endpoint: string;
  requests: number;
  successes: number;
  failures: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
}

export interface WorkloadEvent {
  id: string;
  simulationId: string;
  timestamp: string;
  eventType: 'INFO' | 'WARN' | 'ERROR' | 'CHAOS_INJECTED' | 'STATUS_CHANGE';
  message: string;
  metadata?: Record<string, any>;
}

export interface ChaosConfig {
  latencyInjectionMs: number;
  errorInjectionPercentage: number;
  cacheDisabled: boolean;
  trafficSpikeActive: boolean;
  updatedAt: string;
}

export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  application: ApplicationType;
  virtualUsers: number;
  targetRps: number;
  durationSeconds: number;
  trafficPattern: TrafficPattern;
  cacheEnabled: boolean;
  intensity: WorkloadIntensity;
}

export interface LogicalInfraComponent {
  id: string;
  name: string;
  type: string;
  category: 'CDN' | 'WAF' | 'LOAD_BALANCER' | 'COMPUTE' | 'CACHE' | 'QUEUE' | 'WORKER' | 'DATABASE' | 'STORAGE';
  purpose: string;
  futureAwsService: string;
  currentLocalEquivalent: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DISRUPTED';
  metrics?: {
    rps?: number;
    latencyMs?: number;
    errorRate?: number;
    activeConnections?: number;
    queueDepth?: number;
    cacheHitRate?: number;
  };
}
