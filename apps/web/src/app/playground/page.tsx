'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, BookOpen, Users, ShoppingBag, ArrowRight, Zap, Database, Server } from 'lucide-react';
import { ApplicationType } from '@cloudsim/shared';
import { LaunchSimulationModal } from '@/components/LaunchSimulationModal';

export default function PlaygroundPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationType>('student_erp');

  const workloads = [
    {
      id: 'student_erp' as ApplicationType,
      name: 'Student ERP',
      icon: BookOpen,
      color: 'from-sky-500 to-blue-600',
      description: 'University administrative workload representing student profile lookup, attendance verification, exam marks calculation, fee status, and notification dispatch.',
      characteristics: ['High Read Ratio (85%)', 'Burst Spikes during Exam Results', 'High Redis Cache Efficiency'],
      operations: [
        'POST /api/erp/auth/login (30%)',
        'GET /api/erp/students/:id (20%)',
        'GET /api/erp/students/:id/attendance (15%)',
        'GET /api/erp/students/:id/marks (15%)',
        'GET /api/erp/students/:id/timetable (10%)',
        'GET /api/erp/students/:id/fees (5%)',
        'GET /api/erp/notifications (5%)',
      ],
      typicalPattern: 'SPIKE / NORMAL',
      link: '/playground/erp',
    },
    {
      id: 'crm' as ApplicationType,
      name: 'CRM Enterprise',
      icon: Users,
      color: 'from-indigo-500 to-purple-600',
      description: 'Customer Relationship Management workload simulating business hour login, pipeline searches, customer contact lookup, and deal creation.',
      characteristics: ['Balanced Read/Write Ratio', 'Ramp Up during Morning Business Hours', 'Heavy Relational Queries'],
      operations: [
        'POST /api/crm/auth/login (25%)',
        'GET /api/crm/customers (25%)',
        'GET /api/crm/customers/:id (15%)',
        'GET /api/crm/leads (15%)',
        'POST /api/crm/leads (10%)',
        'GET /api/crm/opportunities (5%)',
        'GET /api/crm/reports (5%)',
      ],
      typicalPattern: 'RAMP_UP',
      link: '/playground/crm',
    },
    {
      id: 'ecommerce' as ApplicationType,
      name: 'E-Commerce Platform',
      icon: ShoppingBag,
      color: 'from-emerald-500 to-teal-600',
      description: 'High-volume online retail store workload simulating product search, cart manipulation, order checkout transactions, and inventory lookup.',
      characteristics: ['Extremely High Concurrency', 'Flash Sale Traffic Surges', 'Write-heavy Cart & Checkout'],
      operations: [
        'GET /api/ecommerce/products/search (25%)',
        'GET /api/ecommerce/products (25%)',
        'GET /api/ecommerce/products/:id (20%)',
        'POST /api/ecommerce/cart (15%)',
        'POST /api/ecommerce/checkout (10%)',
        'GET /api/ecommerce/orders (5%)',
      ],
      typicalPattern: 'FLASH_SALE / BURST',
      link: '/playground/ecommerce',
    },
  ];

  const handleOpenLaunch = (app: ApplicationType) => {
    setSelectedApp(app);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          SaaS Workload Playground
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select a simulated enterprise application, inspect endpoints, or launch high-concurrency simulations.
        </p>
      </div>

      {/* Workload Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {workloads.map((w) => {
          const Icon = w.icon;
          return (
            <div
              key={w.id}
              className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-slate-800 hover:border-cyan-500/30 transition-all group"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${w.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-cyan-400 font-mono text-[10px] uppercase font-semibold">
                    {w.typicalPattern}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {w.name}
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {w.description}
                </p>

                {/* Characteristics */}
                <div className="space-y-2 mb-4">
                  <span className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                    Characteristics
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {w.characteristics.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px] font-mono border border-slate-700">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Operations */}
                <div className="space-y-1.5 mb-6">
                  <span className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                    Workload Distribution
                  </span>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1 max-h-36 overflow-y-auto font-mono text-[11px] text-slate-300">
                    {w.operations.map((op, idx) => (
                      <div key={idx} className="flex justify-between border-b border-slate-800/40 py-0.5 last:border-0">
                        <span>{op}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleOpenLaunch(w.id)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Launch Simulation</span>
                </button>

                <Link
                  href={w.link}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                >
                  <span>Explore Endpoints</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <LaunchSimulationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultApp={selectedApp}
      />
    </div>
  );
}
