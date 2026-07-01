# syntax=docker/dockerfile:1
# ── deps ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── build ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
ARG GIT_SHA=unknown
ARG GIT_REF=unknown
ENV GIT_SHA=${GIT_SHA}
ENV GIT_REF=${GIT_REF}
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── runtime ─────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Baked so /api/version can report the exact commit running in this container.
ARG GIT_SHA=unknown
ARG GIT_REF=unknown
ENV GIT_SHA=${GIT_SHA}
ENV GIT_REF=${GIT_REF}

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Next.js "standalone" output ships its own minimal node_modules + server.js.
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=4 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
