import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// GitHub Pages: https://omgdash.github.io/nogori-pintar-2040-uat/
export default defineConfig({
  base: '/nogori-pintar-2040-uat/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(process.cwd(), '.') },
  },
});
