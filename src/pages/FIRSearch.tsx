import { motion } from 'framer-motion'
import { Search, Filter, FileText, ChevronRight, Calendar, MapPin } from 'lucide-react'

export default function FIRSearch() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 sm:p-6 gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-200">FIR Database Search</h1>
          <p className="text-sm text-slate-400 mt-1">Search and filter across millions of registered records</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
        {/* Search & Filters */}
        <div className="w-full lg:w-80 shrink-0 bg-panel border border-edge rounded-xl p-5 flex flex-col space-y-6 overflow-y-auto">
           <div>
             <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Keyword / FIR No.</label>
             <div className="relative">
               <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
               <input type="text" placeholder="e.g. 0124/2026..." className="w-full bg-abyss border border-edge rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-200 outline-none focus:border-neon focus:shadow-neon-sm transition-all" />
             </div>
           </div>
           
           <div>
             <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Date Range</label>
             <div className="grid grid-cols-2 gap-2">
                 <div className="relative">
                   <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                   <input type="text" placeholder="From" className="w-full bg-abyss border border-edge rounded-lg pl-8 pr-2 py-2 text-sm text-slate-200 outline-none" />
                 </div>
                 <div className="relative">
                   <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                   <input type="text" placeholder="To" className="w-full bg-abyss border border-edge rounded-lg pl-8 pr-2 py-2 text-sm text-slate-200 outline-none" />
                 </div>
             </div>
           </div>
           
           <div>
             <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Police Station</label>
             <select className="w-full bg-abyss border border-edge rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none">
                <option>All Stations</option>
                <option>Central Zone</option>
                <option>North Zone</option>
             </select>
           </div>
           
           <div>
             <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Crime Type</label>
             <select className="w-full bg-abyss border border-edge rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none">
                <option>All Types</option>
                <option>Cyber Crime</option>
                <option>Theft</option>
                <option>Assault</option>
             </select>
           </div>
           
           <button className="mt-auto w-full py-2.5 bg-neon/10 border border-neon/30 text-neon font-medium text-sm rounded-lg hover:bg-neon hover:text-void transition-colors flex items-center justify-center gap-2">
             <Filter className="w-4 h-4" /> Apply Filters
           </button>
        </div>
        
        {/* Results List */}
        <div className="flex-1 bg-panel border border-edge rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-edge bg-abyss/50 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Showing 1-10 of 124 results</span>
            <span className="text-xs text-slate-500 font-mono">Query took 0.04s</span>
          </div>
          <div className="flex-1 overflow-y-auto">
             {[1, 2, 3, 4, 5, 6].map((row) => (
                <div key={row} className="p-5 border-b border-edge hover:bg-abyss/50 transition-colors cursor-pointer group flex gap-4 items-start">
                   <div className="mt-1 w-10 h-10 rounded-full bg-abyss border border-edge flex items-center justify-center group-hover:border-neon/50 group-hover:text-neon transition-colors text-slate-500">
                     <FileText className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                         <h4 className="font-medium text-slate-200 group-hover:text-neon transition-colors">FIR 0{row}24/2026</h4>
                         <span className="text-xs font-mono text-slate-500">Jul {10 + row}, 2026</span>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">Suspect identified in relation to the cyber fraud case reported at Central Division. Financial records indicate unauthorized transfer of funds to offshore accounts.</p>
                      <div className="flex items-center gap-4 mt-3">
                         <span className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="w-3.5 h-3.5" /> Central Div.</span>
                         <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium bg-abyss border border-edge text-slate-300">Cyber Crime</span>
                      </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-neon mt-2" />
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}