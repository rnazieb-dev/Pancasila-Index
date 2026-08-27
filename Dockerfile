# Multi-stage Dockerfile untuk Pancasila Index (Next.js 15 Monorepo)

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ------------------------------------------------------------- 1. Dependencies
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/data/package.json ./packages/data/
COPY packages/ai/package.json ./packages/ai/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

# ------------------------------------------------------------- 2. Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=deps /app/packages/data/node_modules ./packages/data/node_modules
COPY --from=deps /app/packages/ai/node_modules ./packages/ai/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

COPY . .

# Build dataset terlebih dahulu
RUN pnpm --filter @pancasila-index/data build

# Build aplikasi web Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm --filter @pancasila-index/web build

# ------------------------------------------------------------- 3. Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages/data/generated ./packages/data/generated
COPY --from=builder /app/apps/web/package.json ./apps/web/

USER nextjs
EXPOSE 3000

WORKDIR /app/apps/web
CMD ["node_modules/.bin/next", "start"]
