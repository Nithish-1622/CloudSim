'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Radio, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@cloudsim.local');
  const [password, setPassword] = useState('password123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 glass-panel-glow rounded-2xl shadow-2xl border border-cyan-500/30">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 items-center justify-center text-cyan-400 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            CloudSim Control Plane
          </h2>
          <p className="text-xs text-slate-400 mt-1">Authenticate to access local workload playground.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">User Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/20 transition-all active:scale-98"
          >
            <span>Sign In to CloudSim</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
          Local Development Mode — Credentials auto-configured.
        </div>
      </div>
    </div>
  );
}
