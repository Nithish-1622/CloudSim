'use client';

import { useEffect, useState } from 'react';
import { Zap, ShieldAlert, RotateCcw, Save, Sliders, CheckCircle2 } from 'lucide-react';
import { ChaosConfig } from '@cloudsim/shared';
import { fetchApi } from '@/lib/api';

export default function ChaosLabPage() {
  const [chaos, setChaos] = useState<ChaosConfig>({
    latencyInjectionMs: 0,
    errorInjectionPercentage: 0,
    cacheDisabled: false,
    trafficSpikeActive: false,
    updatedAt: new Date().toISOString(),
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApi<ChaosConfig>('/api/chaos')
      .then(setChaos)
      .catch((err) => console.error('Failed to load chaos config:', err));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await fetchApi<ChaosConfig>('/api/chaos/config', {
        method: 'POST',
        body: JSON.stringify({
          latencyInjectionMs: Number(chaos.latencyInjectionMs),
          errorInjectionPercentage: Number(chaos.errorInjectionPercentage),
          cacheDisabled: chaos.cacheDisabled,
          trafficSpikeActive: chaos.trafficSpikeActive,
        }),
      });
      setChaos(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to update chaos config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const reset = await fetchApi<ChaosConfig>('/api/chaos/reset', { method: 'POST' });
      setChaos(reset);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to reset chaos:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel-glow rounded-2xl border border-zap-500/20">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Safe Local Chaos Engineering Lab</h1>
            <p className="text-xs text-slate-400">Inject artificial latency, error rates, and cache outages to test system resilience.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Normal</span>
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-medium text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{loading ? 'Applying...' : 'Apply Experiments'}</span>
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Chaos experiment parameters updated across Fastify middleware!</span>
        </div>
      )}

      {/* Control Panel Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latency Injection */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white">Artificial Latency Injection</label>
            <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 font-mono text-xs font-bold border border-amber-500/30">
              +{chaos.latencyInjectionMs} ms
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Introduces non-blocking delay to all SaaS API workload request handlers.
          </p>
          <input
            type="range"
            min={0}
            max={2000}
            step={50}
            value={chaos.latencyInjectionMs}
            onChange={(e) => setChaos({ ...chaos, latencyInjectionMs: Number(e.target.value) })}
            className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0 ms (Normal)</span>
            <span>500 ms</span>
            <span>1000 ms</span>
            <span>2000 ms (Extreme)</span>
          </div>
        </div>

        {/* Error Injection */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white">HTTP 500 Error Injection</label>
            <span className="px-3 py-1 rounded bg-red-500/10 text-red-400 font-mono text-xs font-bold border border-red-500/30">
              {chaos.errorInjectionPercentage}%
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Randomly fails requests with HTTP 500 status code per specified probability.
          </p>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={chaos.errorInjectionPercentage}
            onChange={(e) => setChaos({ ...chaos, errorInjectionPercentage: Number(e.target.value) })}
            className="w-full accent-red-400 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0% (Zero Errors)</span>
            <span>15%</span>
            <span>30%</span>
            <span>50% (Outage)</span>
          </div>
        </div>

        {/* Cache Disabled Toggle */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Disable Redis Caching Layer</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bypasses Redis lookup, forcing all requests directly onto PostgreSQL.
            </p>
          </div>
          <input
            type="checkbox"
            checked={chaos.cacheDisabled}
            onChange={(e) => setChaos({ ...chaos, cacheDisabled: e.target.checked })}
            className="h-6 w-6 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-800 cursor-pointer"
          />
        </div>

        {/* Traffic Spike Override Toggle */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Trigger Immediate Traffic Spike</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Overrides current traffic pattern multiplier to 300% target RPS.
            </p>
          </div>
          <input
            type="checkbox"
            checked={chaos.trafficSpikeActive}
            onChange={(e) => setChaos({ ...chaos, trafficSpikeActive: e.target.checked })}
            className="h-6 w-6 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-800 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
