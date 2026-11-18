import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          web3: ['viem'],
          motion: ['framer-motion', 'gsap', 'lenis'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
