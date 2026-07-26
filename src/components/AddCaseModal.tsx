import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus } from 'lucide-react';
import { CaseSummary } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (c: CaseSummary) => void;
}

export default function AddCaseModal({ isOpen, onClose, onAdd }: Props) {
  const [formData, setFormData] = useState<Partial<CaseSummary>>({
    caseNumber: '', title: '', summary: '', status: 'Active', priority: 'High', 
    assignedTo: '', createdDate: new Date().toISOString().split('T')[0], lastUpdated: 'Just now'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      id: `new-case-${Date.now()}`,
    } as CaseSummary);
    // Reset
    setFormData({ caseNumber: '', title: '', summary: '', status: 'Active', priority: 'High', assignedTo: '', createdDate: new Date().toISOString().split('T')[0], lastUpdated: 'Just now' });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-slate-900 border border-neon/30 shadow-2xl rounded-2xl flex flex-col overflow-hidden max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-5 border-b border-edge bg-void/50 shrink-0">
            <div className="flex items-center gap-3">
              <FolderPlus className="h-5 w-5 text-neon-bright" />
              <h2 className="font-display font-bold text-slate-200 text-lg">Create New Case</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Case Number</label>
                <input required type="text" placeholder="e.g. CR-2026-..." className="w-full bg-void border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon" value={formData.caseNumber} onChange={e => setFormData({...formData, caseNumber: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Assigned Investigator</label>
                <input required type="text" className="w-full bg-void border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Case Title</label>
                <input required type="text" className="w-full bg-void border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Status</label>
                <select className="w-full bg-void border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Priority</label>
                <select className="w-full bg-void border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Executive Summary</label>
                <textarea required rows={4} className="w-full bg-void border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon resize-none custom-scrollbar" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} />
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-edge flex justify-end gap-3 shrink-0">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-neon text-slate-900 font-bold rounded-lg hover:bg-neon-bright transition-colors shadow-neon-sm">Save Case</button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
