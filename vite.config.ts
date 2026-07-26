import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true
  },
  optimizeDeps: {
    include: ['react-is']
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          maps: ['leaflet', 'react-leaflet', 'react-leaflet-cluster', 'leaflet.heat'],
          ui: ['framer-motion', 'lucide-react'],
          firebase: ['firebase/app', 'firebase/auth']
        }
      }
    }
  }
})
