import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  plugins: [sveltekit()],
  server: {
    proxy: {
      '/api': 'http://backend:8080' // wherever your Go backend is running
    }
  }
};

export default config;