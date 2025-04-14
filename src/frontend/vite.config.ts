import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  plugins: [sveltekit()],
  server: {
    proxy: {
      '/api': {
        target: 'http://backend:8080', // Use container name instead of localhost
        changeOrigin: true
      }
    }
  }
};

export default config;