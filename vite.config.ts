import { defineConfig } from 'vite';
import { posApiPlugin } from './vite-api-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [posApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
  }
});

