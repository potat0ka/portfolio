import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const base = process.env.VITE_BASE || '/';
  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      manifest: true,
    },
    server: {
      // HMR can be disabled via DISABLE_HMR for restricted/CI-like environments.
      // When DISABLE_HMR is true, file watching is disabled to reduce churn.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        "/api": "http://localhost:8000",
        "/admin": "http://localhost:8000",
        "/static": "http://localhost:8000",
        "/media": "http://localhost:8000",
        "/profile_photo.png": "http://localhost:8000",
        "/virtual_shield.png": "http://localhost:8000",
        "/Bigendra_Shrestha_CV.pdf": "http://localhost:8000",
        "/__ping": "http://localhost:8000",
        "/__healthz": "http://localhost:8000",
        "/__readyz": "http://localhost:8000",
      },
    },
  };
});
