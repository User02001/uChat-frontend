// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
 plugins: [react()],
 build: {
  outDir: 'dist-obfuscated',
 },
 server: {
  host: '0.0.0.0', // listen on all addresses
  port: 5173,      // you can change this if needed
 },
})
