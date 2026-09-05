import { motion } from 'framer-motion'
import FloatingGrid from './FloatingGrid'

/**
 * AnimatedBackground
 * High-tech tactical surveillance atmosphere:
 * Deep steel navy gradient, live rotating surveillance radar sweep with concentric range rings,
 * glowing target blips, crosshairs, and drifting surveillance network nodes.
 */
export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
      {/* Deep Steel Dark Blue Ambient Military Atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 25%, #0f254c 0%, #081730 45%, #030a18 100%)',
        }}
      />

      {/* Floating Tactical Grid & Drifting Nodes */}
      <FloatingGrid />

      {/* Prominent Live Rotating Tactical Surveillance Radar (Top-Right) */}
      <div className="absolute -top-28 -right-28 h-[720px] w-[720px] opacity-[0.45]">
        {/* Rotating Radar Conic Beam with Bright Leading Sweep */}
        <motion.div
          className="h-full w-full rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(0, 229, 255, 0.08) 310deg, rgba(0, 240, 255, 0.45) 358deg, rgba(255, 255, 255, 0.95) 360deg)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Glowing Radar Core & Ping */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_16px_#00e5ff] animate-ping opacity-80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyan-200 shadow-[0_0_10px_#00e5ff]" />

        {/* Concentric Distance / Range Rings with Glowing Cyan Borders */}
        <div className="absolute inset-8 rounded-full border border-cyan-400/35" />
        <div className="absolute inset-24 rounded-full border border-cyan-400/25" />
        <div className="absolute inset-40 rounded-full border border-cyan-400/20" />
        <div className="absolute inset-56 rounded-full border border-cyan-400/15" />

        {/* Crosshair Axes */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-400/25 shadow-[0_0_6px_#00e5ff]" />
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-cyan-400/25 shadow-[0_0_6px_#00e5ff]" />

        {/* Diagonal Bearing Lines */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-400/15 rotate-45" />
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-400/15 -rotate-45" />

        {/* Live Radar Target Blips */}
        <motion.div
          className="absolute w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00e5ff]"
          style={{ top: '30%', left: '65%' }}
          animate={{ opacity: [0.15, 1, 0.2], scale: [0.8, 1.4, 0.9] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]"
          style={{ top: '65%', left: '38%' }}
          animate={{ opacity: [0.2, 1, 0.1], scale: [0.9, 1.3, 0.9] }}
          transition={{ duration: 4.1, repeat: Infinity, delay: 1, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]"
          style={{ top: '42%', left: '78%' }}
          animate={{ opacity: [0.1, 0.95, 0.2], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 3.6, repeat: Infinity, delay: 1.8, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-neon-bright shadow-[0_0_8px_#fcd34d]"
          style={{ top: '55%', left: '60%' }}
          animate={{ opacity: [0.1, 1, 0.15], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 2.4, ease: 'easeInOut' }}
        />
      </div>

      {/* Subtle Soft Vignette for Visual Focus */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_50%,#030712_100%)] opacity-40" />
    </div>
  )
}
