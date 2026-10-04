'use client';

import { useEffect, useState } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Server, 
  Database, 
  Layers, 
  ArrowDown, 
  Info, 
  X, 
  CheckCircle2, 
  Zap,
  Activity,
  HardDrive
} from 'lucide-react';
import { LogicalInfraComponent } from '@cloudsim/shared';
import { fetchApi } from '@/lib/api';

export default function InfrastructurePage() {
  const [components, setComponents] = useState<LogicalInfraComponent[]>([]);
  const [selectedComp, setSelectedComp] = useState<LogicalInfraComponent | null>(null);

  useEffect(() => {
    const loadInfra = async () => {
      try {
        const res = await fetchApi<{ components: LogicalInfraComponent[] }>('/api/infrastructure');
        setComponents(res.components);
      } catch (err) {
        console.error('Failed to fetch infrastructure:', err);
      }
    };

    loadInfra();
    const interval = setInterval(loadInfra, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 glass-panel-glow rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-extrabold text-white">Logical Infrastructure Architecture</h1>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold">
              LOGICAL AWS ARCHITECTURE — NOT DEPLOYED
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Interactive map of target AWS cloud components and their local node implementations. Click any component to inspect runtime equivalent details.
          </p>
        </div>
      </div>

      {/* Logical Diagram Grid */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-8 relative overflow-hidden">
        {/* Layer 1: Edge & Security */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Edge Layer & Security Shield</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {components.filter(c => c.category === 'CDN' || c.category === 'WAF').map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedComp(c)}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-white group-hover:text-cyan-400 text-sm">{c.name}</div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                    {c.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mb-2">{c.type}</div>
                <div className="text-[11px] text-cyan-400 font-mono bg-slate-950/60 px-2.5 py-1 rounded">
                  Future AWS: <strong>{c.futureAwsService}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center text-slate-600">
          <ArrowDown className="h-6 w-6 animate-bounce" />
        </div>

        {/* Layer 2: Load Balancing & Compute API */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Routing & Compute Plane</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {components.filter(c => c.category === 'LOAD_BALANCER' || c.category === 'COMPUTE').map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedComp(c)}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-white group-hover:text-cyan-400 text-sm">{c.name}</div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                    {c.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mb-2">{c.type}</div>
                <div className="text-[11px] text-cyan-400 font-mono bg-slate-950/60 px-2.5 py-1 rounded">
                  Future AWS: <strong>{c.futureAwsService}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center text-slate-600">
          <ArrowDown className="h-6 w-6 animate-bounce" />
        </div>

        {/* Layer 3: Cache, Queue & Async Workers */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">State, Queue & Workers</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {components.filter(c => c.category === 'CACHE' || c.category === 'QUEUE' || c.category === 'WORKER').map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedComp(c)}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-white group-hover:text-cyan-400 text-sm">{c.name}</div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                    {c.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mb-2">{c.type}</div>
                <div className="text-[11px] text-cyan-400 font-mono bg-slate-950/60 px-2.5 py-1 rounded">
                  Future AWS: <strong>{c.futureAwsService}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center text-slate-600">
          <ArrowDown className="h-6 w-6 animate-bounce" />
        </div>

        {/* Layer 4: Primary Database */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Persistence Layer</span>
          <div className="grid grid-cols-1 gap-4">
            {components.filter(c => c.category === 'DATABASE').map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedComp(c)}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-white group-hover:text-cyan-400 text-sm">{c.name}</div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                    {c.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mb-2">{c.type}</div>
                <div className="text-[11px] text-cyan-400 font-mono bg-slate-950/60 px-2.5 py-1 rounded">
                  Future AWS: <strong>{c.futureAwsService}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Component Detail Modal */}
      {selectedComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg glass-panel-glow rounded-2xl p-6 border border-cyan-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedComp.name}</h3>
                <span className="text-xs text-cyan-400 font-mono">{selectedComp.type}</span>
              </div>
              <button
                onClick={() => setSelectedComp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-mono uppercase text-[10px] block">Purpose</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">{selectedComp.purpose}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 font-mono">
                <span className="text-amber-400 text-[10px] uppercase font-bold block">Future AWS Cloud Service</span>
                <div className="text-white text-sm font-bold">{selectedComp.futureAwsService}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 font-mono">
                <span className="text-cyan-400 text-[10px] uppercase font-bold block">Current Local Development Equivalent</span>
                <div className="text-slate-200 text-xs">{selectedComp.currentLocalEquivalent}</div>
              </div>

              {selectedComp.metrics && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 space-y-1 font-mono">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Live Telemetry Metrics</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {selectedComp.metrics.rps !== undefined && (
                      <div>RPS: <strong className="text-white">{selectedComp.metrics.rps}</strong></div>
                    )}
                    {selectedComp.metrics.latencyMs !== undefined && (
                      <div>Latency: <strong className="text-amber-400">{selectedComp.metrics.latencyMs}ms</strong></div>
                    )}
                    {selectedComp.metrics.cacheHitRate !== undefined && (
                      <div>Cache Hit Rate: <strong className="text-emerald-400">{selectedComp.metrics.cacheHitRate}%</strong></div>
                    )}
                    {selectedComp.metrics.queueDepth !== undefined && (
                      <div>Queue Depth: <strong className="text-cyan-400">{selectedComp.metrics.queueDepth}</strong></div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedComp(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
              >
                Close Component Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
