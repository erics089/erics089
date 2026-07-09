FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production

# DATABASE_URL (Postgres, z.B. Neon) muss beim Start übergeben werden, z.B.:
#   docker run -e DATABASE_URL=postgresql://... -e ANTHROPIC_API_KEY=... -p 3000:3000 mirra-command-center
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push && npm start"]
