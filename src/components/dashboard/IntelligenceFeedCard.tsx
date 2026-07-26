import React from 'react';
import { Activity, Radio, Clock, ShieldCheck, Flame, RefreshCcw, FileCheck } from 'lucide-react';
import { intelligenceFeedData, FeedItem } from '../../data/mockDashboardData';

export const IntelligenceFeedCard: React.FC = () => {
  const getFeedIcon = (category: FeedItem['category']) => {
    switch (category) {
      case 'hotspot':
        return <Flame className="h-3.5 w-3.5 text-amber-400" />;
      case 'risk':
        return <RefreshCcw className="h-3.5 w-3.5 text-purple-400" />;
      case 'fir':
        return <Radio className="h-3.5 w-3.5 text-blue-400" />;
      case 'summary':
      default:
        return <FileCheck className="h-3.5 w-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-edge/80 bg-panel/90 p-5 shadow-lg backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-edge/60 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-100 tracking-wide">
              Intelligence Feed
            </h3>
            <p className="font-mono text-xs text-slate-400 uppercase">
              Real-time Event Stream
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          STREAMING
        </span>
      </div>

      {/* Vertical Timeline Feed */}
      <div className="flex-1 space-y-4 relative pl-3 overflow-y-auto max-h-[320px] custom-scrollbar pr-1">
        {/* Timeline Connecting Line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-edge/60" />

        {intelligenceFeedData.map((item) => (
          <div key={item.id} className="relative flex items-start gap-3 group">
            {/* Timeline Node Icon */}
            <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-void border border-edge group-hover:border-neon-bright transition-colors">
              {getFeedIcon(item.category)}
            </div>

            {/* Event Content */}
            <div className="flex-1 rounded-lg border border-edge/50 bg-void/50 p-2.5 group-hover:border-neon/30 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-body text-sm font-semibold text-slate-200 group-hover:text-neon-bright transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 shrink-0">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>{item.time}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-body mt-1">
                {item.details}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-edge/50 flex items-center justify-between text-xs font-mono text-slate-400">
        <span>AUTO-INDEXED BY KSP ENGINE</span>
        <span className="text-emerald-400 font-bold">100% SYNCED</span>
      </div>
    </div>
  );
};
