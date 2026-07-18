FROM node:26-alpine AS build
WORKDIR /app
RUN apk add --no-cache git
COPY package.json pnpm-workspace.yaml ./
RUN npm install -g pnpm && pnpm install --prod=false
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate && npx tsc

FROM node:26-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json pnpm-workspace.yaml ./
EXPOSE 4103
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
