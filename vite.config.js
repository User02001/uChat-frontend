import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import fs from 'fs'

export default defineConfig({
 plugins: [
  react(),
  nodePolyfills({
   globals: {
    Buffer: true,
    global: true,
    process: true,
   },
   protocolImports: true,
  })
 ],
 css: {
  modules: {
   generateScopedName:
    process.env.NODE_ENV === 'production'
     ? '_[hash:base64:6]'
     : '[name]__[local]__[hash:base64:3]',
  }
 },
 define: {
  global: 'globalThis',
  __dirname: JSON.stringify('/'),
 },
 resolve: {
  alias: {
   buffer: 'buffer',
   process: 'process/browser',
  }
 },
 optimizeDeps: {
  include: ['simple-peer'],
 },
 build: {
  outDir: 'dist-obfuscated',
 },
 server: {
  ...(process.env.NODE_ENV !== 'production' &&
   fs.existsSync('../uChat-backend/server.key') &&
   fs.existsSync('../uChat-backend/server.crt')
   ? {
    https: {
     key: fs.readFileSync('../uChat-backend/server.key'),
     cert: fs.readFileSync('../uChat-backend/server.crt'),
    },
   }
   : {}),
  host: '0.0.0.0',
  port: 5173,
 },
})