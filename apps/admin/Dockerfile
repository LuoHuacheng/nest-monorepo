# 构建阶段
FROM node:22 AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV npm_config_registry=https://registry.npmmirror.com
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY apps/admin/ ./apps/admin/
RUN cd apps/admin && pnpm build

# 运行阶段
FROM node:22-slim
RUN apt-get update && apt-get install -y dumb-init && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV npm_config_registry=https://registry.npmmirror.com
WORKDIR /app
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/apps/admin/dist ./dist
COPY --from=builder /app/apps/admin/server.mjs ./server.mjs
COPY --from=builder /app/apps/admin/package.json ./
RUN pnpm install --prod --no-frozen-lockfile --ignore-scripts
EXPOSE 4000
CMD ["node", "server.mjs"]
