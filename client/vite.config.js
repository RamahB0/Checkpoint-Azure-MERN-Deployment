import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for the React frontend. In local development, requests to
// /api are proxied to the Express backend (server.js) running on
// port 5000. In production, the built files in ./build are served
// directly by that same Express app (see server/app.js), so no proxy
// is needed there - it's all one origin on Azure.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
