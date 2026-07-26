import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarClock, AlertTriangle, Loader2 } from 'lucide-react';
import { useCrimeAnalytics } from '../../context/CrimeAnalyticsContext';

const FORECAST_DATA = [
  { day: 'Mon', predicted: 45, range: [40, 50] },
  { day: 'Tue', predicted: 42, range: [35, 48] },
  { day: 'Wed', predicted: 55, range: [48, 62] },
  { day: 'Thu', predicted: 38, range: [32, 45] },
  { day: 'Fri', predicted: 65, range: [58, 75] },
  { day: 'Sat', predicted: 85, range: [75, 95] },
  { day: 'Sun', predicted: 72, range: [65, 82] },
];

export default function PredictionCard() {
  const { data, loading } = useCrimeAnalytics();

  if (loading || !data) {
    return (
      <div className="bg-panel border border-edge rounded-xl p-6 flex flex-col justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-neon animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-sm animate-pulse">Loading predictions...</p>
      </div>
    );
  }

  const { prediction } = data;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.6 }} 
      className="bg-panel border border-edge rounded-xl p-6 flex flex-col min-h-[400px]"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-slate-200">Predictive Analytics</h3>
          <p className="text-xs font-mono text-slate-400 mt-1">7-Day Incident Forecast</p>
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs font-mono border border-emerald-500/30">
          <CalendarClock className="w-3 h-3" />
          <span>{prediction?.confidence || 85}% Confidence</span>
        </div>
      </div>
      
      <div className="w-full h-[220px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={FORECAST_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f1f5f9' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              name="Predicted Incidents"
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#c4b5fd' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
        <p className="text-xs font-mono text-slate-300">
          <span className="text-red-400 font-semibold">High Risk Warning:</span> Expecting a {prediction?.trend || 'surge'} in incidents around {prediction?.hotspot || 'urban zones'}. Pre-emptive deployment recommended.
        </p>
      </div>
    </motion.div>
  );
}
