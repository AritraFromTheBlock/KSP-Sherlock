import { motion } from 'framer-motion';
import { Sparkles, Brain, ShieldAlert, Crosshair, Map, Loader2 } from 'lucide-react';
import { useCrimeAnalytics } from '../../context/CrimeAnalyticsContext';

export default function AIInsights() {
  const { data, loading } = useCrimeAnalytics();

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      case 'recommendation': return <Crosshair className="w-5 h-5 text-emerald-500" />;
      case 'alert': return <Map className="w-5 h-5 text-red-500" />;
      default: return <Sparkles className="w-5 h-5 text-blue-500" />;
    }
  };

  if (loading || !data) {
    return (
      <div className="bg-panel border border-neon/30 rounded-xl p-6 relative overflow-hidden shadow-neon-sm min-h-[300px] flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 text-neon animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-sm animate-pulse">Generating AI insights...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.7 }} 
      className="bg-panel border border-neon/30 rounded-xl p-6 relative overflow-hidden shadow-neon-sm"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-dim via-neon to-neon-bright" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-abyss rounded-lg border border-neon/50 shadow-neon-sm">
          <Brain className="w-5 h-5 text-neon-bright animate-pulseGlow" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-slate-200">Sherlock AI Insights</h3>
          <p className="text-xs font-mono text-slate-400">Automated Analysis & Recommendations</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {data.insights.map((insight, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            key={i} 
            className="flex gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-colors"
          >
            <div className="shrink-0 mt-0.5">
              {getIcon(insight.type)}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-mono">
              {insight.message}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
