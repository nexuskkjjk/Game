import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
