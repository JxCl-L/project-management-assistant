import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pinned to 5174 (Vite's default is 5173). The old fullstack-react clone
  // also uses 5173; sharing a port means the browser caches collide and
  // throws "Outdated Optimize Dep" 504s whenever you switch between the
  // two apps. A distinct port makes the browser treat them as separate
  // origins and the cache problem goes away.
  server: {
    port: 5174,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // @pm/schemas is a CommonJS workspace package. Vite skips pre-bundling
  // for workspace packages by default and serves the raw files, which the
  // browser can't parse as ESM. Forcing it into optimizeDeps tells esbuild
  // to pre-bundle and convert the CJS named exports to native ESM.
  optimizeDeps: {
    include: ["@pm/schemas", "@pm/permissions"],
  },
})
