import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Shield, Server, Database, Settings, Save, CheckCircle2, Loader2, UserPlus, Trash2, Edit2, Key } from 'lucide-react'

// Mock Data
const INITIAL_USERS = [
  { id: '1', name: 'Vikram Singh', email: 'vikram.singh@ksp.gov.in', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Anjali Sharma', email: 'anjali.sharma@ksp.gov.in', role: 'Investigator', status: 'Active' },
  { id: '3', name: 'Ramesh Kumar', email: 'ramesh.kumar@ksp.gov.in', role: 'Analyst', status: 'Suspended' },
  { id: '4', name: 'Priya Patel', email: 'priya.patel@ksp.gov.in', role: 'Investigator', status: 'Active' },
  { id: '5', name: 'Arjun Reddy', email: 'arjun.reddy@ksp.gov.in', role: 'Admin', status: 'Active' },
  { id: '6', name: 'Sneha Rao', email: 'sneha.rao@ksp.gov.in', role: 'Analyst', status: 'Active' },
  { id: '7', name: 'Karthik N', email: 'karthik.n@ksp.gov.in', role: 'Investigator', status: 'Suspended' },
  { id: '8', name: 'Megha S', email: 'megha.s@ksp.gov.in', role: 'Analyst', status: 'Active' },
];

export default function Administration() {
  const [activeTab, setActiveTab] = useState('users')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // State for Users Tab
  const [users, setUsers] = useState(INITIAL_USERS)
  
  // State for Security Tab
  const [securityConfig, setSecurityConfig] = useState({
    enforce2FA: true,
    passwordExpiration: true,
    sessionTimeout: true,
    ipWhitelisting: false,
    auditLogging: true,
    biometricAuth: true,
  })

  // State for System Config
  const [systemConfig, setSystemConfig] = useState({
    sessionTimeoutMins: 30,
    maxUploadSizeMB: 50,
    defaultDistrict: 'Bengaluru Urban',
    aiModel: 'Gemini 1.5 Pro',
    backupFrequency: 'Daily',
    retentionPeriodDays: 365,
  })

  // State for Database Sync
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState('Today, 10:45 AM')

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API Call
    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }, 1500)
  }

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' }
      }
      return u
    }))
  }

  const changeUserRole = (id: string, newRole: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u))
  }

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      const now = new Date()
      setLastSync(`Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
    }, 2500)
  }

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Investigator' })

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.name || !newUser.email) return
    const user = {
      id: Math.random().toString(36).substring(7),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'Active'
    }
    setUsers([...users, user])
    setNewUser({ name: '', email: '', role: 'Investigator' })
    setIsAddModalOpen(false)
  }

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id))
  }

  const renderUsers = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-slate-200">Manage Users</h3>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-neon hover:bg-neon-bright text-slate-900 text-sm font-medium rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {isAddModalOpen && (
        <form onSubmit={handleAddUser} className="mb-6 p-4 rounded-lg border border-neon/30 bg-neon/5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-neon-bright">Add New User</h4>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">Cancel</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Full Name" 
              required
              value={newUser.name}
              onChange={e => setNewUser({...newUser, name: e.target.value})}
              className="bg-abyss border border-edge text-slate-200 text-sm rounded px-3 py-2 focus:border-neon focus:outline-none"
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={newUser.email}
              onChange={e => setNewUser({...newUser, email: e.target.value})}
              className="bg-abyss border border-edge text-slate-200 text-sm rounded px-3 py-2 focus:border-neon focus:outline-none"
            />
            <select 
              value={newUser.role}
              onChange={e => setNewUser({...newUser, role: e.target.value})}
              className="bg-abyss border border-edge text-slate-200 text-sm rounded px-3 py-2 focus:border-neon focus:outline-none"
            >
              <option value="Admin">Admin</option>
              <option value="Investigator">Investigator</option>
              <option value="Analyst">Analyst</option>
              <option value="Supervisor">Supervisor</option>
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-neon/20 hover:bg-neon/30 text-neon-bright text-sm rounded transition-colors border border-neon/30">
            Confirm Add User
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-edge text-slate-400">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Role</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {users.map(user => (
              <tr key={user.id} className="group">
                <td className="py-4">
                  <div className="font-medium text-slate-200">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </td>
                <td className="py-4">
                  <select 
                    value={user.role}
                    onChange={(e) => changeUserRole(user.id, e.target.value)}
                    className="bg-abyss border border-edge text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-neon"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Investigator">Investigator</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'Active' 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button 
                    onClick={() => toggleUserStatus(user.id)}
                    className="text-xs text-slate-400 hover:text-slate-200 px-2"
                  >
                    {user.status === 'Active' ? 'Suspend' : 'Activate'}
                  </button>
                  <button onClick={() => deleteUser(user.id)} className="text-xs text-rose-400 hover:text-rose-300 px-2 border-l border-edge ml-1">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-slate-200 mb-4">Security Policies</h3>
      
      <div className="space-y-4">
        {Object.entries({
          enforce2FA: { label: 'Enforce Two-Factor Authentication', desc: 'Require all users to setup 2FA on their next login.' },
          passwordExpiration: { label: '90-Day Password Expiration', desc: 'Force password resets every 90 days.' },
          sessionTimeout: { label: 'Strict Session Timeout', desc: 'Log users out after absolute idle time.' },
          ipWhitelisting: { label: 'Enable IP Whitelisting', desc: 'Only allow access from department network ranges.' },
          auditLogging: { label: 'Verbose Audit Logging', desc: 'Record all queries and actions for compliance.' },
          biometricAuth: { label: 'Biometric Fallback', desc: 'Allow face/fingerprint authentication where supported.' },
        }).map(([key, config]) => (
          <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-abyss border border-edge">
            <div>
              <h4 className="text-sm font-medium text-slate-200">{config.label}</h4>
              <p className="text-xs text-slate-500 mt-1">{config.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={securityConfig[key as keyof typeof securityConfig]}
                onChange={(e) => setSecurityConfig({...securityConfig, [key]: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSystemConfig = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-slate-200 mb-4">Global Parameters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Session Timeout (Minutes)</label>
          <input 
            type="number" 
            value={systemConfig.sessionTimeoutMins}
            onChange={(e) => setSystemConfig({...systemConfig, sessionTimeoutMins: Number(e.target.value)})}
            className="w-full bg-abyss border border-edge rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Max Upload Size (MB)</label>
          <input 
            type="number" 
            value={systemConfig.maxUploadSizeMB}
            onChange={(e) => setSystemConfig({...systemConfig, maxUploadSizeMB: Number(e.target.value)})}
            className="w-full bg-abyss border border-edge rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Data Retention (Days)</label>
          <input 
            type="number" 
            value={systemConfig.retentionPeriodDays}
            onChange={(e) => setSystemConfig({...systemConfig, retentionPeriodDays: Number(e.target.value)})}
            className="w-full bg-abyss border border-edge rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Backup Frequency</label>
          <select 
            value={systemConfig.backupFrequency}
            onChange={(e) => setSystemConfig({...systemConfig, backupFrequency: e.target.value})}
            className="w-full bg-abyss border border-edge rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
          >
            <option>Hourly</option>
            <option>Daily</option>
            <option>Weekly</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">AI Model</label>
          <select 
            value={systemConfig.aiModel}
            onChange={(e) => setSystemConfig({...systemConfig, aiModel: e.target.value})}
            className="w-full bg-abyss border border-edge rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
          >
            <option>Gemini 1.5 Pro</option>
            <option>Gemini 1.5 Flash</option>
            <option>Llama 3 (Local)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Default District</label>
          <select 
            value={systemConfig.defaultDistrict}
            onChange={(e) => setSystemConfig({...systemConfig, defaultDistrict: e.target.value})}
            className="w-full bg-abyss border border-edge rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
          >
            <option>Bengaluru Urban</option>
            <option>Mysuru</option>
            <option>Hubballi-Dharwad</option>
            <option>Mangaluru</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderDatabase = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-slate-200 mb-4">Database Synchronization</h3>
      <div className="p-6 rounded-lg bg-abyss border border-edge flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-panel border border-edge flex items-center justify-center mb-4">
          <Database className={`w-8 h-8 text-neon ${isSyncing ? 'animate-pulse' : ''}`} />
        </div>
        <h4 className="text-base font-medium text-slate-200">State Crime Records Bureau (SCRB) Sync</h4>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Manually trigger a sync with the central database to pull in the latest FIRs, suspect profiles, and historical records.
        </p>
        
        <div className="mt-6 flex flex-col items-center gap-3">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-2.5 bg-neon text-void hover:bg-neon-bright rounded-lg text-sm font-semibold transition-colors disabled:opacity-70"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
            {isSyncing ? 'Syncing with SCRB...' : 'Force Sync Now'}
          </button>
          <p className="text-xs text-slate-500 font-mono">Last Synced: {lastSync}</p>
        </div>
      </div>
    </div>
  )

  const renderAdvanced = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-slate-200 mb-4">Advanced Settings</h3>
      
      <div className="p-6 rounded-lg bg-abyss border border-edge">
        <h4 className="text-base font-medium text-slate-200 mb-2">Cache Management</h4>
        <p className="text-sm text-slate-400 mb-4">Clear the local AI heatmap cache to force a re-fetch of spatial data.</p>
        <button className="px-4 py-2 bg-edge hover:bg-edge/80 text-slate-200 text-sm rounded-md transition-colors">
          Clear Cache
        </button>
      </div>

      <div className="p-6 rounded-lg bg-rose-500/10 border border-rose-500/20">
        <h4 className="text-base font-medium text-rose-500 mb-2 flex items-center gap-2">
          <Settings className="w-5 h-5" /> Danger Zone
        </h4>
        <p className="text-sm text-rose-400/80 mb-4">These actions are destructive and cannot be undone. Proceed with caution.</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Purge Audit Logs (Older than 1 year)</span>
            <button className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs rounded border border-rose-500/30 transition-colors">
              Purge Logs
            </button>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-rose-500/10">
            <span className="text-sm text-slate-300">Factory Reset System Configurations</span>
            <button className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs rounded border border-rose-500/30 transition-colors">
              Reset Config
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'users': return renderUsers();
      case 'security': return renderSecurity();
      case 'system': return renderSystemConfig();
      case 'database': return renderDatabase();
      case 'advanced': return renderAdvanced();
      default: return null;
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-200">System Administration</h1>
          <p className="text-sm text-slate-400 mt-1">Manage users, permissions, and system configurations</p>
        </div>
        
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </motion.div>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-neon text-void hover:bg-neon-bright rounded-lg text-sm font-semibold transition-colors disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-64 shrink-0 space-y-1">
          {[
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'security', label: 'Security & Roles', icon: Shield },
            { id: 'system', label: 'System Config', icon: Server },
            { id: 'database', label: 'Database Sync', icon: Database },
            { id: 'advanced', label: 'Advanced Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-neon/10 text-neon border border-neon/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-panel border border-transparent'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </motion.div>
        
        <div className="flex-1 bg-panel border border-edge rounded-xl p-6 min-h-[400px]">
           {renderContent()}
        </div>
      </div>
    </div>
  )
}