import path from 'path';
import { defineConfig } from 'vite';

// Do not inject secrets into the client bundle.
export default defineConfig(() => ({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
}));
