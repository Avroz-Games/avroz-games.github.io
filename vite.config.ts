import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-404',
      closeBundle() {
        if (process.env.GITHUB_PAGES === 'true') {
          copyFileSync(resolve('dist/index.html'), resolve('dist/404.html'))
        }
      },
    },
  ],
  base:
    process.env.GITHUB_PAGES === 'true'
      ? process.env.VITE_BASE_PATH || '/site/'
      : '/',
})
