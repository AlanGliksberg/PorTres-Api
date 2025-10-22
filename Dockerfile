# Base (Node + pnpm via Corepack)
FROM node:20-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# Dependencias (incluye devDeps para compilar y generar Prisma Client)
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch
RUN pnpm install --frozen-lockfile

# Build (genera Prisma Client y transpila TS)
FROM deps AS build
COPY . .
ENV PRISMA_ENGINES_CHECKSUM_IGNORE=true
RUN pnpm exec prisma generate --schema=./prisma/schema.prisma
RUN pnpm build

# Prune (solo deps de producción)
FROM deps AS prune
RUN pnpm prune --prod

# Runtime (imagen final)
FROM node:20-slim AS runtime
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends tini ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*
USER node
COPY --chown=node:node --from=prune /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/build ./build
COPY --chown=node:node package.json ./
COPY --chown=node:node prisma ./prisma
ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["node","build/server.js"]
EXPOSE 8080
