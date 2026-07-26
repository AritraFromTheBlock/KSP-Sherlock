import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, ShieldAlert } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useCrimeAnalytics } from '../../context/CrimeAnalyticsContext';

const MOCK_SPARKLINE = [
  { value: 40 }, { value: 30 }, { value: 45 }, { value: 50 }, { value: 48 }, { value: 60 }
];

export default function KPISection() {
  const { data, loading } = useCrimeAnalytics();

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-panel border border-edge rounded-xl p-5 h-32 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="h-2 bg-slate-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Map API KPIs to their respective icons and colors
  const getIcon = (label: string) => {
    if (label.includes('Incidents')) return { icon: ShieldAlert, color: '#3b82f6' };
    if (label.includes('Clearance')) return { icon: TrendingUp, color: '#10b981' };
    if (label.includes('Personnel')) return { icon: Users, color: '#8b5cf6' };
    return { icon: BarChart3, color: '#f59e0b' };
  };

  const kpis = data.kpis.map(kpi => {
    const { icon, color } = getIcon(kpi.label);
    return { ...kpi, icon, color };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((stat, i) => (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: i * 0.05 }} 
          key={i} 
          className="bg-panel border border-edge rounded-xl p-5 relative overflow-hidden group cursor-pointer hover:border-neon/50 hover:bg-slate-800/80 transition-all hover:shadow-neon-sm"
        >
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="mt-2 text-2xl font-display font-bold text-slate-200">{stat.value}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-abyss border border-edge flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-neon" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between relative z-10">
            <div className="text-xs font-mono">
              <span className={stat.trend.startsWith('+') ? 'text-emerald-500' : stat.trend.startsWith('-') ? 'text-alert' : 'text-slate-500'}>{stat.trend}</span>
              <span className="text-slate-500 ml-2">vs prev</span>
            </div>
            
            <div className="h-8 w-24 opacity-60 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_SPARKLINE}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={stat.color} 
                    strokeWidth={2} 
                    dot={false}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
