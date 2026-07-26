import { motion } from 'framer-motion'
import { AlertOctagon, Activity, MapPin, Eye } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

const mockAlerts = [
  { id: 'WARN-809', severity: 'High', type: 'Mob Accumulation', location: 'Shivajinagar', time: '10 mins ago', prob: '89%' },
  { id: 'WARN-808', severity: 'Medium', type: 'Suspicious Vehicle Activity', location: 'ORR Bellandur', time: '45 mins ago', prob: '72%' },
  { id: 'WARN-807', severity: 'Low', type: 'Unusual Financial Transfer', location: 'Multiple Nodes', time: '2 hours ago', prob: '61%' },
]

const radarData = [
  { subject: 'Mob Activity', A: 89, fullMark: 100 },
  { subject: 'Suspicious Vehicles', A: 72, fullMark: 100 },
  { subject: 'Financial Fraud', A: 61, fullMark: 100 },
  { subject: 'Narcotics', A: 45, fullMark: 100 },
  { subject: 'Cyber Threats', A: 30, fullMark: 100 },
  { subject: 'Violent Crime', A: 55, fullMark: 100 },
]

export default function EarlyWarning() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-200">Early Warning System</h1>
          <p className="text-sm text-slate-400 mt-1">Predictive alerts based on real-time data fusion</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-alert/10 border border-alert/30 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-alert animate-pulseGlow"></span>
            <span className="text-sm font-medium text-alert">3 Active Threats</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Feed */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Live Alert Feed</h3>
          
          {mockAlerts.map((alert, i) => (
            <div key={i} className={`bg-panel border rounded-xl p-5 relative overflow-hidden transition-colors ${
              alert.severity === 'High' ? 'border-alert/50 shadow-alert-sm' : 
              alert.severity === 'Medium' ? 'border-neon/50' : 'border-edge'
            }`}>
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-2">
                   {alert.severity === 'High' ? <AlertOctagon className="text-alert w-5 h-5"/> : <Activity className="text-neon w-5 h-5"/>}
                   <span className="font-bold text-slate-200">{alert.type}</span>
                 </div>
                 <span className="text-xs font-mono text-slate-500">{alert.time}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                 <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {alert.location}</span>
                 <span className="flex items-center gap-1"><Eye className="w-4 h-4"/> Prob: {alert.prob}</span>
              </div>
            </div>
          ))}
        </motion.div>
        
        {/* Radar/Map Integration */}
        <div className="lg:col-span-1 bg-abyss border border-edge rounded-xl min-h-[300px] flex flex-col relative overflow-hidden p-4">
           <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Threat Vectors Radar</h3>
           <div className="flex-1 w-full relative z-10">
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                 <PolarGrid stroke="#2A3241" />
                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                 <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} />
                 <Radar
                   name="Threat Probability"
                   dataKey="A"
                   stroke="#00E5FF"
                   fill="#00E5FF"
                   fillOpacity={0.3}
                 />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#0B101E', borderColor: '#2A3241', color: '#f1f5f9' }}
                    itemStyle={{ color: '#00E5FF' }}
                 />
               </RadarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  )
}