/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: 'rgb(var(--color-void) / <alpha-value>)',
        abyss: 'rgb(var(--color-abyss) / <alpha-value>)',
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        edge: 'rgb(var(--color-edge) / <alpha-value>)',
        neon: {
          DEFAULT: '#F5A623',
          bright: '#FCD34D',
          glow: '#FBBF24',
          dim: '#B45309',
        },
        alert: '#FF3B5C',
        slate: {
          200: 'var(--text-primary)',
          400: 'var(--text-secondary)',
          500: 'var(--text-muted)',
          600: '#4A5674',
        },
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-sm': '0 0 8px rgba(245,166,35,0.45)',
        'neon-md': '0 0 24px rgba(245,166,35,0.35), 0 0 4px rgba(252,211,77,0.6)',
        'neon-lg': '0 0 60px rgba(245,166,35,0.25)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        pulseGlow: {
          '0%,100%': { opacity: 0.5 },
          '50%': { opacity: 1 },
        },
        drift: {
          '0%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(-12px,-18px)' },
          '100%': { transform: 'translate(0,0)' },
        },
      },
      animation: {
        scan: 'scan 4s linear infinite',
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        drift: 'drift 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
