'use client';

import { useState } from 'react';
import { ShoppingBag, Play, Send } from 'lucide-react';
import { LaunchSimulationModal } from '@/components/LaunchSimulationModal';

export default function EcommercePlaygroundPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState('/api/ecommerce/products');
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [response, setResponse] = useState<any>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const endpoints = [
    { name: 'Product Catalog', method: 'GET', path: '/api/ecommerce/products' },
    { name: 'Search Catalog', method: 'GET', path: '/api/ecommerce/products/search?q=Cloud' },
    { name: 'Product Detail', method: 'GET', path: '/api/ecommerce/products/ROUTER-PRO-01' },
    { name: 'Add to Cart', method: 'POST', path: '/api/ecommerce/cart' },
    { name: 'View Cart', method: 'GET', path: '/api/ecommerce/cart/user-1' },
    { name: 'Checkout Order', method: 'POST', path: '/api/ecommerce/checkout' },
    { name: 'Order History', method: 'GET', path: '/api/ecommerce/orders?userId=user-1' },
  ];

  const handleTestEndpoint = async () => {
    setLoading(true);
    try {
      const start = performance.now();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_URL}${activeEndpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'POST' ? JSON.stringify({ userId: 'user-1', productId: 'ROUTER-PRO-01', quantity: 2 }) : undefined,
      });
      const end = performance.now();
      const json = await res.json();

      setResponse(json);
      setResponseHeaders({
        status: `${res.status} ${res.statusText}`,
        latency: `${Math.round(end - start)} ms`,
        'x-cache': res.headers.get('x-cache') || 'MISS',
      });
    } catch (err: any) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-6 glass-panel-glow rounded-2xl border border-emerald-500/20">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">E-Commerce SaaS Playground</h1>
            <p className="text-xs text-slate-400">Online Retail & High-Concurrency Transactional Workload Target</p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-500/25 transition-all"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Simulate E-Commerce Load</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
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

        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold">
              {method}
            </span>
            <input
              type="text"
              value={activeEndpoint}
              readOnly
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 focus:outline-none"
            />
            <button
              onClick={handleTestEndpoint}
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-xs transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{loading ? 'Executing...' : 'Send Test Request'}</span>
            </button>
          </div>

          {responseHeaders.status && (
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">Status: <strong className="text-emerald-400">{responseHeaders.status}</strong></span>
              <span className="text-slate-400">Latency: <strong className="text-amber-400">{responseHeaders.latency}</strong></span>
              <span className="text-slate-400">Cache: <strong className={responseHeaders['x-cache'] === 'HIT' ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{responseHeaders['x-cache']}</strong></span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-slate-500">Response Payload JSON</label>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto min-h-[220px]">
              {response ? JSON.stringify(response, null, 2) : '// Click "Send Test Request" to trigger endpoint response'}
            </pre>
          </div>
        </div>
      </div>

      <LaunchSimulationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} defaultApp="ecommerce" />
    </div>
  );
}
