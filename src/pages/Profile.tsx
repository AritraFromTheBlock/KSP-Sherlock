import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, ShieldCheck, Clock, Award, Key, Loader2, CheckCircle2, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { currentUser } = useAuth();
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false)
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)

  // Contact Details State
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [isSavingContact, setIsSavingContact] = useState(false)
  const [contactEmail, setContactEmail] = useState(currentUser?.email || 'officer@ksp.gov.in')
  const [contactPhone, setContactPhone] = useState('+91 98765 43210')
  const [contactForm, setContactForm] = useState({ email: contactEmail, phone: contactPhone })

  // Ensure local state updates if currentUser changes (e.g., login/logout)
  useEffect(() => {
    const userEmail = currentUser?.email;
    if (userEmail) {
      setContactEmail(userEmail)
      setContactForm(prev => ({ ...prev, email: userEmail }))
    }
  }, [currentUser])

  const handleSaveContact = () => {
    setIsSavingContact(true)
    setTimeout(() => {
      setContactEmail(contactForm.email)
      setContactPhone(contactForm.phone)
      setIsEditingContact(false)
      setIsSavingContact(false)
    }, 800)
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        setIsPasswordModalOpen(false)
      }, 2000)
    }, 1500)
  }

  const handleToggle2FA = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setTwoFactorEnabled(!twoFactorEnabled)
      setIs2FAModalOpen(false)
    }, 1000)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-200">Officer Profile</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your credentials and view activity logs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Identity Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 space-y-6">
          <div className="bg-panel border border-edge rounded-xl p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-[radial-gradient(ellipse_at_top,rgba(46,155,255,0.15),transparent)]"></div>
            
            <div className="w-24 h-24 mx-auto bg-abyss border-2 border-neon/50 rounded-full flex items-center justify-center relative z-10 shadow-neon-sm mb-4 overflow-hidden">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-neon" />
              )}
            </div>
            
            <h2 className="text-xl font-bold text-slate-200">{currentUser?.displayName || 'KSP Officer'}</h2>
            <p className="text-sm text-neon font-mono mt-1">KSP-99201</p>
            
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-xs font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Active Duty
              </span>
              <span className="px-2.5 py-1 bg-abyss border border-edge text-slate-400 rounded-full text-xs font-medium">
                Cyber Cell
              </span>
            </div>
          </div>

          <div className="bg-panel border border-edge rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-edge pb-2">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Contact Details</h3>
              {!isEditingContact ? (
                <button 
                  onClick={() => setIsEditingContact(true)}
                  className="text-xs text-neon hover:text-neon-bright font-medium px-2 py-1 bg-neon/10 rounded transition-colors"
                >
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setIsEditingContact(false);
                      setContactForm({ email: contactEmail, phone: contactPhone });
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveContact}
                    disabled={isSavingContact}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1 bg-emerald-500/10 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {isSavingContact ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    Save
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-slate-500 mb-1">Official Email</div>
                {isEditingContact ? (
                  <input 
                    type="email" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-abyss border border-edge text-slate-200 text-sm rounded px-2 py-1 focus:border-neon focus:outline-none"
                  />
                ) : (
                  <div className="text-sm text-slate-200">{contactEmail}</div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-slate-500 mb-1">Secure Line</div>
                {isEditingContact ? (
                  <input 
                    type="tel" 
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full bg-abyss border border-edge text-slate-200 text-sm rounded px-2 py-1 focus:border-neon focus:outline-none"
                  />
                ) : (
                  <div className="text-sm text-slate-200">{contactPhone}</div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings & Logs Area */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">
          
          <div className="bg-panel border border-edge rounded-xl p-6">
            <h3 className="text-lg font-medium text-slate-200 mb-6">Security Settings</h3>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-abyss border border-edge rounded-lg gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-panel border border-edge flex items-center justify-center shrink-0">
                    <Key className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">Change Password</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Last changed 45 days ago</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-4 py-2 bg-edge hover:bg-edge/80 text-slate-200 text-sm rounded-md transition-colors whitespace-nowrap"
                >
                  Update
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-abyss border border-edge rounded-lg gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-panel border border-edge flex items-center justify-center shrink-0">
                    <ShieldCheck className={`w-5 h-5 ${twoFactorEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {twoFactorEnabled ? 'Currently enabled via TOTP App' : 'Currently disabled'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIs2FAModalOpen(true)}
                  className="px-4 py-2 bg-edge hover:bg-edge/80 text-slate-200 text-sm rounded-md transition-colors whitespace-nowrap"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>

          <div className="bg-panel border border-edge rounded-xl p-6">
            <h3 className="text-lg font-medium text-slate-200 mb-6">Recent Activity Log</h3>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-edge before:to-transparent">
              {[
                { action: 'Accessed Case KSP-2026-904', time: 'Today, 09:42 AM', type: 'view' },
                { action: 'Exported Monthly Intelligence Report', time: 'Yesterday, 16:15 PM', type: 'export' },
                { action: 'Logged in from Secure Terminal', time: 'Yesterday, 08:30 AM', type: 'login' },
              ].map((log, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-edge bg-abyss text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-edge bg-abyss">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-200 text-sm">{log.action}</div>
                    </div>
                    <div className="text-slate-500 text-xs font-mono">{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="w-full max-w-md bg-panel border border-edge rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-edge">
                <h3 className="text-lg font-medium text-slate-200">Update Password</h3>
                <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase">Current Password</label>
                  <input type="password" required className="w-full bg-abyss border border-edge rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-neon" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase">New Password</label>
                  <input type="password" required className="w-full bg-abyss border border-edge rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-neon" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase">Confirm New Password</label>
                  <input type="password" required className="w-full bg-abyss border border-edge rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-neon" />
                </div>
                
                {saveSuccess && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" /> Password updated successfully.
                  </div>
                )}
                
                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-neon hover:bg-neon-bright text-slate-900 font-medium text-sm rounded-lg disabled:opacity-70">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    {isSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {is2FAModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="w-full max-w-md bg-panel border border-edge rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-edge">
                <h3 className="text-lg font-medium text-slate-200">Manage Two-Factor Auth</h3>
                <button onClick={() => setIs2FAModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-abyss border border-edge rounded-lg">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${twoFactorEnabled ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
                    {twoFactorEnabled ? <ShieldCheck className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-200">Status: {twoFactorEnabled ? 'Enabled' : 'Disabled'}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {twoFactorEnabled ? 'Your account is protected by an additional layer of security.' : 'Your account is currently vulnerable. We recommend enabling 2FA.'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIs2FAModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm">Close</button>
                  <button 
                    onClick={handleToggle2FA}
                    disabled={isSaving} 
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg disabled:opacity-70 ${
                      twoFactorEnabled 
                        ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                    }`}
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {!isSaving && (twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}