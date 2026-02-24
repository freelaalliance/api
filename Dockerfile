# Multi-stage build para otimizar o tamanho da imagem final

# Stage 1: Build
FROM node:20-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copia o código fonte
COPY . .

RUN npm run build

# Gera o cliente Prisma
RUN npm run db:generate

# Stage 2: Production
FROM node:20-alpine AS production

# Instala Chromium e dependências necessárias para o Puppeteer
RUN apk add --no-cache \
    chromium \
    openssl

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
# Define o diretório de trabalho
WORKDIR /app

# Cria um usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copia os arquivos necessários do stage de build
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/tsconfig.json ./

# Muda para o usuário não-root
USER nodejs

# Define variáveis de ambiente para produção
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["npm", "start"]
