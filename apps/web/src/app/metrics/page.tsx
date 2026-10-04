'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Activity, Clock, Zap, Database, Filter } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { MetricSnapshot } from '@cloudsim/shared';
import { fetchApi } from '@/lib/api';

export default function MetricsPage() {
  const [metricSeries, setMetricSeries] = useState<MetricSnapshot[]>([]);
  const [selectedApp, setSelectedApp] = useState<string>('ALL');

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const sims = await fetchApi<Array<{ id: string }>>('/api/simulations');
        if (sims.length > 0) {
          const latestSimId = sims[0].id;
          const data = await fetchApi<MetricSnapshot[]>(`/api/simulations/${latestSimId}/metrics`);
          setMetricSeries(data);
        }
      } catch (err) {
        console.error('Failed to load metrics:', err);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  const chartData = metricSeries.map((m) => ({
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    RPS: m.currentRps,
    ActiveUsers: m.activeUsers,
    P50: m.p50LatencyMs,
    P95: m.p95LatencyMs,
    P99: m.p99LatencyMs,
    ErrorRate: m.errorRatePercentage,
    CacheHitRate: m.cacheHitRate,
    Throughput: m.throughputKbps,
  }));

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel-glow rounded-2xl border border-cyan-500/20">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Telemetry & Metrics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time aggregate performance analytics across logical workload simulations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Applications</option>
            <option value="student_erp">Student ERP</option>
            <option value="crm">CRM Enterprise</option>
            <option value="ecommerce">E-Commerce</option>
          </select>
        </div>
      </div>

      {/* Grid of 4 Core Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: RPS & Active Users */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Throughput & Active User Load</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="RPS" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Latency Percentiles */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Latency Spectrum (P50 / P95 / P99)</span>
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

        {/* Chart 3: Error Rate Percentage */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Error Rate Percentage (%)</span>
            <Zap className="h-4 w-4 text-red-400" />
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="ErrorRate" stroke="#f87171" fill="#f87171" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Cache Hit Rate Percentage */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Redis Cache Hit Rate (%)</span>
            <Database className="h-4 w-4 text-emerald-400" />
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="CacheHitRate" stroke="#34d399" fill="#34d399" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
