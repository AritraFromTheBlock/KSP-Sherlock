import { motion } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';
import { useCrimeAnalytics } from '../../context/CrimeAnalyticsContext';

export default function StationPerformance() {
  const { data, loading } = useCrimeAnalytics();

  if (loading || !data) {
    return (
      <div className="bg-panel border border-edge rounded-xl p-6 min-h-[300px] flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 text-neon animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-sm animate-pulse">Loading performance metrics...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.5 }} 
      className="bg-panel border border-edge rounded-xl p-6"
    >
      <h3 className="text-lg font-medium text-slate-200 mb-6">Station Performance</h3>
      <div className="space-y-6">
        {data.stationPerformance.map((station, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neon-dim" />
                <span className="text-sm font-medium text-slate-200">{station.station}</span>
              </div>
              <span className="text-xs font-mono text-emerald-400">{station.clearanceRate}% Clearance</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                  <span>Cases Solved</span>
                  <span>{station.solved} / {station.assigned}</span>
                </div>
                <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden border border-edge">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${(station.solved / station.assigned) * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                  <span>Avg Response</span>
                  <span>{station.avgResponse}</span>
                </div>
                <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden border border-edge">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${100 - parseInt(station.avgResponse) * 2}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
