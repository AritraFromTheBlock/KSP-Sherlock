import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import AnimatedBackground from '../AnimatedBackground';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPage = pathSegments.length > 1 ? pathSegments[pathSegments.length - 1] : 'dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-void text-slate-200 relative">
      {/* Live Tactical Surveillance Radar & Dynamic Grid Background */}
      <AnimatedBackground />

      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <TopNav 
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          currentPage={currentPage} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 lg:p-8 w-full max-w-7xl mx-auto min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
