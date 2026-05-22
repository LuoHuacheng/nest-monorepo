# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

体育赛事管理系统 — pnpm monorepo，使用 Turborepo 构建编排。

- **后端 (apps/api)**: NestJS 11 + Prisma 7 + PostgreSQL，JWT 认证 + RBAC 权限
- **前端 (apps/admin)**: TanStack Start (SSR) + React 19 + Vite 8，TanStack Router/Query/Table/Form
- **共享包 (packages/)**: api-client、permissions、schemas、types、utils

## 常用命令

```bash
# 开发
pnpm dev                    # 同时启动 api + admin
pnpm dev:api                # 仅启动后端（端口 4001）
pnpm dev:admin              # 仅启动前端（端口 4000）

# 构建
pnpm build                  # 构建所有
pnpm build:api              # 仅构建后端
pnpm build:admin            # 仅构建前端

# 代码质量
pnpm lint                   # oxlint 检查（非 ESLint）
pnpm lint:check             # 仅检查（CI 用）
pnpm format                 # oxfmt 格式化（非 Prettier）
pnpm format:check           # 仅检查格式
pnpm typecheck              # TypeScript 类型检查

# 测试
pnpm test                   # 运行所有测试

# Prisma
pnpm prisma:generate        # 生成 Prisma Client
pnpm prisma:migrate         # 运行数据库迁移

# API 客户端
pnpm generate:api-client    # 从后端 OpenAPI spec 重新生成
```

## 架构要点

### Monorepo 结构

```txt
match/
├── apps/api/         # NestJS 后端，src/modules/ 下 19 个业务模块
├── apps/admin/       # React 前端，文件路由 src/routes/
├── packages/         # 5 个共享包
├── turbo.json        # Turborepo 配置
└── lefthook.yml      # pre-commit hooks
```

### 后端 (apps/api)

- **模块模式**: 每个业务模块在 `src/modules/<name>/` 下，含 module、controller、service、dto
- **认证**: 全局 `JwtAuthGuard` + `RbacGuard`，`@Public()` 跳过认证，`@Permissions()` 要求权限
- **响应格式**: `TransformInterceptor` 统一包装为 `{ code: 200, data, message }`
- **Prisma**: Schema 在 `prisma/schema.prisma`，Client 输出到 `generated/prisma/`
- **校验**: 全局 `ValidationPipe` 启用 `whitelist: true` + `transform: true`

### 前端 (apps/admin)

- **路由**: TanStack Router 文件路由，`src/routes/` 下文件结构即 URL
- **API 层**: `src/api/generated/` 为自动生成的客户端，**不要手动修改**
- **状态管理**: Zustand（仅 auth store，带 localStorage 持久化）
- **UI**: shadcn/ui (new-york 风格) + Tailwind CSS v4

### 共享包 (packages/)

- `@match/api-client` — OpenAPI 自动生成的 API 客户端
- `@match/permissions` — 权限常量
- `@match/schemas` — Zod 校验 schema
- `@match/types` — 共享类型
- `@match/utils` — 工具函数

## 工具链

- **包管理**: pnpm 10.18.0
- **构建**: Turborepo
- **Lint/Format**: oxlint + oxfmt（非 ESLint/Prettier）
- **Git hooks**: lefthook（pre-commit 自动 lint + format）
- **Node**: >=22

## 子项目文档

详细架构和命令参见各子项目的 CLAUDE.md：

- `apps/api/CLAUDE.md` — 后端详细架构
- `apps/admin/CLAUDE.md` — 前端详细架构
