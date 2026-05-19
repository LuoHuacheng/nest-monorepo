# Admin 前端接入 Backend API 设计文档

## 概述

将 admin 管理后台从静态 mock 数据切换为对接 backend 真实 API。覆盖全部 16 个模块、约 75 个端点。

## 技术选型

| 决策 | 选择 | 理由 |
| ------ | ------ | ------ |
| 类型生成 | `@hey-api/openapi-ts` | 从 Swagger 同时生成类型 + API 函数，可配置 Axios 实例 |
| 数据请求 | TanStack Query | 已安装，处理缓存/loading/错误/分页 |
| API 组织 | 按模块划分 | 每模块一个文件，含 query keys + hooks |

## 架构设计

### 1. 代码生成

使用 `@hey-api/openapi-ts` 从后端 Swagger 文档生成代码。

**配置** (`openapi-ts.config.ts`):

- 输入：`http://localhost:3000/docs-json`（后端 Swagger JSON）
- 输出：`src/api/generated/`
- HTTP 客户端：使用项目已有的 Axios 实例 (`@hey-api/axios-plugin`)
- 生成内容：类型定义 + API 服务函数

**生成产物**（`.gitignore`，可随时重新生成）：

```plain
src/api/generated/
├── types.gen.ts      # DTO 和响应类型
├── sdk.gen.ts        # API 服务函数
└── index.ts          # 导出
```

### 1.1 代码生成工作流

- 后端必须先启动（`pnpm start:dev`），确保 `http://localhost:3000/docs-json` 可访问
- 运行 `pnpm openapi-ts` 生成代码
- 生成产物加入 `.gitignore`，不提交到版本控制
- 后端 DTO 变更后重新运行生成命令即可同步

### 2. 响应格式对齐

**问题**：后端返回 `{ code, data, message }`，分页返回 `{ items, total, page, pageSize }`。admin 现有 `PaginatedResponse<T>` 用的是 `list` 字段。

**方案**：

- 修改 `src/types/common.ts` 中 `PaginatedResponse<T>` 的 `list` → `items`，与后端对齐
- 在 `api.ts` 响应拦截器中解包：成功响应提取 `response.data.data`，错误提取 `response.data.message`
- 生成的 API 函数返回解包后的数据，TanStack Query 直接使用

### 3. API 模块层

```plain
src/api/
├── generated/              # 自动生成
├── modules/
│   ├── auth.ts             # 登录、登出、刷新Token、获取用户信息
│   ├── events.ts           # 赛事 CRUD + 邀请码/摆渡车/成绩
│   ├── orders.ts           # 订单列表/详情/退款
│   ├── organizers.ts       # 组委会 CRUD + 状态
│   ├── pacers.ts           # 配速员 CRUD + 实测 + 赛事分配
│   ├── users.ts            # 用户 CRUD + 状态 + 重置密码
│   ├── roles.ts            # 角色 CRUD + 权限分配
│   ├── registration-cards.ts
│   ├── athletic-centers.ts
│   ├── notifications.ts
│   ├── client-configs.ts
│   ├── permissions.ts
│   ├── menus.ts
│   ├── dicts.ts
│   ├── logs.ts
│   └── files.ts
├── query-client.ts         # QueryClient 实例配置
└── index.ts
```

每个模块文件结构：

```typescript
// 以 events.ts 为例
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { eventService } from '@/api/generated'

// Query Keys
export const eventKeys = {
  all: ['events'] as const,
  list: (params: QueryEventDto) => [...eventKeys.all, 'list', params] as const,
  detail: (id: string) => [...eventKeys.all, detail, id] as const,
}

// Query Options（可复用）
export function eventListOptions(params: QueryEventDto) {
  return queryOptions({
    queryKey: eventKeys.list(params),
    queryFn: () => eventService.list(params),
  })
}

// Hooks
export function useEventList(params: QueryEventDto) {
  return useQuery(eventListOptions(params))
}

export function useCreateEvent() {
  return useMutation({
    mutationFn: (data: CreateEventDto) => eventService.create(data),
  })
}
```

### 4. 认证流程改造

**当前状态**：`login.tsx` 调用 mock `loginHandler()`，返回硬编码 token 和用户信息。

**改造后**：

1. `login.tsx` → 调用 `useLogin` mutation → `POST /api/auth/login`
2. 成功后存储 `accessToken` + `refreshToken` + 用户信息到 Zustand store
3. `_authenticated` layout 的 `beforeLoad` 中调用 `GET /api/auth/profile` 获取最新用户信息（含权限列表）
4. 退出时调用 `POST /api/auth/logout` 后清除 store

**Zustand auth store 扩展**：

- 新增 `refreshToken` 字段
- 新增 `permissions: string[]` 字段（从 profile 接口获取）
- `login()` 接收完整的登录响应

**types/auth.ts 对齐**：

- `UserInfo` 需要与后端 `GET /api/auth/profile` 响应对齐
- `roles` 从 `string[]` 改为后端返回的角色对象结构
- 新增 `permissions: string[]` 字段

**Token 刷新机制**：

- Axios 响应拦截器捕获 401 错误
- 若有 refreshToken，先尝试 `POST /api/auth/refresh` 获取新 token
- 刷新成功：更新 store 中的 token，重放失败请求
- 刷新失败：清除 store，跳转登录页
- 避免并发刷新：使用锁标志或队列

### 5. QueryClient 配置

在 `router.tsx` 或根组件中添加 `QueryClientProvider`：

```typescript
// src/api/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 分钟
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

在根组件中包裹 `QueryClientProvider`。

### 6. 分页处理

后端分页响应：`{ items: T[], total: number, page: number, pageSize: number }`

- 分页状态通过 URL search params 管理（TanStack Router search params）
- 每个列表页使用 `useQuery` + 分页参数
- `DataTable` 组件的 `data` 从 `data?.items ?? []` 取值
- `total` 从 `data?.total` 取值

### 7. 页面改造模式

每个列表页的改造步骤：

1. 删除 `import { mockXxx } from '@/mocks/data/xxx'`
2. 引入对应的 query hook
3. 用 `isLoading` 显示 loading 状态
4. 用 `error` 显示错误提示
5. 筛选/搜索参数传给 query hook（由后端处理）
6. CRUD 操作使用 `useMutation` + `queryClient.invalidateQueries()` 刷新

**示例**（events/list.tsx）：

```typescript
// 之前
import { mockEvents } from '@/mocks/data/events'
const filtered = mockEvents.filter(...)

// 之后
const { data, isLoading } = useEventList({ page, pageSize, keyword: search, ... })
const events = data?.items ?? []
```

## 模块-页面映射

| 后端模块 | 前端页面 | 主要操作 |
|  ------ ---- |  ------ ---- |  ------ ---- |
| auth | login.tsx | 登录、登出 |
| events | events/list.tsx | CRUD + 发布状态 |
| events/invite-codes | events/invite-codes.tsx | CRUD |
| events/shuttle-buses | events/shuttle-buses.tsx | CRUD |
| events/results | events/results.tsx | 列表 + 导入 |
| orders | orders/events.tsx, orders/online.tsx | 列表 + 退款 |
| registration-cards | events/registration-cards.tsx | CRUD |
| organizers | organizers.tsx | CRUD + 状态 |
| athletic-centers | athletic-centers.tsx | CRUD + 状态 |
| pacers | pacers/list.tsx | CRUD + 审核 |
| pacers/tests | pacers/tests.tsx | 列表 + 编辑 |
| pacers/events | pacers/events.tsx | 列表 + 分配 + 弃权 |
| users | users.tsx | CRUD + 状态 + 重置密码 |
| roles | roles.tsx | CRUD + 权限分配 |
| notifications | settings/notifications.tsx | 列表 + 创建 |
| client-configs | settings/client-config.tsx | 列表 + 批量更新 |

## 需要修改的现有文件

| 文件 | 改动 |
| ------ | ------ |
| `src/lib/api.ts` | 响应拦截器解包 `{ code, data, message }`，新增 token 刷新逻辑 |
| `src/stores/auth.ts` | 新增 refreshToken、permissions 字段 |
| `src/types/auth.ts` | 对齐后端 profile 响应结构 |
| `src/types/common.ts` | `PaginatedResponse.list` → `items` |
| `src/router.tsx` | 添加 QueryClientProvider |
| `src/routes/login.tsx` | 替换 mock 为真实 API |
| `src/routes/_authenticated/*.tsx` | 全部 17 个页面替换 mock 为 hooks |
| `src/mocks/` | 整个目录可删除或保留作参考 |

## 文件上传

后端 `POST /api/files/upload` 接受 `multipart/form-data`，字段名 `file`。

需要在 API 模块层封装上传函数，使用 Axios 的 FormData 支持。

## 错误处理

- 401：Axios 拦截器已处理（清除 token + 跳转登录）
- 403：权限不足，显示 toast 错误提示
- 4xx/5xx：从响应中提取 `message` 字段，通过 toast 展示
- 网络错误：统一提示"网络异常，请稍后重试"
