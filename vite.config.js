import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwidcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwidcss()],
  server: {
    port: 5174,
    strictPort: true,
    host: true
  }
})