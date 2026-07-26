import { useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * FloatingGrid
 * A faint perspective HUD grid with drifting "case node" points,
 * evoking a live surveillance / network-graph instrument panel.
 */
export default function FloatingGrid() {
  const nodes = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 5,
        duration: 6 + Math.random() * 6,
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Perspective grid */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.12]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#2E9BFF" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Drifting network nodes connected by faint lines to center */}
      {nodes.map((n) => (
        <motion.span
          key={n.id}
          className="absolute rounded-full bg-neon-glow shadow-neon-sm"
          style={{
            top: `${n.top}%`,
            left: `${n.left}%`,
            width: n.size,
            height: n.size,
          }}
          animate={{
            opacity: [0.15, 0.7, 0.15],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: n.duration,
            delay: n.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
