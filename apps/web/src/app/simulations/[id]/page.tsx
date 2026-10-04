'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Activity, 
  Users, 
  Clock, 
  AlertTriangle, 
  Square, 
  RefreshCw, 
  Zap, 
  Terminal, 
  Database, 
  Radio
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { MetricSnapshot, EndpointMetric } from '@cloudsim/shared';
import { fetchApi } from '@/lib/api';

interface SimulationDetails {
  id: string;
  name: string;
  description: string;
  application: string;
  virtualUsers: number;
  targetRps: number;
  durationSeconds: number;
  trafficPattern: string;
  cacheEnabled: boolean;
  intensity: string;
  status: string;
  startedAt: string;
  completedAt: string;
  metrics: MetricSnapshot[];
  events: Array<{
    id: string;
    eventType: string;
    message: string;
    timestamp: string;
  }>;
}

export default function SimulationDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [sim, setSim] = useState<SimulationDetails | null>(null);
  const [metricSeries, setMetricSeries] = useState<MetricSnapshot[]>([]);
  const [latestSnapshot, setLatestSnapshot] = useState<MetricSnapshot | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Load initial simulation state and metric history
  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await fetchApi<SimulationDetails>(`/api/simulations/${id}`);
        setSim(data);

        const historicalMetrics = await fetchApi<MetricSnapshot[]>(`/api/simulations/${id}/metrics`);
        setMetricSeries(historicalMetrics);
        if (historicalMetrics.length > 0) {
          setLatestSnapshot(historicalMetrics[historicalMetrics.length - 1]);
        }
      } catch (err) {
        console.error('Error fetching simulation details:', err);
      }
    };

    loadDetails();
  }, [id]);

  // Connect WebSocket stream for live metric updates
  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
    const ws = new WebSocket(`${WS_URL}/api/simulations/${id}/stream`);

    ws.onopen = () => {
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const snapshot: MetricSnapshot = JSON.parse(event.data);
        if (snapshot.simulationId === id) {
          setLatestSnapshot(snapshot);
          setMetricSeries((prev) => {
            const next = [...prev, snapshot];
            return next.slice(-60); // Keep last 60 ticks
          });
        }
      } catch (e) {}
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await fetchApi(`/api/simulations/${id}/cancel`, { method: 'POST' });
      setSim((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
    } catch (err) {
      console.error('Failed to cancel simulation:', err);
    } finally {
      setCancelling(false);
    }
  };

  // Format metric chart series
  const chartData = metricSeries.map((m) => ({
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    RPS: m.currentRps,
    TargetRPS: m.targetRps,
    P50: m.p50LatencyMs,
    P95: m.p95LatencyMs,
    P99: m.p99LatencyMs,
  }));

  return (
    <div className="space-y-6">
      {/* Simulation Header & Status Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 glass-panel-glow rounded-2xl border border-cyan-500/20">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{sim?.name || 'Simulation Inspector'}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                sim?.status === 'RUNNING'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse'
                  : sim?.status === 'COMPLETED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              {sim?.status || 'LOADING'}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            ID: {id} • Workload: <strong className="text-cyan-400 uppercase">{sim?.application.replace('_', ' ')}</strong> • Pattern: <strong className="text-slate-200">{sim?.trafficPattern}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <Radio className={`h-3.5 w-3.5 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
            <span className={wsConnected ? 'text-emerald-400' : 'text-slate-400'}>
              {wsConnected ? 'WS STREAM LIVE' : 'DISCONNECTED'}
            </span>
          </div>

          {sim?.status === 'RUNNING' && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-xs font-semibold transition-all"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>{cancelling ? 'Stopping...' : 'Cancel Simulation'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Gauges & Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Virtual Users */}
        <div className="glass-panel p-5 rounded-2xl">
          <span className="block text-xs font-mono uppercase text-slate-400 mb-1">Active Logical Users</span>
          <div className="text-3xl font-extrabold text-cyan-400">
            {(latestSnapshot?.activeUsers ?? sim?.virtualUsers ?? 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Target Pool: {sim?.virtualUsers.toLocaleString()}</div>
        </div>

        {/* Current RPS */}
        <div className="glass-panel p-5 rounded-2xl">
          <span className="block text-xs font-mono uppercase text-slate-400 mb-1">Generated Throughput</span>
          <div className="text-3xl font-extrabold text-white">
            {latestSnapshot?.currentRps ?? 0} <span className="text-xs font-normal text-slate-400">RPS</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Target Ceiling: {sim?.targetRps} RPS</div>
        </div>

        {/* P95 Latency */}
        <div className="glass-panel p-5 rounded-2xl">
          <span className="block text-xs font-mono uppercase text-slate-400 mb-1">P95 Latency</span>
          <div className="text-3xl font-extrabold text-amber-400">
            {latestSnapshot?.p95LatencyMs ?? 0} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            P50: {latestSnapshot?.p50LatencyMs ?? 0}ms | P99: {latestSnapshot?.p99LatencyMs ?? 0}ms
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="glass-panel p-5 rounded-2xl">
          <span className="block text-xs font-mono uppercase text-slate-400 mb-1">Cache Hit Rate</span>
          <div className="text-3xl font-extrabold text-emerald-400">
            {latestSnapshot?.cacheHitRate ?? 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Hits: {latestSnapshot?.cacheHitCount ?? 0} | Misses: {latestSnapshot?.cacheMissCount ?? 0}
          </div>
        </div>
      </div>

      {/* Latency & Throughput Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Percentiles Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Latency Trajectory (P50 / P95 / P99)</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} unit="ms" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="P50" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="P95" stroke="#fbbf24" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="P99" stroke="#f87171" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RPS Throughput Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>RPS Throughput vs Target Ceiling</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="RPS" stroke="#22d3ee" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="TargetRPS" stroke="#64748b" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Endpoint Breakdown & Workload Events Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoint Breakdown */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4">Endpoint Load Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase">
                  <th className="py-2 px-3">Endpoint</th>
                  <th className="py-2 px-3">Requests</th>
                  <th className="py-2 px-3">Avg Latency</th>
                  <th className="py-2 px-3">P95</th>
                  <th className="py-2 px-3">P99</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {latestSnapshot?.endpointMetrics && Object.keys(latestSnapshot.endpointMetrics).length > 0 ? (
                  Object.values(latestSnapshot.endpointMetrics).map((ep: EndpointMetric) => (
                    <tr key={ep.endpoint} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-cyan-300 font-semibold">{ep.endpoint}</td>
                      <td className="py-2.5 px-3 text-slate-300">{ep.requests.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-slate-300">{ep.avgLatencyMs} ms</td>
                      <td className="py-2.5 px-3 text-amber-400">{ep.p95LatencyMs} ms</td>
                      <td className="py-2.5 px-3 text-red-400">{ep.p99LatencyMs} ms</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      Waiting for endpoint metric tick telemetry...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Workload Events Stream */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Workload Event Stream</span>
            <Terminal className="h-4 w-4 text-cyan-400" />
          </h3>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-2 max-h-72 overflow-y-auto font-mono text-[11px]">
            {sim?.events && sim.events.length > 0 ? (
              sim.events.map((evt) => (
                <div key={evt.id} className="border-b border-slate-900 pb-1.5 last:border-0">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="text-cyan-400">{evt.eventType}</span>
                    <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-300 mt-0.5">{evt.message}</div>
                </div>
              ))
            ) : (
              <div className="text-slate-600 text-center py-4">No events logged yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
