import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração do Vite (ferramenta que "monta" o salão para produção).
// O proxy abaixo vale só para "npm run dev" fora do Docker:
// ele repassa /api para a cozinha em localhost:4000.
// Dentro do Docker quem faz esse papel é o Nginx (nginx.conf).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
