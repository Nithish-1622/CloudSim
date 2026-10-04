'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  Users, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  TrendingUp, 
  ArrowUpRight,
  Layers,
  BarChart2
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { LaunchSimulationModal } from '@/components/LaunchSimulationModal';

interface SystemMetrics {
  totalSimulations: number;
  activeSimulations: number;
  completedSimulations: number;
  failedSimulations: number;
  totalLogicalUsersSimulated: number;
  totalRequests: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRatePercentage: number;
  recentSimulations: Array<{
    id: string;
    name: string;
    application: string;
    virtualUsers: number;
    targetRps: number;
    trafficPattern: string;
    status: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchApi<SystemMetrics>('/api/system/metrics');
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load system metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 glass-panel-glow rounded-2xl border border-cyan-500/20">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            CloudSim Control Plane Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Local Workload Playground & High-Concurrency Simulation Engine Overview.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 transition-all"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Launch Simulation</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Simulations */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Simulations</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics?.totalSimulations ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
            <span className="text-emerald-400 font-semibold">{metrics?.completedSimulations ?? 0} Done</span>
            <span>•</span>
            <span className="text-cyan-400 font-semibold">{metrics?.activeSimulations ?? 0} Active</span>
          </div>
        </div>

        {/* Logical Users Simulated */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Logical Users</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">
            {(metrics?.totalLogicalUsersSimulated ?? 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Async Virtual Users Pool
          </div>
        </div>

        {/* Latency Stats */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Avg Latency / P95</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics?.avgLatencyMs ?? 0}<span className="text-xs font-normal text-slate-400"> ms</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
            <span>P50: <strong className="text-slate-200">{metrics?.p50LatencyMs ?? 0}ms</strong></span>
            <span>P95: <strong className="text-amber-400">{metrics?.p95LatencyMs ?? 0}ms</strong></span>
            <span>P99: <strong className="text-red-400">{metrics?.p99LatencyMs ?? 0}ms</strong></span>
          </div>
        </div>

        {/* Error Rate */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Error Rate</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className={`text-3xl font-extrabold ${(metrics?.errorRatePercentage ?? 0) > 2 ? 'text-red-400' : 'text-emerald-400'}`}>
            {metrics?.errorRatePercentage ?? 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Generated Requests Success Threshold
          </div>
        </div>
      </div>

      {/* Recent Simulations Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Workload Simulations</h2>
            <p className="text-xs text-slate-400">Real-time status updates from the async simulation queue.</p>
          </div>
          <Link
            href="/simulations"
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase">
                <th className="py-3 px-4">Name / ID</th>
                <th className="py-3 px-4">Workload</th>
                <th className="py-3 px-4">Virtual Users</th>
                <th className="py-3 px-4">Target RPS</th>
                <th className="py-3 px-4">Pattern</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {metrics?.recentSimulations && metrics.recentSimulations.length > 0 ? (
                metrics.recentSimulations.map((sim) => (
                  <tr key={sim.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{sim.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{sim.id}</div>
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-cyan-400">
                      {sim.application.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {sim.virtualUsers.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {sim.targetRps} RPS
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {sim.trafficPattern}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                          sim.status === 'RUNNING'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse'
                            : sim.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : sim.status === 'FAILED'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {sim.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/simulations/${sim.id}`}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 text-[11px] font-medium transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    No recent simulations found. Click "Launch Simulation" to start one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LaunchSimulationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
