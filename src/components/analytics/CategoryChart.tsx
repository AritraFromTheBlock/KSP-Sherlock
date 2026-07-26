import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCrimeAnalytics } from '../../context/CrimeAnalyticsContext';
import { Loader2 } from 'lucide-react';

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'];

const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-4">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center text-xs text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
          {entry.value}
        </li>
      ))}
    </ul>
  );
};

export default function CategoryChart() {
  const { data, loading } = useCrimeAnalytics();

  if (loading || !data) {
    return (
      <div className="bg-panel border border-edge rounded-xl p-6 flex flex-col justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 text-neon animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-sm animate-pulse">Loading category data...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.2 }} 
      className="bg-panel border border-edge rounded-xl p-6 flex flex-col h-full min-h-[400px]"
    >
      <h3 className="text-lg font-medium text-slate-200 mb-2">Incidents by Category</h3>
      <div className="w-full h-full flex-1 min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.categoryData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.categoryData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f1f5f9' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend content={renderLegend} verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
