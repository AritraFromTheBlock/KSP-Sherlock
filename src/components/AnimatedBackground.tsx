import { motion } from 'framer-motion'
import FloatingGrid from './FloatingGrid'

/**
 * AnimatedBackground
 * The instrument-panel atmosphere behind the login card:
 * deep-space gradient, a radar sweep, ambient glow orbs, and a
 * slow vertical scanline — the visual signature of the whole page.
 */
export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10 bg-void">
      {/* Base radial gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(46,155,255,0.14), transparent 60%), radial-gradient(ellipse 60% 50% at 85% 85%, rgba(0,229,255,0.08), transparent 60%), #050810',
        }}
      />

      <FloatingGrid />

      {/* Radar sweep, top-right — the "AI is watching" signature element */}
      <div className="absolute -top-40 -right-40 h-[560px] w-[560px] opacity-[0.18]">
        <motion.div
          className="h-full w-full rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(245,166,35,0.5) 360deg)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-6 rounded-full border border-neon/20" />
        <div className="absolute inset-16 rounded-full border border-neon/15" />
        <div className="absolute inset-28 rounded-full border border-neon/10" />
      </div>


      {/* Vignette to keep focus on the card */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,transparent_40%,rgb(var(--color-void))_100%)] opacity-80" />
    </div>
  )
}
