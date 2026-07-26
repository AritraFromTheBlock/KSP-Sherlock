import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { WeatherCard } from '../components/dashboard/WeatherCard';
import { AIIntelligenceBriefing } from '../components/dashboard/AIIntelligenceBriefing';
import { NeuralTraceWidget } from '../components/dashboard/NeuralTraceWidget';

export default function DashboardHome() {
  const [greeting, setGreeting] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date();
      const hours = now.getHours();

      // Dynamic Greeting based on user's local system time
      if (hours >= 5 && hours < 12) {
        setGreeting('Good Morning');
      } else if (hours >= 12 && hours < 17) {
        setGreeting('Good Afternoon');
      } else if (hours >= 17 && hours < 21) {
        setGreeting('Good Evening');
      } else {
        setGreeting('Good Night');
      }

      // Current Time format
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      // Current Date format
      const formattedDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      setCurrentTime(formattedTime);
      setCurrentDate(formattedDate);
    };

    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-8"
    >
      {/* HEADER SECTION: Greeting, Subtitle, Current Time, Current Date, & Weather Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Header Box (Spans 2 columns on LG) */}
        <div className="lg:col-span-2 rounded-xl border border-edge/80 bg-panel/90 p-6 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-neon/10 text-neon-bright border border-neon/30">
                <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
                SYSTEM ONLINE
              </span>
              <span className="text-xs font-mono text-slate-500">• BENGALURU COMMAND HUB</span>
            </div>

            {/* Dynamic Greeting */}
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wide text-slate-100">
              {greeting}, Inspector
            </h1>

            {/* Subtitle */}
            <p className="font-mono text-sm uppercase tracking-widest text-slate-400 mt-1">
              Command Center Ready
            </p>
          </div>

          {/* System Time & Date Status Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-4 border-t border-edge/60">
            {/* Current Time */}
            <div className="flex items-center gap-2.5 bg-void/70 px-3.5 py-2.5 rounded-lg border border-edge/50">
              <Clock className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-500">Current Time</div>
                <div className="text-xs font-mono font-bold text-slate-200">{currentTime}</div>
              </div>
            </div>

            {/* Current Date */}
            <div className="flex items-center gap-2.5 bg-void/70 px-3.5 py-2.5 rounded-lg border border-edge/50">
              <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-500">Current Date</div>
                <div className="text-xs font-mono font-bold text-slate-200 truncate">{currentDate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Card (Right Header Column) */}
        <div className="lg:col-span-1">
          <WeatherCard />
        </div>
      </div>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch min-h-[460px]">
        {/* AI Intelligence Briefing (Main Focus - Occupies ~70% on LG: 7 of 10 cols) */}
        <div className="lg:col-span-7">
          <AIIntelligenceBriefing />
        </div>

        {/* Rotating AI Brain Neural Trace Widget (Occupies ~30% on LG: 3 of 10 cols) */}
        <div className="lg:col-span-3">
          <NeuralTraceWidget />
        </div>
      </div>
    </motion.div>
  );
}
