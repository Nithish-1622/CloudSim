'use client';

import { useState } from 'react';
import { BookOpen, Play, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { LaunchSimulationModal } from '@/components/LaunchSimulationModal';

export default function ErpPlaygroundPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState('/api/erp/students/student-1');
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [response, setResponse] = useState<any>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const endpoints = [
    { name: 'Student Profile', method: 'GET', path: '/api/erp/students/student-1' },
    { name: 'Student Attendance', method: 'GET', path: '/api/erp/students/student-1/attendance' },
    { name: 'Student Marks', method: 'GET', path: '/api/erp/students/student-1/marks' },
    { name: 'Timetable Schedule', method: 'GET', path: '/api/erp/students/student-1/timetable' },
    { name: 'Student Fees Summary', method: 'GET', path: '/api/erp/students/student-1/fees' },
    { name: 'System Notifications', method: 'GET', path: '/api/erp/notifications' },
    { name: 'ERP Login Auth', method: 'POST', path: '/api/erp/auth/login' },
  ];

  const handleTestEndpoint = async () => {
    setLoading(true);
    try {
      const start = performance.now();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_URL}${activeEndpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'POST' ? JSON.stringify({ email: 'student1@university.edu', password: 'password123' }) : undefined,
      });
      const end = performance.now();
      const json = await res.json();

      setResponse(json);
      setResponseHeaders({
        status: `${res.status} ${res.statusText}`,
        latency: `${Math.round(end - start)} ms`,
        'x-cache': res.headers.get('x-cache') || 'MISS',
        'x-request-id': res.headers.get('x-request-id') || 'N/A',
      });
    } catch (err: any) {
      setResponse({ error: err.message });
      setResponseHeaders({ status: '500 Error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 glass-panel-glow rounded-2xl border border-sky-500/20">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Student ERP SaaS Playground</h1>
            <p className="text-xs text-slate-400">University Administrative & Student Portal Workload Target</p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-sky-500/25 transition-all"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Simulate ERP Load</span>
        </button>
      </div>

      {/* Endpoint Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar List */}
        <div className="glass-panel p-4 rounded-2xl space-y-2 border border-slate-800">
          <h3 className="text-xs font-mono uppercase text-slate-400 px-2 mb-2">Available Endpoints</h3>
          {endpoints.map((ep) => (
            <button
              key={ep.path}
              onClick={() => {
                setActiveEndpoint(ep.path);
                setMethod(ep.method as any);
              }}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between text-xs ${
                activeEndpoint === ep.path
                  ? 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                  : 'bg-slate-900/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div>
                <div className="font-semibold">{ep.name}</div>
                <div className="font-mono text-[10px] text-slate-500">{ep.path}</div>
              </div>
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
              }`}>
                {ep.method}
              </span>
            </button>
          ))}
        </div>

        {/* Request Tester & Response */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold">
              {method}
            </span>
            <input
              type="text"
              value={activeEndpoint}
              readOnly
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none"
            />
            <button
              onClick={handleTestEndpoint}
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium text-xs transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{loading ? 'Executing...' : 'Send Test Request'}</span>
            </button>
          </div>

          {/* Response Inspector */}
          {responseHeaders.status && (
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">Status: <strong className="text-emerald-400">{responseHeaders.status}</strong></span>
              <span className="text-slate-400">Latency: <strong className="text-amber-400">{responseHeaders.latency}</strong></span>
              <span className="text-slate-400">Cache: <strong className={responseHeaders['x-cache'] === 'HIT' ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{responseHeaders['x-cache']}</strong></span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-slate-500">Response Payload JSON</label>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-cyan-300 font-mono text-xs overflow-x-auto min-h-[220px]">
              {response ? JSON.stringify(response, null, 2) : '// Click "Send Test Request" to trigger endpoint response'}
            </pre>
          </div>
        </div>
      </div>

      <LaunchSimulationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} defaultApp="student_erp" />
    </div>
  );
}
