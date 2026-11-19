# ==========================================================
# 🪑 IMAGEM DO SALÃO (front-end React + Nginx)
# ==========================================================
# Build em DUAS ETAPAS (multi-stage):
#   Etapa 1 (build): usa Node para gerar os arquivos estáticos (dist/)
#   Etapa 2 (final): só o Nginx + dist/. O Node fica de fora,
#   então a imagem final é bem menor.
# Atenção: no Dockerfile o comentário fica SEMPRE em linha própria.

# ---------- ETAPA 1: montar o salão ----------
FROM node:22-alpine AS build

WORKDIR /app

# Endereço da API "gravado" no JavaScript durante o build.
# Pode ser trocado no Compose (build > args).
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Dependências primeiro, para aproveitar o cache
COPY package*.json ./
RUN npm install

# Código-fonte e build de produção (gera /app/dist)
COPY . .
RUN npm run build

# ---------- ETAPA 2: servir o salão ----------
FROM nginx:alpine

# Nossa configuração (serve o React e faz proxy de /api)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Só os arquivos prontos vindos da etapa 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
