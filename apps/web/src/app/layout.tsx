import './globals.css';
import { Navigation } from '@/components/Navigation';

export const metadata = {
  title: 'CloudSim — Cloud Simulation & SaaS Workload Playground',
  description: 'Local control plane and asynchronous load simulation engine for SaaS workloads.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 font-sans antialiased min-h-screen">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
