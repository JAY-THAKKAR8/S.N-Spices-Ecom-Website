import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // dev: /api calls go to Express
    proxy: { '/api': 'http://localhost:5001' },
  },
});
