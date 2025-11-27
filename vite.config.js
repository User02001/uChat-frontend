import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { stylex } from 'vite-plugin-stylex-dev'
import fs from 'fs'

export default defineConfig({
 plugins: [
  react(),
  stylex({
   classNamePrefix: 'u',
  }),
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
     ? '_[hash:base64:8]_[hash:base64:8]_[hash:base64:8]'
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
   fs.existsSync('./192.168.1.48+3-key.pem') &&
   fs.existsSync('./192.168.1.48+3.pem')
   ? {
    https: {
     key: fs.readFileSync('./192.168.1.48+3-key.pem'),
     cert: fs.readFileSync('./192.168.1.48+3.pem'),
    },
   }
   : {}),
  host: '0.0.0.0',
  port: 5173,
 },
})