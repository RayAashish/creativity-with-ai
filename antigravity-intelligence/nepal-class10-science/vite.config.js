import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 3002
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    chunkSizeWarningLimit: 1200
  }
});
