import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus } from 'lucide-react';
import { CriminalProfile } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (profile: CriminalProfile) => void;
}

export default function AddOffenderModal({ isOpen, onClose, onAdd }: Props) {
  const [formData, setFormData] = useState<Partial<CriminalProfile>>({
    name: '', alias: '', age: 30, status: 'Wanted', riskLevel: 'High', 
    lastKnownLocation: '', cases: 0, crimeHistory: [], knownAssociates: []
  });

  const [crimeInput, setCrimeInput] = useState('');
  const [associateInput, setAssociateInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      id: `new-offender-${Date.now()}`,
    } as CriminalProfile);
    // Reset
    setFormData({ name: '', alias: '', age: 30, status: 'Wanted', riskLevel: 'High', lastKnownLocation: '', cases: 0, crimeHistory: [], knownAssociates: [] });
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
              <UserPlus className="h-5 w-5 text-neon-bright" />
              <h2 className="font-display font-bold text-slate-200 text-lg">Add New Offender</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Full Name</label>
                <input required type="text" className="w-full bg-void border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Alias</label>
                <input type="text" className="w-full bg-void border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon" value={formData.alias} onChange={e => setFormData({...formData, alias: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Age</label>
                <input required type="number" min="10" max="100" className="w-full bg-void border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Status</label>
                <select className="w-full bg-void border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                  <option value="At Large">At Large</option>
                  <option value="In Custody">In Custody</option>
                  <option value="On Bail">On Bail</option>
                  <option value="Wanted">Wanted</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Risk Level</label>
                <select className="w-full bg-void border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon" value={formData.riskLevel} onChange={e => setFormData({...formData, riskLevel: e.target.value as any})}>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Last Known Location</label>
                <input required type="text" className="w-full bg-void border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon" value={formData.lastKnownLocation} onChange={e => setFormData({...formData, lastKnownLocation: e.target.value})} />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Crime History (Press Enter to add)</label>
                <input 
                  type="text" 
                  className="w-full bg-void border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon" 
                  value={crimeInput} 
                  onChange={e => setCrimeInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (crimeInput.trim()) {
                        setFormData({...formData, crimeHistory: [...(formData.crimeHistory||[]), crimeInput.trim()]});
                        setCrimeInput('');
                      }
                    }
                  }} 
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.crimeHistory?.map((c, i) => (
                    <span key={i} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] rounded flex items-center gap-1">
                      {c} <button type="button" onClick={() => setFormData({...formData, crimeHistory: formData.crimeHistory?.filter((_, idx) => idx !== i)})}><X className="w-3 h-3 hover:text-red-100"/></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-edge flex justify-end gap-3 shrink-0">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-neon text-slate-900 font-bold rounded-lg hover:bg-neon-bright transition-colors shadow-neon-sm">Save Profile</button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
