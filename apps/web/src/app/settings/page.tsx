'use client';

import { Settings, Cpu, HardDrive, ShieldCheck, Server } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="p-6 glass-panel-glow rounded-2xl border border-slate-800">
        <h1 className="text-xl font-extrabold text-white">CloudSim System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Platform execution limits, safety ceilings, and local node configuration.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-cyan-400 uppercase font-mono tracking-wider">
          Local Development Safety Ceilings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono">
            <span className="text-xs text-slate-400">Max Logical Virtual Users</span>
            <div className="text-lg font-bold text-white">1,000,000 Users</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono">
            <span className="text-xs text-slate-400">Max Target Throughput</span>
            <div className="text-lg font-bold text-white">5,000 RPS</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono">
            <span className="text-xs text-slate-400">Worker Concurrency Limit</span>
            <div className="text-lg font-bold text-white">5 Parallel Jobs</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono">
            <span className="text-xs text-slate-400">Max Simulation Duration</span>
            <div className="text-lg font-bold text-white">3,600 Seconds (1 Hour)</div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <h3 className="text-sm font-bold text-slate-200">Runtime Connection Strings</h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-900 text-slate-300">
              API Server: <strong className="text-cyan-400">http://localhost:4000</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-900 text-slate-300">
              WebSocket Server: <strong className="text-cyan-400">ws://localhost:4000</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-900 text-slate-300">
              PostgreSQL DB: <strong className="text-cyan-400">postgresql://cloudsim:***@localhost:5432/cloudsim_db</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-900 text-slate-300">
              Redis Instance: <strong className="text-cyan-400">redis://localhost:6379</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
