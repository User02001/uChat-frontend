import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
 plugins: [react()],
 define: {
  global: 'globalThis',
 },
 optimizeDeps: {
  include: ['simple-peer'],
 },
 server: {
  https: {
   key: fs.readFileSync('../uChat-backend/server.key'),
   cert: fs.readFileSync('../uChat-backend/server.crt'),
  },
  host: '0.0.0.0',
  port: 5173,
 },
})
