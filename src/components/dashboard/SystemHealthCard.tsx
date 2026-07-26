import React from 'react';
import { Server, CheckCircle2, ShieldAlert, Cpu, Database, Network, KeyRound, MapPin, Activity } from 'lucide-react';
import { systemHealthData, SystemHealthItem } from '../../data/mockDashboardData';

export const SystemHealthCard: React.FC = () => {
  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Database':
        return <Database className="h-4 w-4 text-emerald-400" />;
      case 'AI Engine':
        return <Cpu className="h-4 w-4 text-emerald-400" />;
      case 'ML Models':
        return <Activity className="h-4 w-4 text-emerald-400" />;
      case 'API':
        return <Network className="h-4 w-4 text-emerald-400" />;
      case 'Authentication':
        return <KeyRound className="h-4 w-4 text-emerald-400" />;
      case 'Map Service':
      default:
        return <MapPin className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-edge/80 bg-panel/90 p-5 shadow-lg backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-edge/60 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-100 tracking-wide">
              System Health
            </h3>
            <p className="font-mono text-xs text-slate-400 uppercase">
              Infrastructure Status Monitors
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>ALL SYSTEMS GO</span>
        </span>
      </div>

      {/* Health Grid List */}
      <div className="flex-1 grid grid-cols-2 gap-2.5 overflow-y-auto max-h-[320px] custom-scrollbar pr-0.5">
        {systemHealthData.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between p-3 rounded-lg border border-edge/60 bg-void/60 hover:border-emerald-500/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getServiceIcon(item.name)}
                <span className="font-body text-xs font-semibold text-slate-200">
                  {item.name}
                </span>
              </div>

              {/* Status Dot */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-edge/30 pt-2">
              <span className="text-emerald-400 font-medium">{item.status}</span>
              <span>{item.latency}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-edge/50 flex items-center justify-between text-xs font-mono text-slate-400">
        <span>AVG RESPONSE: 8ms</span>
        <span className="text-emerald-400 font-bold">99.98% UPTIME</span>
      </div>
    </div>
  );
};
