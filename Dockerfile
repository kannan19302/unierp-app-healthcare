FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install -g pnpm && pnpm install --prod=false
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate && npx tsc

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./
EXPOSE 4103
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
