# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

体育赛事管理后台（admin），基于 TanStack Start (SSR) + React 19 构建。管理赛事报名、配速员分配、订单处理与成绩发布等业务。

## 常用命令

```bash
pnpm dev              # 启动开发服务器（端口 4000）
pnpm build            # 生产构建
pnpm test             # 运行测试（vitest）
pnpm typecheck        # TypeScript 类型检查
pnpm lint             # oxlint 代码检查
pnpm lint:fix         # 自动修复 lint 问题
pnpm format           # oxc 格式化代码
pnpm format:check     # 检查格式
pnpm openapi-ts       # 从后端 OpenAPI spec 重新生成 API 客户端
```

运行单个测试文件：`pnpm vitest run src/path/to/test.ts`

## 技术栈

- **框架**: TanStack Start（SSR）、React 19、Vite 8
- **路由**: TanStack Router 文件路由（`src/routes/` 下的文件自动生成路由树）
- **数据获取**: TanStack Query + @hey-api/client-axios 生成的 API 客户端
- **状态管理**: Zustand（仅用于 auth store，带 localStorage 持久化）
- **表单**: TanStack Form + Zod 校验
- **UI 组件**: shadcn/ui（new-york 风格），Radix UI 底层
- **样式**: Tailwind CSS v4（HSL CSS 变量主题系统，支持 dark mode）
- **图标**: lucide-react
- **Lint/Format**: oxlint + oxc formatter（不是 ESLint/Prettier）
- **Git hooks**: lefthook（pre-commit 自动 lint + format）
- **包管理**: pnpm

## 代码架构

### API 层

- `src/api/generated/` — @hey-api/openapi-ts 自动生成的客户端代码，**不要手动修改**
  - 生成源：`http://localhost:4001/docs-json`（后端 OpenAPI spec）
  - 按 tag 分组生成 SDK（如 `Auth`、`Events`、`Users` 等命名空间）
- `src/api/client.ts` — 配置 API 客户端：
  - 注入 auth token（从 Zustand store 读取）
  - 解包后端统一 `{ code, data, message }` 响应格式，直接返回 `data`
  - 401 自动登出并跳转 `/login`
- `src/api/modules/` — 业务 API hooks 封装，每个模块导出 query key 常量和 `useXxx` hooks
  - 模式：`xxxKeys` 对象定义 query key → `useXxxList`/`useCreateXxx`/`useUpdateXxx`/`useDeleteXxx` 等 hooks
  - 直接调用 `@/api/generated` 中的 SDK 函数，类型转换用 `as any` 或 `as Type`

### 路由结构

文件路由，`src/routes/` 下的文件结构即 URL 结构：

- `__root.tsx` — 根布局（QueryClientProvider、Toaster、Devtools）
- `_authenticated.tsx` — 认证守卫布局（未登录重定向到 `/login`，登录后获取用户信息）
- `_authenticated/` — 需要登录的页面（index 为仪表盘）
- `login.tsx` — 登录页

添加新路由：在 `src/routes/_authenticated/` 下创建 `.tsx` 文件，路由自动生成。

### 组件结构

- `src/components/ui/` — shadcn/ui 基础组件（button、table、dialog 等）
- `src/components/layout/` — 布局组件（MainLayout 含 Sidebar + Header）
- `src/components/common/` — 业务通用组件（DataTable、FilterBar、SearchForm、ConfirmDialog）

### 关键约定

- **路径别名**: `#/*` 和 `@/*` 都映射到 `src/`
- **后端地址**: 开发环境 `http://localhost:4001`
- **UI 语言**: 中文
- **类型定义**: `src/types/common.ts` 定义了分页和 API 响应通用类型，`src/api/generated/types.gen.ts` 为生成的类型
- **`routeTree.gen.ts`** 是自动生成的，不要编辑，已被 VSCode 设置为只读
