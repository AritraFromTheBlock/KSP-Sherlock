import React, { useState, useEffect } from 'react';
import { ShieldAlert, Sparkles, Clock, Calendar, Cpu, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { dailyIntelligenceBriefData } from '../../data/mockDashboardData';

export const DailyIntelligenceBrief: React.FC = () => {
  const [timeString, setTimeString] = useState<string>('');
  const [dateString, setDateString] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateString(now.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-neon/30 bg-gradient-to-r from-abyss via-panel to-abyss p-6 md:p-8 shadow-xl shadow-black/50">
      {/* Background HUD Glow and Grid lines */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-neon/10 blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon via-amber-400 to-amber-600 opacity-80" />

      {/* Header section with Date, Time, System status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-edge/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neon/15 border border-neon/30 text-neon-bright shadow-neon-sm">
            <Cpu className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-neon/10 text-neon-bright border border-neon/30">
                <span className="h-1.5 w-1.5 rounded-full bg-neon animate-ping" />
                COMMAND SYSTEM ONLINE
              </span>
              <span className="hidden sm:inline-block text-slate-500">•</span>
              <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
                KSP-INTEL-V4.2
              </span>
            </div>
            <h2 className="font-display text-xl md:text-2xl font-bold tracking-wide text-slate-100 mt-1">
              Good Morning, {dailyIntelligenceBriefData.officerName}
            </h2>
          </div>
        </div>

        {/* Live Date & Time HUD Badge */}
        <div className="flex items-center gap-4 bg-void/70 border border-edge/80 px-4 py-2.5 rounded-lg text-slate-200">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Calendar className="h-4 w-4 text-neon-bright" />
            <span>{dateString || '21 JUL 2026'}</span>
          </div>
          <div className="h-4 w-px bg-edge" />
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-neon-bright">
            <Clock className="h-4 w-4 text-neon" />
            <span className="tracking-widest">{timeString || '17:09:40 IST'}</span>
          </div>
        </div>
      </div>

      {/* Summary Content Body */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-display font-semibold text-base tracking-wide">
            <Sparkles className="h-4 w-4 text-neon-bright" />
            <span>Today's Intelligence Summary</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {dailyIntelligenceBriefData.summaryBullets.map((bullet, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-3 p-3.5 rounded-lg bg-void/50 border border-edge/50 hover:border-neon/30 transition-all duration-200"
              >
                <div className="mt-1 h-2 w-2 rounded-full bg-neon shrink-0 shadow-neon-sm" />
                <p className="text-sm text-slate-300 leading-relaxed font-body">
                  {bullet.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Level Quick Gauge */}
        <div className="rounded-lg bg-void/80 border border-edge/80 p-4 flex flex-col justify-between h-full">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Precinct Threat Level
            </div>
            <div className="flex items-center gap-2 mt-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span className="font-display font-bold text-xl text-amber-400 tracking-wider">
                {dailyIntelligenceBriefData.threatLevel}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-body">
              {dailyIntelligenceBriefData.activeHotspotsCount} Active Hotspots • {dailyIntelligenceBriefData.pendingReviewCount} High Priority Pending
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-edge/40 flex items-center justify-between text-xs font-mono text-neon-bright hover:underline cursor-pointer">
            <span>RUN FULL THREAT SYNC</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
