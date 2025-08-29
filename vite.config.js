// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',  // where index.html is
  server: {
    port: 3000,   // you can change if needed
    open: true    // auto-open browser on start
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
