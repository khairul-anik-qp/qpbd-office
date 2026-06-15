# Multi-stage production image: shared + web + api, single origin.
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY apps/web ./apps/web
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @office/shared build
RUN pnpm --filter @office/api exec prisma generate
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_VAPID_PUBLIC_KEY
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY
RUN pnpm --filter @office/web build
RUN pnpm --filter @office/api build
RUN pnpm --filter @office/api --prod deploy /app --legacy
RUN cd /app && ./node_modules/.bin/prisma generate --schema=./prisma/schema.prisma
RUN cp -r apps/web/dist /app/public

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /repo/apps/api/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/main.js"]
