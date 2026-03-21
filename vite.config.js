import { defineConfig } from 'vite'

export default defineConfig({
  base: '/<your-repo-name>/', // Replace with your GitHub repo name
  build: {
    outDir: 'dist'
  }
})
