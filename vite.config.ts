import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages project site: https://heague19.github.io/86400/
  base: '/86400/',
  plugins: [react()],
})
