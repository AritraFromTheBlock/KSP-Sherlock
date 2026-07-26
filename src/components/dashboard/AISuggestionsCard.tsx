import React from 'react';
import { BrainCircuit, Sparkles, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import { aiSuggestionsData } from '../../data/mockDashboardData';

export const AISuggestionsCard: React.FC = () => {
  return (
    <div className="flex flex-col h-full rounded-xl border border-edge/80 bg-panel/90 p-5 shadow-lg backdrop-blur-sm relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-edge/60 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-100 tracking-wide">
              AI Suggestions
            </h3>
            <p className="font-mono text-xs text-slate-400 uppercase">
              Predictive Neural Recommendations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
          <Sparkles className="h-3 w-3" />
          <span>NEURAL V2.1</span>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px] custom-scrollbar pr-0.5">
        {aiSuggestionsData.map((item) => (
          <div
            key={item.id}
            className="group p-3.5 rounded-lg border border-edge/60 bg-void/60 hover:border-purple-500/40 hover:bg-void/90 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-body text-sm text-slate-200 group-hover:text-purple-200 transition-colors leading-snug">
                {item.text}
              </p>

              {/* Confidence Badge */}
              <div className="flex flex-col items-end shrink-0">
                <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {item.confidence}%
                </span>
                <span className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">
                  CONFIDENCE
                </span>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-3 w-full bg-edge/40 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${item.confidence}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-edge/30 text-xs font-mono">
              <span className="text-slate-400">{item.district}</span>
              <span className="text-purple-400 font-medium flex items-center gap-1 group-hover:underline cursor-pointer">
                <span>{item.recommendedAction}</span>
                <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-edge/50 flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>VERIFIED BY PATTERN MODEL</span>
        </span>
        <span className="text-slate-500">AUTONOMOUS SYNC</span>
      </div>
    </div>
  );
};
