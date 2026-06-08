import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('transactions.json')) return 'data';
          if (id.includes('echarts')) return 'echarts';
          if (id.includes('recharts')) return 'recharts';
          if (id.includes('@tanstack')) return 'table';
          if (id.includes('zustand')) return 'zustand';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
        }
      }
    }
  },
  base: './',
})
