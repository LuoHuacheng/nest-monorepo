# 构建阶段
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile
COPY apps/admin/ ./apps/admin/
RUN pnpm build:admin

# 运行阶段
FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=builder /app/apps/admin/dist ./dist
COPY --from=builder /app/apps/admin/package.json ./
RUN pnpm install --prod --frozen-lockfile
EXPOSE 4000
CMD ["node", "dist/server/server.js"]
