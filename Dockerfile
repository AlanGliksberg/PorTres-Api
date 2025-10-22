# ------------ Base: Node + pnpm con corepack ------------
FROM node:20-slim AS base
ENV NODE_ENV=production
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# ------------ Deps ------------
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch
RUN pnpm install --frozen-lockfile

# ------------ Build ------------
FROM deps AS build
COPY . .
RUN pnpm prisma generate
RUN pnpm build

# ------------ Prune (solo deps prod) ------------
FROM deps AS prune
RUN pnpm prune --prod

# ------------ Runtime ------------
FROM node:20-slim AS runtime
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends tini ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

# Usuario no root
USER node

# Copiamos lo mínimo necesario
COPY --chown=node:node --from=prune /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/build ./build
COPY --chown=node:node package.json ./
COPY --chown=node:node prisma ./prisma

# Entrypoint + comando de arranque (sin healthcheck, sin migrate/seed)
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "build/server.js"]

EXPOSE 8080    