# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

体育赛事管理系统后端 — NestJS + Prisma + PostgreSQL 的 RESTful API 服务，提供 JWT 认证和 RBAC 权限控制。

## Commands

```bash
# 开发
pnpm start:dev              # 热重载开发服务器（默认端口 4001）
pnpm build                  # 构建到 dist/
pnpm start:prod             # 生产运行

# Lint & Format
pnpm lint                   # oxlint 修复 + oxfmt 格式化
pnpm lint:check             # 仅检查（CI 用）
pnpm format:check           # 仅检查格式

# 测试
pnpm test                   # 单元测试（Jest，匹配 src/**/*.spec.ts）
pnpm test:e2e               # E2E 测试（匹配 test/**/*.e2e-spec.ts）
pnpm test:cov               # 覆盖率报告
pnpm test -- --testPathPattern=auth  # 运行匹配路径的单个测试

# Prisma
pnpm prisma:generate        # 生成 Prisma Client（输出到 generated/prisma/）
pnpm prisma:migrate         # 运行数据库迁移
pnpm prisma:seed            # 导入种子数据
```

## Architecture

### Module Pattern

每个业务模块遵循 NestJS 标准结构：`src/modules/<name>/` 下含 `<name>.module.ts`、`<name>.controller.ts`、`<name>.service.ts`、`dto/`。

### Auth & RBAC

- **全局守卫**：`JwtAuthGuard`（JWT 认证）+ `RbacGuard`（权限校验）在 `AppModule` 通过 `APP_GUARD` 注册，所有路由默认需要登录
- `@Public()` 装饰器跳过认证；`@Permissions('code1', 'code2')` 装饰器要求用户拥有对应权限
- 用户权限列表从 JWT payload 中读取（`user.permissions`）

### Response Format

全局 `TransformInterceptor` 统一包装响应为 `{ code: 200, data, message: "success" }`。分页接口返回 `{ items, total, page, pageSize }`。控制器直接返回数据对象即可。

### Prisma

- Schema: `prisma/schema.prisma`，Client 输出到 `generated/prisma/`（已 gitignore）
- 使用 `@prisma/adapter-pg` 适配器连接 PostgreSQL
- `PrismaService` 通过 `ConfigService` 读取 `DATABASE_URL`，在 `onModuleInit` 时自动连接
- 表名使用 snake_case 映射（`@@map`），字段使用 camelCase + `@map`

### Validation

全局 `ValidationPipe` 启用了 `whitelist: true` 和 `transform: true`，DTO 使用 `class-validator` 和 `class-transformer` 做参数校验。

### Pre-commit Hook

Lefthook 在 pre-commit 时自动对 staged 的 `.ts` 文件运行 `oxlint --fix` 和 `oxfmt`。

## Environment Variables

参见 `.env.example`：`DATABASE_URL`、`JWT_SECRET`、`JWT_EXPIRES_IN`、`JWT_REFRESH_EXPIRES_IN`、`PORT`、`UPLOAD_DIR`。

## Swagger

开发服务器启动后访问 `http://localhost:{PORT}/docs` 查看 API 文档。
