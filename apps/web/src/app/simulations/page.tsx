'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, Play, Search, Filter, ArrowUpRight, Zap } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { LaunchSimulationModal } from '@/components/LaunchSimulationModal';

interface SimulationItem {
  id: string;
  name: string;
  application: string;
  virtualUsers: number;
  targetRps: number;
  durationSeconds: number;
  trafficPattern: string;
  cacheEnabled: boolean;
  intensity: string;
  status: string;
  createdAt: string;
}

export default function SimulationsPage() {
  const [simulations, setSimulations] = useState<SimulationItem[]>([]);
  const [filtered, setFiltered] = useState<SimulationItem[]>([]);
  const [search, setSearch] = useState('');
  const [appFilter, setAppFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchApi<SimulationItem[]>('/api/simulations');
        setSimulations(data);
      } catch (err) {
        console.error('Failed to load simulations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = [...simulations];
    if (search) {
      result = result.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search));
    }
    if (appFilter !== 'ALL') {
      result = result.filter((s) => s.application === appFilter);
    }
    setFiltered(result);
  }, [search, appFilter, simulations]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 glass-panel-glow rounded-2xl border border-cyan-500/20">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Workload Simulations History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete trajectory audit and live status monitor for logical workload executions.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 transition-all"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>Configure New Simulation</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search simulation name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Workloads</option>
            <option value="student_erp">Student ERP</option>
            <option value="crm">CRM</option>
            <option value="ecommerce">E-Commerce</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase">
                <th className="py-3 px-4">Simulation</th>
                <th className="py-3 px-4">Workload</th>
                <th className="py-3 px-4">Virtual Users</th>
                <th className="py-3 px-4">Target RPS</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Pattern</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length > 0 ? (
                filtered.map((sim) => (
                  <tr key={sim.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{sim.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{sim.id}</div>
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-cyan-400 font-bold">
                      {sim.application.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-200">
                      {sim.virtualUsers.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-200">
                      {sim.targetRps} RPS
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {sim.durationSeconds}s
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
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium transition-colors inline-flex items-center space-x-1"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    No simulations matched filter criteria.
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
