import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    // as regras de data dependem do fuso: os testes rodam no dos usuários, em qualquer máquina
    env: { TZ: 'America/Sao_Paulo' },
  },
})
