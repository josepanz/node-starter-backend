# Base image
FROM node:22-alpine AS base
RUN corepack enable && corepack use pnpm@10.4
ENV NODE_ENV=development

WORKDIR /app
COPY . /app

RUN pnpm install --frozen-lockfile
RUN pnpm exec prisma generate 
RUN pnpm build 
RUN pnpm prune --prod


# =====================================================================================================================
# Final production image
# =====================================================================================================================
FROM base AS prod
RUN apk update
RUN apk add openssl
RUN apk add -U tzdata
ENV TZ=America/Asuncion
RUN cp /usr/share/zoneinfo/America/Asuncion /etc/localtime

# Set production environment
ENV NODE_ENV=production
# Set working directory
WORKDIR /app


COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./package.json


# Expose the application port
EXPOSE 3000

# Set the default command
CMD ["node", "dist/main"]