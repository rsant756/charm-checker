/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// GitHub Pages: https://rsant756.github.io/charm-checker/
export default defineConfig({
  base: '/charm-checker/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
  },
})
