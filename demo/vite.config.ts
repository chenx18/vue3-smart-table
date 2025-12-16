import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  root: __dirname,
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname),
      'vue3-smart-table': resolve(__dirname, '../src')
    }
  },
  server: {
    port: 5173,
    open: true
  }
})