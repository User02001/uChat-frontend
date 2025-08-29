import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
 plugins: [react()],
 server: {
  host: true,   // or '0.0.0.0' → allows LAN access
  port: 5173,   // optional: set a fixed port
 },
})
