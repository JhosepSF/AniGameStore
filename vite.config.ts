import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    host: true
  },
  preview: {
    port: Number(process.env.PORT) || 3000,
    host: true,
    allowedHosts: ['ale-n7o2.onrender.com']
  }
})
