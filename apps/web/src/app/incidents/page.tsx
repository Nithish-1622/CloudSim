'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, Terminal, RefreshCw } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface IncidentEvent {
  id: string;
  simulationId: string;
  timestamp: string;
  eventType: string;
  message: string;
  metadata?: any;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      // Load recent error/warn events across all simulations
      const sims = await fetchApi<Array<{ id: string }>>('/api/simulations');
      const allEvents: IncidentEvent[] = [];

      for (const s of sims.slice(0, 10)) {
        const evts = await fetchApi<IncidentEvent[]>(`/api/simulations/${s.id}/events`);
        const filtered = evts.filter((e) => e.eventType === 'ERROR' || e.eventType === 'WARN' || e.eventType === 'CHAOS_INJECTED');
        allEvents.push(...filtered);
      }

      allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setIncidents(allEvents);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel-glow rounded-2xl border border-red-500/20">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Incident & Failure Audit Log</h1>
            <p className="text-xs text-slate-400">Real-time log of workload errors, timeouts, and injected chaos anomalies.</p>
          </div>
        </div>

        <button
          onClick={loadIncidents}
          disabled={loading}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Incident Stream</span>
        </button>
      </div>

      {/* Incident List */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Simulation ID</th>
                <th className="py-3 px-4">Incident Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {incidents.length > 0 ? (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(inc.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.eventType === 'ERROR'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : inc.eventType === 'CHAOS_INJECTED'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                        }`}
                      >
                        {inc.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-cyan-400 whitespace-nowrap">
                      {inc.simulationId}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {inc.message}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    No active incident anomalies recorded in the local environment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
