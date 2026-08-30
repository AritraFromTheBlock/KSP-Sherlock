import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Filter, FolderOpen, Calendar, User, CheckCircle2, AlertTriangle, Clock, X, ChevronLeft, ChevronRight, FolderPlus, Database } from 'lucide-react';
import { CaseSummary } from '../types';
import AddCaseModal from '../components/AddCaseModal';
import { mongoApiService } from '../services/mongoApiService';

const ITEMS_PER_PAGE = 24;

export default function CaseSummaries() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedCase, setSelectedCase] = useState<CaseSummary | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dataSource, setDataSource] = useState<'mongodb' | 'cache_fallback'>('mongodb');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        const res = await mongoApiService.getCases({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm,
          status: statusFilter,
          priority: priorityFilter,
        });
        if (!isCancelled) {
          setCases(res.data);
          setTotalPages(res.totalPages || 1);
          setTotalCount(res.total || 0);
          setDataSource(res.source);
        }
      } catch (e) {
        console.error('Error fetching cases:', e);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadData();
    return () => { isCancelled = true; };
  }, [currentPage, searchTerm, statusFilter, priorityFilter]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handlePriorityChange = (val: string) => {
    setPriorityFilter(val);
    setCurrentPage(1);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <AlertTriangle className="h-4 w-4 text-emerald-400" />;
      case 'Closed': return <CheckCircle2 className="h-4 w-4 text-slate-400" />;
      case 'Pending': return <Clock className="h-4 w-4 text-amber-400" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon/10 border border-neon/20">
            <FileText className="h-6 w-6 text-neon-bright" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wide text-slate-100">
              Case Summaries
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mt-1">
              Investigation Case Reports
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono border ${
              dataSource === 'mongodb' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <Database className="w-3 h-3" />
              {dataSource === 'mongodb' ? 'MongoDB Live' : 'Offline Cache'}
            </span>
            <button onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-2 px-3 py-2 bg-neon/10 hover:bg-neon/20 border border-neon/30 text-neon-bright rounded-lg font-semibold text-sm transition-colors whitespace-nowrap shrink-0">
              <FolderPlus className="w-4 h-4" /> Add Case
            </button>
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search case # or title..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-void/50 border border-edge rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-neon focus:shadow-neon-sm transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-slate-900 border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon cursor-pointer"
            >
              <option className="bg-slate-900 text-slate-200" value="All">All Status</option>
              <option className="bg-slate-900 text-slate-200" value="Active">Active</option>
              <option className="bg-slate-900 text-slate-200" value="Closed">Closed</option>
              <option className="bg-slate-900 text-slate-200" value="Pending">Pending</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="bg-slate-900 border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon cursor-pointer"
            >
              <option className="bg-slate-900 text-slate-200" value="All">All Priorities</option>
              <option className="bg-slate-900 text-slate-200" value="Critical">Critical</option>
              <option className="bg-slate-900 text-slate-200" value="High">High</option>
              <option className="bg-slate-900 text-slate-200" value="Medium">Medium</option>
              <option className="bg-slate-900 text-slate-200" value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-400">
            <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-mono">Querying cases database...</p>
          </div>
        ) : (
          cases.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="flex flex-col bg-slate-900 border border-edge rounded-xl p-5 hover:border-neon/50 hover:bg-slate-800 transition-all shadow-lg relative"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-neon" />
                  <span className="font-mono text-sm font-bold text-slate-300">{c.caseNumber}</span>
                </div>
                <div className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider font-bold rounded border ${getPriorityColor(c.priority)}`}>
                  {c.priority}
                </div>
              </div>

              <h3 className="font-display font-bold text-slate-100 text-lg mb-2">
                {c.title}
              </h3>
              
              <p className="font-body text-sm text-slate-400 line-clamp-2 mb-4 flex-1">
                {c.summary}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4 font-body text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="truncate">{c.assignedTo}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  {getStatusIcon(c.status)}
                  <span>{c.status}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>Opened: {c.createdDate}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span>Updated: {c.lastUpdated}</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-edge/50">
                <button 
                  onClick={() => setSelectedCase(c)}
                  className="w-full py-2 rounded-lg bg-neon/10 hover:bg-neon/20 text-neon-bright border border-neon/30 text-xs font-semibold tracking-wide transition-colors"
                >
                  View Case File
                </button>
              </div>
            </motion.div>
          ))
        )}
        {!loading && cases.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-400 border border-dashed border-edge rounded-xl">
            <Search className="h-8 w-8 mb-3 opacity-50" />
            <p>No cases match your search criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-panel/50 border border-edge rounded-xl p-4 shrink-0 mt-4">
          <div className="text-sm text-slate-400">
            Showing <span className="text-slate-200 font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-200 font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</span> of <span className="text-slate-200 font-medium">{totalCount}</span> cases
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="p-2 rounded-lg border border-edge bg-void hover:bg-edge text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-slate-300 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="p-2 rounded-lg border border-edge bg-void hover:bg-edge text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Case Details Modal */}
      <AnimatePresence>
        {selectedCase && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCase(null)}
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
                  <FolderOpen className="h-5 w-5 text-neon-bright" />
                  <h2 className="font-display font-bold text-slate-200 text-lg">Case Dossier</h2>
                </div>
                <button 
                  onClick={() => setSelectedCase(null)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-6 border-b border-edge pb-4">
                  <div>
                    <span className="font-mono text-sm text-neon">{selectedCase.caseNumber}</span>
                    <h3 className="font-display text-2xl font-bold text-slate-100 mt-1">{selectedCase.title}</h3>
                  </div>
                  <div className={`px-3 py-1 text-xs font-mono uppercase tracking-wider font-bold rounded-lg border ${getPriorityColor(selectedCase.priority)}`}>
                    {selectedCase.priority} Priority
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6 font-body text-sm">
                  <div>
                    <span className="text-slate-500 block text-xs mb-1">Status</span>
                    <div className="flex items-center gap-2 text-slate-200">
                      {getStatusIcon(selectedCase.status)}
                      <span className="font-medium">{selectedCase.status}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs mb-1">Assigned Investigator</span>
                    <div className="flex items-center gap-2 text-slate-200">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{selectedCase.assignedTo}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs mb-1">Date Opened</span>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {selectedCase.createdDate}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs mb-1">Last Updated</span>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {selectedCase.lastUpdated}
                    </div>
                  </div>
                </div>

                <div className="bg-void/40 rounded-xl p-5 border border-edge/50">
                  <h4 className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-3">Executive Summary</h4>
                  <p className="font-body text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedCase.summary}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AddCaseModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAdd={async (newCase) => {
          setCases(prev => [newCase, ...prev]);
          setTotalCount(c => c + 1);
          await mongoApiService.createCase(newCase);
        }} 
      />
    </div>
  );
}
