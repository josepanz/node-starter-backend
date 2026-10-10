# syntax=docker/dockerfile:1.7
# =====================================================================================================================
# Imagen multi-stage endurecida: deps -> build -> prod. El stage final no trae devDependencies, codigo fuente ni
# herramientas de build, y corre como usuario no root.
# =====================================================================================================================
ARG NODE_VERSION=22.16.0
ARG PNPM_VERSION=10.18.0

# ---------------------------------------------------------------------------------------------------------------------
# Stage 1: dependencias (solo se invalida si cambian package.json, el lockfile o patches/)
# ---------------------------------------------------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS deps
ARG PNPM_VERSION
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

# patches/ va ANTES del install: pnpm lee los .patch de pnpm.patchedDependencies al resolver y falla con ENOENT si faltan.
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------------------------------------------------
# Stage 2: build (prisma generate + compilacion + poda a dependencias de produccion)
# ---------------------------------------------------------------------------------------------------------------------
FROM deps AS build
COPY prisma ./prisma
RUN pnpm exec prisma generate
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN pnpm build \
    && pnpm prune --prod

# ---------------------------------------------------------------------------------------------------------------------
# Stage 3: produccion
# ---------------------------------------------------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS prod

# TZ configurable en build o en runtime; el codigo no depende de ella (ver .context/rules/datetime.md).
ARG TZ=UTC
ENV TZ=${TZ} \
    NODE_ENV=production

# openssl lo requiere el motor de Prisma; tzdata permite fijar TZ.
RUN apk add --no-cache openssl tzdata dumb-init

WORKDIR /app

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/prisma ./prisma

USER node

EXPOSE 3000

# Mismo endpoint que las probes de Kubernetes. Sin curl/wget extra: se usa el fetch de Node 22.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/node-starter-backend/api/v1/healthcheck').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
