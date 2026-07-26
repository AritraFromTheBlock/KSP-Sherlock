import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Bot, Search, Map, FileText, BarChart2, ArrowRight } from 'lucide-react';
import { quickActionsData, QuickActionItem } from '../../data/mockDashboardData';

export const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate();

  const getIcon = (iconName: QuickActionItem['iconName']) => {
    switch (iconName) {
      case 'bot':
        return <Bot className="h-5 w-5" />;
      case 'search':
        return <Search className="h-5 w-5" />;
      case 'map':
        return <Map className="h-5 w-5" />;
      case 'fileText':
        return <FileText className="h-5 w-5" />;
      case 'barChart':
        return <BarChart2 className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-edge/80 bg-panel/90 p-5 shadow-lg backdrop-blur-sm">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-edge/60 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Zap className="h-5 w-5 fill-amber-400/20" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-100 tracking-wide">
              Quick Actions
            </h3>
            <p className="font-mono text-xs text-slate-400 uppercase">
              Command Dispatch Tools
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-void px-2 py-0.5 rounded border border-edge/50">
          5 SHORTCUTS
        </span>
      </div>

      {/* Buttons Grid */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[320px] custom-scrollbar pr-0.5">
        {quickActionsData.map((action) => (
          <button
            key={action.id}
            onClick={() => navigate(action.path)}
            className="w-full group text-left relative flex items-center justify-between p-3 rounded-lg border border-edge/60 bg-void/60 hover:bg-void hover:border-neon/50 transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br border ${action.color} group-hover:scale-105 transition-transform`}
              >
                {getIcon(action.iconName)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm font-semibold text-slate-200 group-hover:text-neon-bright transition-colors">
                    {action.title}
                  </span>
                  {action.badge && (
                    <span className="text-[9px] font-mono uppercase bg-neon/15 text-neon-bright px-1.5 py-0.5 rounded border border-neon/30">
                      {action.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-1 font-body mt-0.5">
                  {action.description}
                </p>
              </div>
            </div>

            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-neon-bright group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>
        ))}
      </div>

      {/* Footer hint */}
      <div className="mt-4 pt-3 border-t border-edge/50 flex items-center justify-between text-xs font-mono text-slate-400">
        <span>PRESS SHORTCUT TO DISPATCH</span>
        <span className="text-neon-bright font-bold">READY</span>
      </div>
    </div>
  );
};
