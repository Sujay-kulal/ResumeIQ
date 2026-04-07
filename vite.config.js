import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist', 'mammoth'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('pdfjs-dist')) return 'pdf-libs';
          if (id.includes('@google/generative-ai')) return 'gemini';
          if (id.includes('firebase')) return 'firebase';
        },
      },
    },
  },
})
