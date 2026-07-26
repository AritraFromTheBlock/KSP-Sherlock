import { motion } from 'framer-motion';
import { useCrimeAnalytics } from '../../context/CrimeAnalyticsContext';
import { Loader2 } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function TemporalHeatmap() {
  const { data, loading } = useCrimeAnalytics();

  if (loading || !data) {
    return (
      <div className="bg-panel border border-edge rounded-xl p-6 min-h-[400px] flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 text-neon animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-sm animate-pulse">Loading heatmap data...</p>
      </div>
    );
  }

  const getColor = (value: number) => {
    if (value === 0) return 'bg-slate-800/50';
    if (value < 20) return 'bg-amber-900/40';
    if (value < 40) return 'bg-amber-700/60';
    if (value < 60) return 'bg-orange-600/70';
    if (value < 80) return 'bg-red-500/80';
    return 'bg-red-600';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.3 }} 
      className="bg-panel border border-edge rounded-xl p-6 min-h-[400px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-slate-200">Temporal Heatmap</h3>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Low</span>
          <div className="flex gap-1">
            {[0, 15, 35, 55, 75, 95].map((val) => (
              <div key={val} className={`w-3 h-3 rounded-sm ${getColor(val)}`} />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[auto_1fr] gap-2">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between py-2 pr-2 text-xs font-mono text-slate-500">
              {DAYS.map(day => <div key={day} className="h-6 flex items-center">{day}</div>)}
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="text-center text-[10px] font-mono text-slate-500 w-5">
                    {i % 2 === 0 ? `${i}h` : ''}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-rows-7 gap-1">
                {DAYS.map((_, dayIndex) => (
                  <div key={dayIndex} className="grid gap-1" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
                    {Array.from({ length: 24 }).map((_, hourIndex) => {
                      const dataPoint = data.heatmapData.find(d => d.day === dayIndex && d.hour === hourIndex);
                      const value = dataPoint ? dataPoint.value : 0;
                      
                      return (
                        <div 
                          key={`${dayIndex}-${hourIndex}`} 
                          className={`w-5 h-5 rounded-sm ${getColor(value)} transition-colors hover:border hover:border-neon cursor-crosshair group relative`}
                        >
                          <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-50">
                            {DAYS[dayIndex]} {hourIndex}:00 - {value} incidents
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
