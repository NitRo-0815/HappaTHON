import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // フロントの /api/* へのリクエストをバックエンド（Node サーバー :3001）へ転送する。
    // これによりフロントは相対パス /api/... を叩くだけでよく、CORS やホスト名の
    // ハードコードに依存しなくなる。
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
})
