import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Bot,
  FolderSearch,
  Users,
  MapPin,
  BarChart3,
  Brain,
  FileText,
  Search,
  AlertTriangle,
  Landmark,
  TrendingUp,
  MessageSquare,
  Settings,
  UserCircle,
  X,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Bot, label: 'AI Assistant', path: '/dashboard/ai-assistant' },
  { icon: Search, label: 'Mystery Solver', path: '/dashboard/mystery-solver' },
  { icon: FolderSearch, label: 'FIR Search', path: '/dashboard/fir-search' },
  { icon: Users, label: 'Criminal Network', path: '/dashboard/criminal-network' },
  { icon: MapPin, label: 'Crime Heatmap', path: '/dashboard/crime-heatmap' },
  { icon: AlertTriangle, label: 'Early Warning', path: '/dashboard/early-warning' },
  { icon: BarChart3, label: 'Crime Analytics', path: '/dashboard/crime-analytics' },
  { icon: Brain, label: 'Offender Profiling', path: '/dashboard/offender-profiling' },
  { icon: FileText, label: 'Case Summaries', path: '/dashboard/case-summaries' },
  { icon: Search, label: 'Similar Cases', path: '/dashboard/similar-cases' },
  { icon: Landmark, label: 'Financial Crime', path: '/dashboard/financial-crime' },
  { icon: TrendingUp, label: 'Reports', path: '/dashboard/reports' },
  { icon: MessageSquare, label: 'Conversation History', path: '/dashboard/conversation-history' },
];

const bottomNavItems = [
  { icon: Settings, label: 'Administration', path: '/dashboard/administration' },
  { icon: UserCircle, label: 'Profile', path: '/dashboard/profile' },
];

const NavItem = ({ item, isActive, onClick }: { item: any; isActive: boolean; onClick?: () => void }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 mb-1 transition-all duration-200 group relative ${
        isActive
          ? 'bg-neon/10 border-l-2 border-neon text-neon-bright'
          : 'text-slate-400 hover:bg-neon/5 hover:text-slate-200 border-l-2 border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-neon-bright' : 'group-hover:text-neon'}`} />
        <span className="font-mono text-xs uppercase tracking-wider font-medium">{item.label}</span>
      </div>
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="w-1.5 h-1.5 rounded-full bg-neon-bright shadow-neon-sm"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-panel border-r border-edge select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-edge flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://raw.githubusercontent.com/AritraFromTheBlock/KSP-Sherlock/main/public/ksp-logo.svg" 
            alt="KSP Logo" 
            className="h-10 w-auto object-contain drop-shadow-md" 
          />
          <div>
            <h1 className="font-display font-bold text-lg text-slate-100 tracking-wider">
              KSP <span className="text-neon-glow">SHERLOCK</span>
            </h1>
            <p className="text-[10px] font-mono text-neon uppercase tracking-widest">KSP Intelligence Portal</p>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onToggle}
          className="lg:hidden text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-edge/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-edge">
        <div className="px-4 pb-2 mb-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Core Intelligence
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard/');
          return <NavItem key={item.path} item={item} isActive={isActive} onClick={() => window.innerWidth < 1024 && onToggle()} />;
        })}
      </div>

      {/* Bottom Administration List */}
      <div className="p-2 border-t border-edge bg-abyss/40">
        <div className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          System & Settings
        </div>
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return <NavItem key={item.path} item={item} isActive={isActive} onClick={() => window.innerWidth < 1024 && onToggle()} />;
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className={`${isOpen ? 'hidden lg:block' : 'hidden'} w-64 h-screen sticky top-0 z-30 shrink-0`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className="fixed inset-0 bg-void z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-50 lg:hidden bg-void"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
