import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
    include: ["@pm/schemas"],
  },
})
