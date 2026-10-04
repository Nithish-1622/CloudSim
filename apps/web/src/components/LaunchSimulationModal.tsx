'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, X, Zap, Layers, Activity } from 'lucide-react';
import { PRESET_SCENARIOS, ApplicationType, TrafficPattern, WorkloadIntensity } from '@cloudsim/shared';
import { fetchApi } from '@/lib/api';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultApp?: ApplicationType;
}

export function LaunchSimulationModal({ isOpen, onClose, defaultApp }: ModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    application: defaultApp || 'student_erp',
    virtualUsers: 10000,
    targetRps: 500,
    durationSeconds: 60,
    trafficPattern: 'SPIKE' as TrafficPattern,
    cacheEnabled: true,
    intensity: 'MEDIUM' as WorkloadIntensity,
  });

  if (!isOpen) return null;

  const handleApplyPreset = (presetId: string) => {
    const preset = PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (preset) {
      setForm({
        name: preset.name,
        application: preset.application,
        virtualUsers: preset.virtualUsers,
        targetRps: preset.targetRps,
        durationSeconds: preset.durationSeconds,
        trafficPattern: preset.trafficPattern,
        cacheEnabled: preset.cacheEnabled,
        intensity: preset.intensity,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetchApi<{ id: string }>('/api/simulations', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      onClose();
      router.push(`/simulations/${res.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl glass-panel-glow rounded-2xl p-6 shadow-2xl border border-cyan-500/30 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Configure Workload Simulation</h3>
              <p className="text-xs text-slate-400">Set logical user scale, target throughput, and traffic pattern.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Presets Quick Picker */}
        <div className="my-4">
          <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Preset Scenarios</label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_SCENARIOS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p.id)}
                className="text-left px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-xs"
              >
                <div className="font-semibold text-cyan-300">{p.name}</div>
                <div className="text-[11px] text-slate-400">
                  {p.virtualUsers.toLocaleString()} users • {p.targetRps} RPS • {p.trafficPattern}
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Application */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Simulation Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. ERP Spike Benchmark"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Target Workload</label>
              <select
                value={form.application}
                onChange={(e) => setForm({ ...form, application: e.target.value as ApplicationType })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="student_erp">Student ERP</option>
                <option value="crm">CRM</option>
                <option value="ecommerce">E-Commerce</option>
              </select>
            </div>
          </div>

          {/* Virtual Users & Target RPS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Logical Virtual Users: <span className="text-cyan-400 font-bold">{form.virtualUsers.toLocaleString()}</span>
              </label>
              <select
                value={form.virtualUsers}
                onChange={(e) => setForm({ ...form, virtualUsers: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value={10}>10 Virtual Users</option>
                <option value={100}>100 Virtual Users</option>
                <option value={1000}>1,000 Virtual Users</option>
                <option value={10000}>10,000 Virtual Users</option>
                <option value={100000}>100,000 Virtual Users</option>
                <option value={500000}>500,000 Virtual Users</option>
                <option value={1000000}>1,000,000 Virtual Users</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Target Requests/Sec (RPS): <span className="text-cyan-400 font-bold">{form.targetRps}</span>
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                value={form.targetRps}
                onChange={(e) => setForm({ ...form, targetRps: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Duration & Traffic Pattern */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Duration (Seconds)</label>
              <select
                value={form.durationSeconds}
                onChange={(e) => setForm({ ...form, durationSeconds: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value={30}>30 Seconds</option>
                <option value={60}>60 Seconds (1 Min)</option>
                <option value={120}>120 Seconds (2 Mins)</option>
                <option value={300}>300 Seconds (5 Mins)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Traffic Pattern</label>
              <select
                value={form.trafficPattern}
                onChange={(e) => setForm({ ...form, trafficPattern: e.target.value as TrafficPattern })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="NORMAL">NORMAL (Steady State)</option>
                <option value="RAMP_UP">RAMP_UP (Gradual Rise)</option>
                <option value="RAMP_DOWN">RAMP_DOWN (Gradual Fall)</option>
                <option value="SPIKE">SPIKE (Mid-Run Surge)</option>
                <option value="BURST">BURST (High/Low Oscillation)</option>
                <option value="FLASH_SALE">FLASH_SALE (Initial Surge)</option>
                <option value="CHAOS">CHAOS (Unpredictable Wave)</option>
              </select>
            </div>
          </div>

          {/* Cache & Intensity */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="cacheEnabled"
                checked={form.cacheEnabled}
                onChange={(e) => setForm({ ...form, cacheEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-800"
              />
              <label htmlFor="cacheEnabled" className="text-xs font-medium text-slate-200">
                Enable Redis Response Caching
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-mono text-slate-400">Intensity:</label>
              <select
                value={form.intensity}
                onChange={(e) => setForm({ ...form, intensity: e.target.value as WorkloadIntensity })}
                className="px-2 py-1 rounded bg-slate-800 text-xs text-white border border-slate-700 focus:outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="EXTREME">EXTREME</option>
              </select>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{loading ? 'Submitting...' : 'Queue & Start Simulation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
