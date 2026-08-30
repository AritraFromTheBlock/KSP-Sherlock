import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/server/escalation_function': {
        target: 'https://ksp-sherlock-60077726539.development.catalystserverless.in',
        changeOrigin: true,
        secure: false,
      },
      '/server/chatbot_function': {
        target: 'https://ksp-sherlock-60077726539.development.catalystserverless.in',
        changeOrigin: true,
        secure: false,
      },
    },
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
