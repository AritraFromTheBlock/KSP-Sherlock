import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPage = pathSegments.length > 1 ? pathSegments[pathSegments.length - 1] : 'dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-void text-slate-200">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopNav 
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          currentPage={currentPage} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-void relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon/5 rounded-full blur-[120px] pointer-events-none" />
          
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
