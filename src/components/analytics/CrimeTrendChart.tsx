import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCrimeAnalytics } from '../../context/CrimeAnalyticsContext';
import { Loader2 } from 'lucide-react';

export default function CrimeTrendChart() {
  const { data, loading } = useCrimeAnalytics();

  if (loading || !data) {
    return (
      <div className="bg-panel border border-edge rounded-xl p-6 min-h-[400px] flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 text-neon animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-sm animate-pulse">Loading trend data...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.1 }} 
      className="bg-panel border border-edge rounded-xl p-6 min-h-[400px] flex flex-col"
    >
      <h3 className="text-lg font-medium text-slate-200 mb-6">Crime Volume Trend</h3>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f1f5f9' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Area type="monotone" dataKey="incidents" name="Total Incidents" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncidents)" />
            <Area type="monotone" dataKey="resolved" name="Cases Resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
