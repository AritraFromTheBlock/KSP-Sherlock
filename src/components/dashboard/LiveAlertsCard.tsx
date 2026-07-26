import React from 'react';
import { ShieldAlert, Bell, MapPin, Clock, ArrowRight } from 'lucide-react';
import { liveAlertsData, LiveAlertItem } from '../../data/mockDashboardData';

export const LiveAlertsCard: React.FC = () => {
  const getPriorityBadge = (priority: LiveAlertItem['priority']) => {
    switch (priority) {
      case 'High':
        return {
          dotColor: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
          badgeStyle: 'bg-red-500/10 text-red-400 border-red-500/30',
        };
      case 'Medium':
        return {
          dotColor: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
          badgeStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      case 'Low':
      default:
        return {
          dotColor: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]',
          badgeStyle: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        };
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-edge/80 bg-panel/90 p-5 shadow-lg backdrop-blur-sm">
      {/* Card Title Header */}
      <div className="flex items-center justify-between border-b border-edge/60 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            <Bell className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-100 tracking-wide">
              Live Alerts
            </h3>
            <p className="font-mono text-xs text-slate-400 uppercase">
              {liveAlertsData.length} Unresolved Flagged Incidents
            </p>
          </div>
        </div>

        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
      </div>

      {/* Scrollable Alerts List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[320px] custom-scrollbar">
        {liveAlertsData.map((alert) => {
          const { dotColor, badgeStyle } = getPriorityBadge(alert.priority);
          return (
            <div
              key={alert.id}
              className="group relative rounded-lg border border-edge/60 bg-void/60 p-3.5 hover:border-neon/40 hover:bg-void/90 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${dotColor}`} />
                  <div>
                    <h4 className="font-body text-sm font-semibold text-slate-200 group-hover:text-neon-bright transition-colors">
                      {alert.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        {alert.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {alert.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border shrink-0 font-medium ${badgeStyle}`}
                >
                  {alert.priority}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t border-edge/50 flex items-center justify-between text-xs font-mono text-slate-400 hover:text-neon-bright transition-colors cursor-pointer">
        <span>VIEW ALL ALERT LOGS</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
};
