# 构建阶段
FROM node:22 AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV npm_config_registry=https://registry.npmmirror.com
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY apps/api/ ./apps/api/
RUN cd apps/api && pnpm prisma generate && pnpm build

# 运行阶段
FROM node:22-slim
RUN apt-get update && apt-get install -y dumb-init && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV npm_config_registry=https://registry.npmmirror.com
WORKDIR /app
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/dist/prisma.config.js ./
COPY --from=builder /app/apps/api/generated ./generated
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./
RUN pnpm install --prod --no-frozen-lockfile --ignore-scripts
EXPOSE 4001
CMD ["node", "dist/src/main.js"]
