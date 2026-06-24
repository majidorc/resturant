# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    libvips-dev \
    python3 \
    make \
    g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

FROM base AS prod-deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    libvips42 \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --omit=dev --no-audit --no-fund \
      prisma@7.8.0 \
      bcryptjs@3.0.3 \
      @prisma/adapter-pg@7.8.0 \
      @prisma/client@7.8.0 \
      pg@8.22.0 \
      dotenv@17.4.2 \
      tsx@4.19.3 \
      esbuild@0.28.1 \
      sharp@0.34.5

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN node scripts/generate-pwa-icons.mjs

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=3072"

RUN npx prisma generate
RUN --mount=type=cache,target=/app/.next/cache \
    npx next build --webpack

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apt-get update \
  && apt-get install -y --no-install-recommends libvips42 ca-certificates curl \
  && rm -rf /var/lib/apt/lists/* \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && mkdir -p .next public/uploads \
  && chown -R nextjs:nodejs .next public/uploads

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

USER root
COPY --from=prod-deps /app/node_modules /tmp/db-node_modules
RUN cp -a /tmp/db-node_modules/. ./node_modules/ \
  && rm -rf /tmp/db-node_modules \
  && chown -R nextjs:nodejs /app/node_modules /app/prisma /app/src/generated /app/package.json /app/prisma.config.ts

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
