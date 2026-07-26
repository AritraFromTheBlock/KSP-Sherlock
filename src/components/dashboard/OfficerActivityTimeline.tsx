import React from 'react';
import { History, Eye, Sparkles, UserPlus, CheckCircle2, Clock, Shield, ArrowRight } from 'lucide-react';
import { officerTimelineData, OfficerTimelineItem } from '../../data/mockDashboardData';

export const OfficerActivityTimeline: React.FC = () => {
  const getActionIcon = (category: OfficerTimelineItem['category']) => {
    switch (category) {
      case 'view':
        return <Eye className="h-4 w-4 text-blue-400" />;
      case 'ai':
        return <Sparkles className="h-4 w-4 text-amber-400" />;
      case 'assign':
        return <UserPlus className="h-4 w-4 text-purple-400" />;
      case 'close':
      default:
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    }
  };

  const getCategoryBadge = (category: OfficerTimelineItem['category']) => {
    switch (category) {
      case 'view':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'ai':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'assign':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'close':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="rounded-xl border border-edge/80 bg-panel/90 p-5 md:p-6 shadow-lg backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-edge/60 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon/10 border border-neon/30 text-neon-bright">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-slate-100 tracking-wide">
              Officer Activity Timeline
            </h3>
            <p className="font-mono text-xs text-slate-400 uppercase">
              Audit Log & Shift Action History • Officer ID #INS-4902
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-void px-3 py-1 rounded border border-edge/60 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-neon" />
            <span>SESSION ENCRYPTED</span>
          </span>
        </div>
      </div>

      {/* Horizontal / Grid Timeline Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {officerTimelineData.map((item, idx) => (
          <div
            key={item.id}
            className="group relative rounded-xl border border-edge/60 bg-void/60 p-4 hover:border-neon/40 hover:bg-void/90 transition-all duration-200"
          >
            {/* Step indicator header */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-neon-bright bg-neon/10 px-2.5 py-1 rounded border border-neon/20">
                <Clock className="h-3.5 w-3.5 text-neon" />
                <span>{item.time}</span>
              </div>
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getCategoryBadge(item.category)}`}>
                {item.category}
              </span>
            </div>

            {/* Action title */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-void border border-edge/60 group-hover:border-neon/40">
                {getActionIcon(item.category)}
              </div>
              <h4 className="font-body text-sm font-semibold text-slate-100 group-hover:text-neon-bright transition-colors">
                {item.action}
              </h4>
            </div>

            {/* Target Details */}
            <p className="text-xs text-slate-400 font-body mt-2.5 line-clamp-2 leading-relaxed">
              {item.target}
            </p>
          </div>
        ))}
      </div>

      {/* Footer bar */}
      <div className="mt-6 pt-4 border-t border-edge/50 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-2">
        <span>LOG ARCHIVE AUTO-BACKED TO KSP CLOUD</span>
        <span className="text-neon-bright hover:underline cursor-pointer flex items-center gap-1">
          <span>EXPORT AUDIT DOSSIER</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
};
