import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, Filter, ShieldAlert, User, MapPin, X, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import accusedData from '../data/accusedData.json';
import { CriminalProfile } from '../types';
import AddOffenderModal from '../components/AddOffenderModal';

const ITEMS_PER_PAGE = 24;

export default function OffenderProfiling() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [selectedProfile, setSelectedProfile] = useState<CriminalProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [allProfiles, setAllProfiles] = useState<CriminalProfile[]>(accusedData as CriminalProfile[]);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredProfiles = allProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          profile.alias.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || profile.status === statusFilter;
    const matchesRisk = riskFilter === 'All' || profile.riskLevel === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);
  const currentProfiles = filteredProfiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 if search/filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, riskFilter]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'At Large': return 'text-red-400';
      case 'Wanted': return 'text-orange-400';
      case 'On Bail': return 'text-yellow-400';
      case 'In Custody': return 'text-emerald-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon/10 border border-neon/20">
            <Brain className="h-6 w-6 text-neon-bright" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wide text-slate-100">
              Offender Profiling
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mt-1">
              Criminal Behavioral Analysis
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-2 px-3 py-2 bg-neon/10 hover:bg-neon/20 border border-neon/30 text-neon-bright rounded-lg font-semibold text-sm transition-colors whitespace-nowrap w-full sm:w-auto shrink-0">
            <UserPlus className="w-4 h-4" /> Add Offender
          </button>
          
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or alias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-void/50 border border-edge rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-neon focus:shadow-neon-sm transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon cursor-pointer"
            >
              <option className="bg-slate-900 text-slate-200" value="All">All Status</option>
              <option className="bg-slate-900 text-slate-200" value="At Large">At Large</option>
              <option className="bg-slate-900 text-slate-200" value="In Custody">In Custody</option>
              <option className="bg-slate-900 text-slate-200" value="On Bail">On Bail</option>
              <option className="bg-slate-900 text-slate-200" value="Wanted">Wanted</option>
            </select>
            
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-900 border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon cursor-pointer"
            >
              <option className="bg-slate-900 text-slate-200" value="All">All Risks</option>
              <option className="bg-slate-900 text-slate-200" value="Critical">Critical</option>
              <option className="bg-slate-900 text-slate-200" value="High">High</option>
              <option className="bg-slate-900 text-slate-200" value="Medium">Medium</option>
              <option className="bg-slate-900 text-slate-200" value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
        {currentProfiles.map((profile, idx) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex flex-col bg-slate-900 border border-edge rounded-xl p-5 hover:border-neon/50 hover:bg-slate-800 transition-all shadow-lg relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-mono uppercase tracking-wider font-bold rounded-bl-lg border-b border-l ${getRiskColor(profile.riskLevel)}`}>
              {profile.riskLevel} Risk
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-full bg-void border-2 border-edge flex items-center justify-center shrink-0">
                <User className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-200 text-lg leading-tight">
                  {profile.name}
                </h3>
                <p className="font-mono text-xs text-neon mt-0.5">"{profile.alias}"</p>
                <div className="flex items-center gap-2 mt-1.5 font-body text-xs">
                  <span className="text-slate-400">Age: {profile.age}</span>
                  <span className="text-slate-600">•</span>
                  <span className={`font-semibold ${getStatusColor(profile.status)}`}>{profile.status}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-void/40 rounded-lg p-2.5 border border-edge/50">
                <p className="font-mono text-[10px] text-slate-500 uppercase">Cases</p>
                <p className="font-display text-lg font-bold text-slate-200">{profile.cases}</p>
              </div>
              <div className="bg-void/40 rounded-lg p-2.5 border border-edge/50">
                <p className="font-mono text-[10px] text-slate-500 uppercase">Associates</p>
                <p className="font-display text-lg font-bold text-slate-200">{profile.knownAssociates.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-body text-xs text-slate-400 mb-5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{profile.lastKnownLocation}</span>
            </div>

            <div className="mt-auto pt-4 border-t border-edge/50">
              <button 
                onClick={() => setSelectedProfile(profile)}
                className="w-full py-2 rounded-lg bg-neon/10 hover:bg-neon/20 text-neon-bright border border-neon/30 text-xs font-semibold tracking-wide transition-colors"
              >
                View Full Dossier
              </button>
            </div>
          </motion.div>
        ))}
        {filteredProfiles.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-400 border border-dashed border-edge rounded-xl">
            <Search className="h-8 w-8 mb-3 opacity-50" />
            <p>No profiles match your search criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-panel/50 border border-edge rounded-xl p-4">
          <div className="text-sm text-slate-400">
            Showing <span className="text-slate-200 font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-200 font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProfiles.length)}</span> of <span className="text-slate-200 font-medium">{filteredProfiles.length}</span> profiles
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-edge bg-void hover:bg-edge text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-slate-300 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-edge bg-void hover:bg-edge text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProfile(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto z-50 w-full max-w-2xl max-h-[85vh] h-fit bg-slate-900 border border-neon/30 shadow-2xl rounded-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-edge bg-void/50">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-neon-bright" />
                  <h2 className="font-display font-bold text-slate-200 text-lg">Offender Dossier</h2>
                </div>
                <button 
                  onClick={() => setSelectedProfile(null)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                  <div className="h-24 w-24 rounded-2xl bg-void border-2 border-edge flex items-center justify-center shrink-0 shadow-inner">
                    <User className="h-10 w-10 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display text-2xl font-bold text-slate-100">{selectedProfile.name}</h3>
                        <p className="font-mono text-sm text-neon mt-1">Alias: "{selectedProfile.alias}"</p>
                      </div>
                      <div className={`px-3 py-1 text-xs font-mono uppercase tracking-wider font-bold rounded-lg border ${getRiskColor(selectedProfile.riskLevel)}`}>
                        {selectedProfile.riskLevel} Risk
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm font-body">
                      <div>
                        <span className="text-slate-500 block text-xs">Status</span>
                        <span className={`font-semibold ${getStatusColor(selectedProfile.status)}`}>{selectedProfile.status}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">Age</span>
                        <span className="text-slate-200">{selectedProfile.age}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block text-xs">Last Known Location</span>
                        <span className="text-slate-200 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="h-3 w-3 text-neon" /> {selectedProfile.lastKnownLocation}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-widest text-slate-500 border-b border-edge pb-2 mb-3">Crime History</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.crimeHistory.map((crime, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium">
                          {crime}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-widest text-slate-500 border-b border-edge pb-2 mb-3">Known Associates</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.knownAssociates.map((associate, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-void border border-edge text-slate-300 text-xs font-medium flex items-center gap-1.5">
                          <User className="h-3 w-3 text-slate-500" /> {associate}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-widest text-slate-500 border-b border-edge pb-2 mb-3">Total Cases Involved</h4>
                    <p className="text-2xl font-display font-bold text-slate-200">{selectedProfile.cases}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AddOffenderModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAdd={(profile) => setAllProfiles([profile, ...allProfiles])} 
      />
    </div>
  );
}
