import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Brain, Network, Zap } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'Predictive Analytics',
      desc: 'ML crime pattern & risk forecasting',
    },
    {
      icon: Network,
      title: 'Network Mapping',
      desc: 'Automated syndicate & suspect graph',
    },
    {
      icon: Zap,
      title: 'Real-time Intelligence',
      desc: 'Instant tactical field alerts',
    },
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-void font-body text-slate-200 selection:bg-neon/30 selection:text-neon-bright flex flex-col justify-between">
      <AnimatedBackground />

      {/* Background Map Design */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center lg:justify-end overflow-hidden opacity-25 lg:pr-12 mix-blend-screen">
        <motion.img 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src="/karnataka-map.png" 
          alt="" 
          className="h-[105vh] w-auto max-w-none" 
          style={{ 
            filter: 'invert(65%) sepia(85%) saturate(300%) hue-rotate(345deg) drop-shadow(0 0 25px rgba(245,166,35,0.6))' 
          }}
        />
      </div>

      {/* Clean Top Header */}
      <header className="relative z-10 w-full border-b border-edge/60 bg-panel/30 backdrop-blur-md px-6 py-3.5 shrink-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://raw.githubusercontent.com/AritraFromTheBlock/KSP-Sherlock/main/public/ksp-logo.svg" 
              alt="Karnataka State Police Logo" 
              className="h-10 w-auto drop-shadow-md" 
            />
            <div>
              <h1 className="font-display text-xl font-bold tracking-widest text-slate-100">
                KSP <span className="text-neon-glow">SHERLOCK</span>
              </h1>
              <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
                Department of Police &middot; Government of Karnataka
              </p>
            </div>
          </div>

          {/* Top Right Auth Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/auth?mode=signin"
              className="inline-flex items-center justify-center min-w-[96px] h-9 px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-neon-bright hover:bg-slate-800/80 border border-slate-800/80 hover:border-neon/40 transition-all cursor-pointer shadow-sm active:scale-95 text-center"
            >
              Sign In
            </Link>
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center justify-center min-w-[96px] h-9 px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-neon-dim via-neon to-neon-bright hover:scale-105 active:scale-95 shadow-neon-sm hover:shadow-neon border border-transparent transition-all cursor-pointer text-center"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Centered Hero with Perfectly Balanced Proportions */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center my-auto py-3">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-4xl flex flex-col items-center w-full"
        >
          {/* Status Badge */}
          <span className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neon-bright shadow-neon-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-bright opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-bright"></span>
            </span>
            System Online &middot; Secure Network
          </span>

          {/* Heading - Balanced Sweet Spot */}
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-tight text-white leading-[1.12]">
            AI-Powered Crime
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-bright via-neon-glow to-neon-dim drop-shadow-md">
              Intelligence Platform
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mt-4 max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed text-slate-300 font-light">
            Empowering Karnataka State Police with advanced artificial intelligence to analyze patterns, predict threats, and solve complex cases faster than ever before.
          </p>

          {/* Secure Access Terminal Button */}
          <div className="mt-7 flex items-center justify-center w-full">
            <Link
              to="/auth?mode=signup"
              className="flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-neon-dim via-neon to-neon-bright px-9 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-slate-900 shadow-neon-lg transition-all hover:scale-105 hover:shadow-neon-xl active:scale-95"
            >
              <Shield className="h-4.5 w-4.5" />
              Secure Access Terminal
            </Link>
          </div>

          {/* Feature Badges Placed Horizontally Below Button */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl w-full"
          >
            {features.map((feature, i) => (
              <div
                key={i}
                className="group flex items-center gap-3 p-3 rounded-xl border border-edge/80 bg-slate-900/80 backdrop-blur-md hover:border-neon/50 hover:bg-slate-800/90 transition-all cursor-default text-left shadow-md"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neon/10 text-neon-bright transition-transform group-hover:scale-110">
                  <feature.icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-display text-xs sm:text-sm font-semibold text-slate-100 truncate">
                    {feature.title}
                  </span>
                  <span className="block font-body text-[10px] sm:text-[11px] text-slate-400 mt-0.5 leading-snug truncate">
                    {feature.desc}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Pinned Bottom Footer */}
      <footer className="relative z-10 w-full border-t border-edge/50 bg-void/80 py-2.5 text-center shrink-0">
        <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
          &copy; {new Date().getFullYear()} Karnataka State Police. All Rights Reserved. Restricted Access.
        </p>
      </footer>
    </div>
  );
}
