# Multi-stage build for the NestJS API (production image).
# Builds @office/shared + @office/api from the pnpm workspace.
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @office/shared build && pnpm --filter @office/api build
RUN pnpm --filter @office/api --prod deploy /app

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /repo/apps/api/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
