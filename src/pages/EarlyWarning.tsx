import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, Activity, MapPin, Eye, ShieldAlert, Crosshair, TrendingUp, Clock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

type Severity = 'Critical' | 'High' | 'Medium';

interface Alert {
  id: string;
  severity: Severity;
  type: string;
  location: string;
  time: string;
  prob: string;
  details: string;
  status: 'active' | 'investigating' | 'resolved';
}

const mockAlerts: Alert[] = [
  { id: 'WARN-809', severity: 'Critical', type: 'Mob Accumulation', location: 'Shivajinagar', time: '2 mins ago', prob: '96%', details: 'Rapid congregation of 50+ individuals detected via CCTV feed anomaly. High probability of escalation.', status: 'active' },
  { id: 'WARN-808', severity: 'High', type: 'Suspicious Vehicle Activity', location: 'ORR Bellandur', time: '14 mins ago', prob: '82%', details: 'Unregistered van circling financial district. Matched partial plates to recent theft syndicate.', status: 'investigating' },
  { id: 'WARN-807', severity: 'High', type: 'Organised Cyber Attack', location: 'Multiple Nodes', time: '45 mins ago', prob: '78%', details: 'Coordinated brute force attempts on state banking infrastructure originating from domestic IPs.', status: 'investigating' },
  { id: 'WARN-806', severity: 'Medium', type: 'Unusual Financial Transfer', location: 'Koramangala Block 5', time: '2 hours ago', prob: '61%', details: 'Multiple high-value transfers detected from flagged accounts associated with narcotics.', status: 'active' },
  { id: 'WARN-805', severity: 'Medium', type: 'Narcotics Dead Drop', location: 'Indiranagar 100ft Rd', time: '3 hours ago', prob: '58%', details: 'Pattern matching suggests dead drop activity in secondary alleyways based on nocturnal movement data.', status: 'active' },
];

const radarData = [
  { subject: 'Mob Activity', A: 89, fullMark: 100 },
  { subject: 'Suspicious Vehicles', A: 72, fullMark: 100 },
  { subject: 'Financial Fraud', A: 81, fullMark: 100 },
  { subject: 'Narcotics', A: 55, fullMark: 100 },
  { subject: 'Cyber Threats', A: 90, fullMark: 100 },
  { subject: 'Violent Crime', A: 45, fullMark: 100 },
];

const trendData = [
  { time: '00:00', risk: 30 },
  { time: '04:00', risk: 25 },
  { time: '08:00', risk: 45 },
  { time: '12:00', risk: 55 },
  { time: '16:00', risk: 85 }, // peak
  { time: '20:00', risk: 70 },
  { time: '24:00', risk: 65 },
];

export default function EarlyWarning() {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  const getSeverityColor = (severity: Severity) => {
    switch(severity) {
      case 'Critical': return 'text-red-500 border-red-500/50 bg-red-500/10';
      case 'High': return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
      case 'Medium': return 'text-blue-500 border-blue-500/50 bg-blue-500/10';
    }
  };

  const getSeverityGlow = (severity: Severity) => {
    switch(severity) {
      case 'Critical': return 'shadow-[0_0_15px_rgba(239,68,68,0.3)]';
      case 'High': return 'shadow-[0_0_15px_rgba(249,115,22,0.2)]';
      case 'Medium': return 'shadow-[0_0_15px_rgba(59,130,246,0.2)]';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
      
      {/* 1. KPI Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-panel border border-edge p-5 rounded-2xl relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
        
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-slate-200">Predictive Early Warning</h1>
            <div className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulseGlow"></div>
              <span className="text-xs font-mono font-bold text-red-400">DEFCON 2</span>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-1">Real-time threat forecasting & spatial anomaly detection</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 lg:gap-8">
           <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Critical Threats</span>
              <div className="flex items-center gap-2 mt-1">
                <AlertOctagon className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-mono font-bold text-slate-200">01</span>
              </div>
           </div>
           <div className="w-px h-10 bg-edge hidden sm:block"></div>
           <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Monitored Zones</span>
              <div className="flex items-center gap-2 mt-1">
                <Crosshair className="w-5 h-5 text-neon" />
                <span className="text-2xl font-mono font-bold text-slate-200">14</span>
              </div>
           </div>
           <div className="w-px h-10 bg-edge hidden sm:block"></div>
           <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">AI Confidence Index</span>
              <div className="flex items-center gap-2 mt-1">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span className="text-2xl font-mono font-bold text-slate-200">94.2%</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* 2. Advanced Threat Timeline */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-edge pb-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-neon" />
              Live Threat Feed
            </h3>
            <span className="text-xs text-slate-500 font-mono">Auto-updating every 30s</span>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence>
              {mockAlerts.map((alert, i) => (
                <motion.div 
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className={`bg-panel border rounded-xl overflow-hidden transition-all duration-300 ${
                    selectedAlert === alert.id ? 'border-neon ring-1 ring-neon/50' : 'border-edge hover:border-slate-600'
                  } ${alert.severity === 'Critical' ? getSeverityGlow(alert.severity) : ''}`}
                >
                  <div 
                    className="p-5 cursor-pointer"
                    onClick={() => setSelectedAlert(selectedAlert === alert.id ? null : alert.id)}
                  >
                    <div className="flex flex-wrap sm:flex-nowrap justify-between items-start gap-4 mb-3">
                       <div className="flex items-start gap-3">
                         <div className={`p-2 rounded-lg border ${getSeverityColor(alert.severity)} shrink-0 mt-1`}>
                           {alert.severity === 'Critical' ? <AlertOctagon className="w-5 h-5"/> : <AlertTriangle className="w-5 h-5"/>}
                         </div>
                         <div>
                           <div className="flex items-center gap-2 flex-wrap">
                             <span className="font-bold text-slate-200 text-lg">{alert.type}</span>
                             <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded border ${getSeverityColor(alert.severity)}`}>
                               {alert.severity}
                             </span>
                             {alert.status === 'investigating' && (
                               <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded border text-emerald-400 border-emerald-500/50 bg-emerald-500/10 flex items-center gap-1">
                                 <CheckCircle2 className="w-3 h-3" /> Under Review
                               </span>
                             )}
                           </div>
                           <div className="flex items-center gap-4 text-sm text-slate-400 mt-1.5 flex-wrap">
                             <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {alert.location}</span>
                             <span className="flex items-center gap-1.5 text-neon-bright font-mono bg-neon/10 px-1.5 py-0.5 rounded"><Eye className="w-4 h-4"/> Prob: {alert.prob}</span>
                           </div>
                         </div>
                       </div>
                       <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5 shrink-0 bg-abyss px-2 py-1 rounded-md border border-edge">
                         <Clock className="w-3.5 h-3.5" /> {alert.time}
                       </span>
                    </div>

                    <AnimatePresence>
                      {selectedAlert === alert.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-4 border-t border-edge">
                            <p className="text-sm text-slate-300 leading-relaxed mb-4">
                              <span className="font-semibold text-slate-500 uppercase text-xs mr-2">AI Context:</span>
                              {alert.details}
                            </p>
                            <div className="flex items-center gap-3">
                              <button className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${
                                alert.severity === 'Critical' 
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                                  : 'bg-neon/10 text-neon hover:bg-neon/20 border border-neon/30'
                              }`}>
                                {alert.severity === 'Critical' ? 'Dispatch Unit Immediately' : 'Assign Investigator'}
                              </button>
                              <button className="px-4 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-white bg-abyss hover:bg-edge border border-edge transition-colors flex items-center gap-2">
                                Deep Analysis <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        
        {/* 3. Analytics & Prediction Panel */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Radar Chart */}
          <div className="bg-panel border border-edge rounded-2xl p-5 relative overflow-hidden flex flex-col h-[340px]">
             {/* Glassmorphic flair */}
             <div className="absolute -top-20 -right-20 w-60 h-60 bg-neon/10 rounded-full blur-[80px] pointer-events-none" />
             
             <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-4 relative z-10">
               <Crosshair className="w-4 h-4 text-neon" />
               Threat Vector Distribution
             </h3>
             <div className="flex-1 w-full relative z-10 -ml-4">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                   <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} />
                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                   <Radar
                     name="Probability"
                     dataKey="A"
                     stroke="#00E5FF"
                     strokeWidth={2}
                     fill="#00E5FF"
                     fillOpacity={0.25}
                   />
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                      itemStyle={{ color: '#00E5FF', fontWeight: 'bold' }}
                   />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* 24-Hour Predictive Trend */}
          <div className="bg-panel border border-edge rounded-2xl p-5 relative overflow-hidden flex flex-col h-[320px]">
             <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-6">
               <TrendingUp className="w-4 h-4 text-neon" />
               24-Hour Risk Forecast
             </h3>
             <div className="flex-1 w-full -ml-4">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                       <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                   <XAxis dataKey="time" stroke="#475569" fontSize={11} tickMargin={10} axisLine={false} />
                   <YAxis stroke="#475569" fontSize={11} tickMargin={10} axisLine={false} tickFormatter={(val) => `${val}%`} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px' }}
                     labelStyle={{ color: '#94a3b8' }}
                     itemStyle={{ color: '#EF4444', fontWeight: 'bold' }}
                   />
                   <Area 
                     type="monotone" 
                     dataKey="risk" 
                     stroke="#EF4444" 
                     strokeWidth={3}
                     fillOpacity={1} 
                     fill="url(#colorRisk)" 
                     animationDuration={1500}
                   />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}