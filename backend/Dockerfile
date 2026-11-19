# ==========================================================
# 👨‍🍳 IMAGEM DA COZINHA (back-end Node.js)
# ==========================================================
# Receita para montar o container da API.
# Atenção: no Dockerfile o comentário fica SEMPRE em linha própria.

# 1. Imagem base: Linux Alpine (pequeno) com Node.js 22
FROM node:22-alpine

# 2. Pasta de trabalho dentro do container
WORKDIR /app

# 3. Copia primeiro só a lista de dependências.
# Assim o Docker reaproveita o cache do "npm install"
# enquanto o package.json não mudar.
COPY package*.json ./

# 4. Instala só as dependências de produção (express, cors, pg)
RUN npm install --omit=dev

# 5. Copia o restante do código (o .dockerignore deixa node_modules de fora)
COPY . .

# 6. Documenta a porta em que a API escuta
EXPOSE 4000

# 7. Comando que roda quando o container sobe
CMD ["node", "server.js"]
