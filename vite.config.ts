import { existsSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 커스텀 도메인(public/CNAME)이 있으면 도메인 루트에서 열리니 '/',
  // 없으면 GitHub Pages 프로젝트 경로 https://heague19.github.io/86400/ 기준.
  base: existsSync('public/CNAME') ? '/' : '/86400/',
  plugins: [react()],
})
