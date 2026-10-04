'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Play, 
  Layers, 
  BarChart3, 
  Zap, 
  AlertTriangle, 
  Settings, 
  Cpu,
  Radio
} from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { name: 'Overview', href: '/dashboard', icon: Activity },
    { name: 'Playground', href: '/playground', icon: Play },
    { name: 'Simulations', href: '/simulations', icon: Layers },
    { name: 'Infrastructure', href: '/infrastructure', icon: Cpu },
    { name: 'Metrics', href: '/metrics', icon: BarChart3 },
    { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
    { name: 'Chaos Lab', href: '/chaos', icon: Zap },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                  CLOUDSIM
                </span>
                <span className="block text-[10px] font-mono text-cyan-400/80 -mt-1 tracking-widest uppercase">
                  Local Simulation Engine
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5" />
              LOCAL DEV ACTIVE
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Header Action Button */}
          <div className="flex items-center space-x-3">
            <Link
              href="/playground"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium text-xs hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Launch Workload</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
