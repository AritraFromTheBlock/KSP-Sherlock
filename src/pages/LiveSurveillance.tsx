import { motion } from 'framer-motion'
import { Filter, PlayCircle } from 'lucide-react'

export default function LiveSurveillance() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 sm:p-6 gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-200">Live Surveillance Feed</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time CCTV grid with AI object detection</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-abyss border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none">
            <option>Grid: 2x2</option>
            <option>Grid: 3x3</option>
            <option>Grid: 4x4</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-panel border border-edge rounded-lg text-sm text-slate-300 hover:bg-edge/50 transition-colors">
            <Filter className="w-4 h-4" /> Filter Zones
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
        {/* Camera Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 grid grid-cols-2 gap-2 sm:gap-4">
          {[1, 2, 3, 4].map((cam) => (
            <div key={cam} className="bg-abyss border border-edge rounded-xl relative overflow-hidden flex items-center justify-center group cursor-pointer">
              <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                <span className="w-2 h-2 rounded-full bg-alert animate-pulseGlow"></span>
                <span className="text-xs font-mono font-medium text-slate-200 bg-panel/80 px-2 py-0.5 rounded backdrop-blur-sm border border-edge">
                  CAM-{100 + cam} | ORR Junction
                </span>
              </div>
              <PlayCircle className="w-12 h-12 text-slate-600 opacity-50 group-hover:opacity-100 group-hover:text-neon transition-all" />
            </div>
          ))}
        </motion.div>
        
        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 bg-panel border border-edge rounded-xl p-4 flex flex-col">
           <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4 border-b border-edge pb-2">Live AI Detections</h3>
           <div className="flex-1 overflow-y-auto space-y-3">
             <div className="p-3 bg-abyss border border-edge rounded-lg">
                <p className="text-xs text-neon font-mono mb-1">CAM-102 &middot; Just now</p>
                <p className="text-sm text-slate-200">Face Match: Suspect #892 (87% confidence)</p>
             </div>
             <div className="p-3 bg-abyss border border-edge rounded-lg">
                <p className="text-xs text-slate-500 font-mono mb-1">CAM-101 &middot; 2 min ago</p>
                <p className="text-sm text-slate-200">Unattended baggage detected near gate 3.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}