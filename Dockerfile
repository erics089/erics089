FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV DATABASE_URL="file:./prisma/dev.db"

EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push && npm start"]
