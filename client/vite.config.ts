import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    proxy: {
      // The Express API (server/) owns the Anthropic key — never call it
      // directly from the browser. This proxy just avoids CORS pain in dev;
      // the server itself already sends permissive CORS headers too.
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
