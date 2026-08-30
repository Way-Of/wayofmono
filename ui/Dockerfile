FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g bun@latest

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY prisma ./prisma
RUN bunx prisma generate

COPY . .
RUN bun run build

FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl ca-certificates && \
    npm install -g prisma@^6.11.1

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV THOUGHTS_ROOT=/thoughts

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY docker/entrypoint.sh ./entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
