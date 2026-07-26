import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface TopNavProps {
  onSidebarToggle: () => void;
  currentPage: string;
}

const TopNav: React.FC<TopNavProps> = ({ onSidebarToggle, currentPage }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email.substring(0, 2).toUpperCase();
    }
    return 'SI';
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-panel/60 backdrop-blur-xl border-b border-edge px-4 lg:px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onSidebarToggle}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="hidden sm:flex items-center text-sm">
          <span className="text-slate-500">KSP /</span>
          <span className="ml-2 font-medium text-slate-200 capitalize">{currentPage.replace(/-/g, ' ')}</span>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-4">
        <div className="relative group hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-neon" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-edge rounded-lg leading-5 bg-abyss/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:bg-abyss focus:border-neon focus:ring-1 focus:ring-neon transition-colors duration-200 sm:text-sm"
            placeholder="Search cases, suspects, FIRs..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-edge/50 rounded-lg transition-colors">
          <Bell size={20} />
        </button>

        <div className="relative z-50" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 border-l border-edge pl-4 lg:pl-6 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-neon/30 object-cover" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-neon/20 flex items-center justify-center text-neon-bright font-bold text-sm border border-neon/30">
                {getInitials()}
              </div>
            )}
            <ChevronDown size={16} className={`text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180 text-neon-bright' : ''}`} />
          </div>
          
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-56 rounded-xl border border-edge bg-slate-900 shadow-neon-md backdrop-blur-xl overflow-hidden py-1 z-[100]"
              >
                <div className="px-4 py-3 border-b border-edge mb-1 bg-slate-900">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {currentUser?.displayName || 'KSP Officer'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {currentUser?.email || 'ksp-officer@ksp.gov.in'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-alert hover:bg-alert/10 transition-colors bg-slate-900"
                >
                  <LogOut size={16} />
                  <span>Secure Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
