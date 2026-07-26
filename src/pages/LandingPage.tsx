import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Brain, Network, Zap } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-void font-body text-slate-200 selection:bg-neon/30 selection:text-neon-bright">
      <AnimatedBackground />

      {/* Background Map Design */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center lg:justify-end overflow-hidden opacity-30 lg:pr-10 mix-blend-screen">
        <motion.img 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src="/karnataka-map.png" 
          alt="" 
          className="h-[120vh] w-auto max-w-none" 
          style={{ 
            filter: 'invert(65%) sepia(85%) saturate(300%) hue-rotate(345deg) drop-shadow(0 0 15px rgba(245,166,35,0.6))' 
          }}
        />
      </div>

      <header className="relative z-10 w-full border-b border-edge bg-panel/40 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/ksp-logo.svg" alt="Karnataka State Police Logo" className="h-12 w-auto drop-shadow-md" />
            <div>
              <h1 className="font-display text-xl font-bold tracking-widest text-slate-100">
                KSP <span className="text-neon-glow">SHERLOCK</span>
              </h1>
              <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
                Department of Police &middot; Government of Karnataka
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login?mode=signin"
              className="rounded-lg border border-transparent px-4 py-2 font-mono text-xs uppercase tracking-wider text-slate-300 transition-all hover:text-neon-bright"
            >
              Sign In
            </Link>
            <Link
              to="/login?mode=signup"
              className="rounded-lg border border-neon/50 bg-neon/10 px-6 py-2 font-mono text-xs uppercase tracking-wider text-neon-bright transition-all hover:bg-neon hover:text-void hover:shadow-neon-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center px-4 pt-20 pb-24 text-center sm:pt-32 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-neon-bright">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-bright opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-bright"></span>
            </span>
            System Online &middot; Secure Network
          </span>

          <h2 className="mt-8 font-display text-5xl font-bold tracking-tight text-white sm:text-7xl">
            AI-Powered Crime
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-bright via-neon-glow to-neon-dim drop-shadow-sm">
              Intelligence Platform
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400 font-light">
            Empowering Karnataka State Police with advanced artificial intelligence to analyze patterns, predict threats, and solve complex cases faster than ever before.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login?mode=signup"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-neon-dim via-neon to-neon-bright px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-widest text-slate-900 shadow-neon-md transition-transform hover:scale-105"
            >
              <Shield className="h-5 w-5" />
              Secure Access Terminal
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="mt-24 grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8"
        >
          {[
            {
              icon: Brain,
              title: 'Predictive Analytics',
              desc: 'Anticipate criminal activity using historical data and ML models.',
            },
            {
              icon: Network,
              title: 'Network Mapping',
              desc: 'Automatically connect the dots between suspects and organizations.',
            },
            {
              icon: Zap,
              title: 'Real-time Intelligence',
              desc: 'Instant alerts and insights deployed directly to field officers.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-edge bg-panel/60 p-8 backdrop-blur-xl transition-all hover:border-neon/50 hover:bg-panel/80 hover:shadow-neon-lg"
            >
              <div className="mb-4 inline-flex rounded-xl bg-neon/10 p-3 text-neon-bright transition-transform group-hover:scale-110 group-hover:bg-neon/20">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold text-slate-200">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {feature.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="absolute bottom-0 w-full border-t border-edge bg-void py-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          &copy; {new Date().getFullYear()} Karnataka State Police. All Rights Reserved. Restricted Access.
        </p>
      </footer>
    </div>
  );
}
