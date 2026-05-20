# Admin 前端接入 Backend API 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 admin 管理后台全部 17 个页面从静态 mock 数据切换为对接 backend 真实 API（~75 个端点）。

**Architecture:** 使用 `@hey-api/openapi-ts` 生成的 fetch 客户端 + SDK 类（已生成到 `src/api/generated/`）。配置生成客户端的 auth 注入、响应解包（`{ code, data, message }` → `data`）和 401 处理。每个业务模块创建 TanStack Query hooks 文件。页面改造：删除 mock 导入 → 引入 hooks → 添加 loading/error 状态。

**Tech Stack:** React 19, TanStack Router, TanStack Query, Zustand, @hey-api/openapi-ts 生成客户端

---

## 文件结构

### 新建文件

| 文件                                    | 职责                                              |
| --------------------------------------- | ------------------------------------------------- |
| `src/api/client.ts`                     | 配置生成客户端：baseUrl、auth、响应解包、401 处理 |
| `src/api/query-client.ts`               | QueryClient 实例                                  |
| `src/api/modules/auth.ts`               | 认证模块 hooks：useLogin, useLogout, useProfile   |
| `src/api/modules/events.ts`             | 赛事模块 hooks + query keys                       |
| `src/api/modules/orders.ts`             | 订单模块 hooks                                    |
| `src/api/modules/organizers.ts`         | 组委会模块 hooks                                  |
| `src/api/modules/pacers.ts`             | 配速员模块 hooks                                  |
| `src/api/modules/users.ts`              | 用户模块 hooks                                    |
| `src/api/modules/roles.ts`              | 角色模块 hooks                                    |
| `src/api/modules/registration-cards.ts` | 报名卡模块 hooks                                  |
| `src/api/modules/athletic-centers.ts`   | 田管中心模块 hooks                                |
| `src/api/modules/notifications.ts`      | 消息通知模块 hooks                                |
| `src/api/modules/client-configs.ts`     | 客户端配置模块 hooks                              |
| `src/api/modules/permissions.ts`        | 权限模块 hooks                                    |
| `src/api/modules/menus.ts`              | 菜单模块 hooks                                    |
| `src/api/modules/dicts.ts`              | 字典模块 hooks                                    |
| `src/api/modules/logs.ts`               | 日志模块 hooks                                    |
| `src/api/modules/files.ts`              | 文件上传模块 hooks                                |
| `src/api/modules/dashboard.ts`          | 仪表盘模块 hooks                                  |
| `src/api/index.ts`                      | 统一导出                                          |

### 修改文件

| 文件                                                      | 改动                                |
| --------------------------------------------------------- | ----------------------------------- |
| `src/stores/auth.ts`                                      | 新增 refreshToken、permissions 字段 |
| `src/types/auth.ts`                                       | 对齐后端 profile 响应结构           |
| `src/types/common.ts`                                     | `PaginatedResponse.list` → `items`  |
| `src/routes/__root.tsx`                                   | 添加 QueryClientProvider            |
| `src/routes/login.tsx`                                    | 替换 mock 为真实 API                |
| `src/routes/_authenticated.tsx`                           | 加载时获取 profile                  |
| `src/routes/_authenticated/index.tsx`                     | 替换 dashboard mock                 |
| `src/routes/_authenticated/events/list.tsx`               | 替换 events mock                    |
| `src/routes/_authenticated/events/invite-codes.tsx`       | 替换 invite codes mock              |
| `src/routes/_authenticated/events/shuttle-buses.tsx`      | 替换 shuttle buses mock             |
| `src/routes/_authenticated/events/results.tsx`            | 替换 results mock                   |
| `src/routes/_authenticated/events/registration-cards.tsx` | 替换 registration cards mock        |
| `src/routes/_authenticated/orders/events.tsx`             | 替换 orders mock                    |
| `src/routes/_authenticated/orders/online.tsx`             | 替换 online orders mock             |
| `src/routes/_authenticated/organizers.tsx`                | 替换 organizers mock                |
| `src/routes/_authenticated/athletic-centers.tsx`          | 替换 athletic centers mock          |
| `src/routes/_authenticated/pacers/list.tsx`               | 替换 pacers mock                    |
| `src/routes/_authenticated/pacers/tests.tsx`              | 替换 pacer tests mock               |
| `src/routes/_authenticated/pacers/events.tsx`             | 替换 pacer events mock              |
| `src/routes/_authenticated/users.tsx`                     | 替换 users mock                     |
| `src/routes/_authenticated/roles.tsx`                     | 替换 roles mock                     |
| `src/routes/_authenticated/settings/notifications.tsx`    | 替换 notifications mock             |
| `src/routes/_authenticated/settings/client-config.tsx`    | 替换 client config mock             |

### 删除文件

| 文件                           | 原因              |
| ------------------------------ | ----------------- |
| `src/mocks/data/dashboard.ts`  | 被 API hooks 替代 |
| `src/mocks/data/events.ts`     | 被 API hooks 替代 |
| `src/mocks/data/orders.ts`     | 被 API hooks 替代 |
| `src/mocks/data/organizers.ts` | 被 API hooks 替代 |
| `src/mocks/data/pacers.ts`     | 被 API hooks 替代 |
| `src/mocks/handlers/auth.ts`   | 被真实 API 替代   |
| `src/mocks/faker.ts`           | 不再需要          |
| `src/lib/api.ts`               | 被生成客户端替代  |
| `src/types/event.ts`           | 被生成类型替代    |
| `src/types/order.ts`           | 被生成类型替代    |
| `src/types/organizer.ts`       | 被生成类型替代    |
| `src/types/pacer.ts`           | 被生成类型替代    |
| `src/types/auth.ts`            | 被生成类型替代    |

---

## Task 1: 配置生成客户端

**目标:** 配置 `@hey-api/openapi-ts` 生成的客户端，注入 auth token、解包响应、处理 401。

**Files:**

- Create: `src/api/client.ts`
- Modify: `src/api/generated/client.gen.ts`

- [ ] **Step 1: 创建客户端配置文件**

```typescript
// src/api/client.ts
import { client } from "@/api/generated/client.gen";
import { useAuthStore } from "@/stores/auth";

// 配置 baseUrl
client.setConfig({
  baseUrl: "http://localhost:4001",
  responseStyle: "data",
});

// 请求拦截：注入 auth token
client.interceptors.request.use(async (request) => {
  const { token } = useAuthStore.getState();
  if (token) {
    request.headers.set("Authorization", `Bearer ${token}`);
  }
  return request;
});

// 响应拦截：处理 401
client.interceptors.response.use(
  async (response) => {
    // 解包 { code, data, message } 响应
    if (response.ok) {
      const cloned = response.clone();
      try {
        const json = await cloned.json();
        if (json && typeof json === "object" && "code" in json && "data" in json) {
          // 后端统一响应格式，解包 data 字段
          const unwrapped = new Response(JSON.stringify(json.data), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
          return unwrapped;
        }
      } catch {
        // 非 JSON 响应，直接返回
      }
    }
    return response;
  },
  async (error) => {
    // error 拦截器处理 401
    if (error instanceof Response && error.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    throw error;
  },
);

export { client };
```

- [ ] **Step 2: 验证客户端配置**

在 `src/main.tsx` 或 `src/router.tsx` 中导入 `@/api/client` 确保配置生效。

- [ ] **Step 3: 提交**

```bash
git add src/api/client.ts
git commit -m "feat: configure generated API client with auth and response unwrapping"
```

---

## Task 2: 设置 QueryClient 和 Provider

**目标:** 创建 QueryClient 实例并包裹到根组件。

**Files:**

- Create: `src/api/query-client.ts`
- Modify: `src/routes/__root.tsx`

- [ ] **Step 1: 创建 QueryClient**

```typescript
// src/api/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

- [ ] **Step 2: 在根组件添加 QueryClientProvider**

修改 `src/routes/__root.tsx`，在 `<body>` 内包裹 `QueryClientProvider`：

```tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/api/query-client'

// 在 RootDocument 中：
<body className="font-sans antialiased" suppressHydrationWarning>
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={...}>
      {children}
    </Suspense>
    <Toaster />
    ...
  </QueryClientProvider>
</body>
```

- [ ] **Step 3: 提交**

```bash
git add src/api/query-client.ts src/routes/__root.tsx
git commit -m "feat: add QueryClient and QueryClientProvider"
```

---

## Task 3: 认证模块（登录、登出、Profile）

**目标:** 替换 mock 登录为真实 API，扩展 auth store，对齐用户类型。

**Files:**

- Modify: `src/stores/auth.ts`
- Create: `src/api/modules/auth.ts`
- Modify: `src/routes/login.tsx`
- Modify: `src/routes/_authenticated.tsx`
- Delete: `src/mocks/handlers/auth.ts`

- [ ] **Step 1: 扩展 Zustand auth store**

```typescript
// src/stores/auth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  status: number;
  roles?: Array<{ id: string; name: string; code: string }>;
  permissions?: string[];
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      login: (token, refreshToken, user) =>
        set({ token, refreshToken, user, isAuthenticated: true }),
      logout: () => set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      setToken: (token) => set({ token }),
    }),
    { name: "auth-storage" },
  ),
);
```

- [ ] **Step 2: 创建认证 API 模块**

```typescript
// src/api/modules/auth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 认证 } from "@/api/generated";
import { useAuthStore } from "@/stores/auth";
import { useNavigate } from "@tanstack/react-router";

export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const { data } = await 认证.authControllerGetProfile();
      return data;
    },
    enabled: useAuthStore.getState().isAuthenticated,
  });
}

export function useLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const { data } = await 认证.authControllerLogin({
        body: credentials,
      });
      return data;
    },
    onSuccess: (data: any) => {
      login(data.accessToken, data.refreshToken, data.user);
      navigate({ to: "/" });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await 认证.authControllerLogout();
    },
    onSettled: () => {
      useAuthStore.getState().logout();
      queryClient.clear();
      navigate({ to: "/login" });
    },
  });
}
```

- [ ] **Step 3: 改造 login.tsx**

将 `loginHandler` mock 替换为 `useLogin` mutation：

```diff
- import { loginHandler } from "@/mocks/handlers/auth";
+ import { useLogin } from "@/api/modules/auth";

  function LoginPage() {
-   const navigate = useNavigate();
-   const login = useAuthStore((s) => s.login);
-   const [error, setError] = useState("");
+   const loginMutation = useLogin();
+   const [error, setError] = useState("");

    const form = useForm({
      defaultValues: { username: "admin", password: "admin123" },
      onSubmit: async ({ value }) => {
        setError("");
        try {
-         const result = await loginHandler(value.username, value.password);
-         login(result.token, result.user);
-         navigate({ to: "/" });
+         await loginMutation.mutateAsync(value);
        } catch (e) {
          setError(e instanceof Error ? e.message : "登录失败");
        }
      },
```

- [ ] **Step 4: 改造 \_authenticated.tsx**

在 `beforeLoad` 中获取最新 profile 信息：

```typescript
import { useAuthStore } from "@/stores/auth";
import { 认证 } from "@/api/generated";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }
    // 获取最新用户信息
    try {
      const { data } = await 认证.authControllerGetProfile();
      if (data) {
        useAuthStore.getState().updateUser(data as any);
      }
    } catch {
      // profile 获取失败不影响页面加载
    }
  },
  component: AuthenticatedLayout,
});
```

- [ ] **Step 5: 删除 mock 文件**

```bash
rm src/mocks/handlers/auth.ts
```

- [ ] **Step 6: 验证登录流程**

启动 admin 和 backend，测试：

1. 访问 `/` 应重定向到 `/login`
2. 输入正确的用户名密码应成功登录并跳转到首页
3. 退出登录应清除 token 并跳回登录页

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "feat: replace mock auth with real API login/logout/profile"
```

---

## Task 4: 类型对齐和通用修改

**目标:** 修改共享类型文件，删除旧的手动类型定义。

**Files:**

- Modify: `src/types/common.ts`
- Delete: `src/types/event.ts`
- Delete: `src/types/order.ts`
- Delete: `src/types/organizer.ts`
- Delete: `src/types/pacer.ts`
- Delete: `src/types/auth.ts`

- [ ] **Step 1: 修改 common.ts 的分页类型**

```typescript
// src/types/common.ts
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[]; // 原 list → items，与后端对齐
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface SelectOption {
  label: string;
  value: string | number;
}
```

- [ ] **Step 2: 删除旧的类型文件**

```bash
rm src/types/event.ts src/types/order.ts src/types/organizer.ts src/types/pacer.ts src/types/auth.ts
```

这些类型现在由 `src/api/generated/types.gen.ts` 提供。

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "refactor: align pagination types and remove manual type definitions"
```

---

## Task 5: 赛事模块 API hooks + 页面改造

**目标:** 创建赛事模块 hooks，改造 5 个赛事相关页面。

**Files:**

- Create: `src/api/modules/events.ts`
- Modify: `src/routes/_authenticated/events/list.tsx`
- Modify: `src/routes/_authenticated/events/invite-codes.tsx`
- Modify: `src/routes/_authenticated/events/shuttle-buses.tsx`
- Modify: `src/routes/_authenticated/events/results.tsx`
- Modify: `src/routes/_authenticated/events/registration-cards.tsx`

- [ ] **Step 1: 创建赛事 API 模块**

```typescript
// src/api/modules/events.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 赛事管理 } from "@/api/generated";
import type {
  CreateEventDto,
  UpdateEventDto,
  QueryEventDto,
  CreateInviteCodeDto,
  CreateShuttleBusDto,
} from "@/api/generated";

export const eventKeys = {
  all: ["events"] as const,
  list: (params?: Record<string, unknown>) => [...eventKeys.all, "list", params] as const,
  detail: (id: string) => [...eventKeys.all, "detail", id] as const,
  inviteCodes: (eventId: string) => [...eventKeys.all, eventId, "invite-codes"] as const,
  shuttleBuses: (eventId: string) => [...eventKeys.all, eventId, "shuttle-buses"] as const,
  results: (eventId: string) => [...eventKeys.all, eventId, "results"] as const,
};

export function useEventList(params?: QueryEventDto) {
  return useQuery({
    queryKey: eventKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await 赛事管理.eventControllerFindAll({ query: params });
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useEventDetail(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const { data } = await 赛事管理.eventControllerFindOne({ path: { id } });
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateEventDto) => {
      const { data } = await 赛事管理.eventControllerCreate({ body });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateEventDto }) => {
      const { data } = await 赛事管理.eventControllerUpdate({ path: { id }, body });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await 赛事管理.eventControllerRemove({ path: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useUpdatePublishStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, publishStatus }: { id: string; publishStatus: string }) => {
      const { data } = await 赛事管理.eventControllerUpdatePublishStatus({
        path: { id },
        body: { publishStatus },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

// 邀请码
export function useInviteCodes(eventId: string) {
  return useQuery({
    queryKey: eventKeys.inviteCodes(eventId),
    queryFn: async () => {
      const { data } = await 赛事管理.eventControllerFindInviteCodes({ path: { eventId } });
      return data;
    },
    enabled: !!eventId,
  });
}

export function useCreateInviteCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, body }: { eventId: string; body: CreateInviteCodeDto }) => {
      const { data } = await 赛事管理.eventControllerCreateInviteCode({
        path: { eventId },
        body,
      });
      return data;
    },
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.inviteCodes(eventId) });
    },
  });
}

export function useDeleteInviteCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await 赛事管理.eventControllerRemoveInviteCode({ path: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

// 摆渡车
export function useShuttleBuses(eventId: string) {
  return useQuery({
    queryKey: eventKeys.shuttleBuses(eventId),
    queryFn: async () => {
      const { data } = await 赛事管理.eventControllerFindShuttleBuses({ path: { eventId } });
      return data;
    },
    enabled: !!eventId,
  });
}

export function useCreateShuttleBus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, body }: { eventId: string; body: CreateShuttleBusDto }) => {
      const { data } = await 赛事管理.eventControllerCreateShuttleBus({
        path: { eventId },
        body,
      });
      return data;
    },
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.shuttleBuses(eventId) });
    },
  });
}

// 成绩
export function useEventResults(eventId: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: eventKeys.results(eventId),
    queryFn: async () => {
      const { data } = await 赛事管理.eventControllerFindResults({
        path: { eventId },
        query: params,
      });
      return data;
    },
    enabled: !!eventId,
  });
}
```

- [ ] **Step 2: 改造 events/list.tsx**

关键改动：

```diff
- import { mockEvents } from "@/mocks/data/events";
- import type { Event, EventAttribute, EventStatus, PublishStatus } from "@/types/event";
+ import { useEventList, useDeleteEvent, useUpdatePublishStatus } from "@/api/modules/events";
+ import type { Event, EventAttribute, EventStatus, PublishStatus } from "@/api/generated/types.gen";

  function EventsPage() {
+   const { data, isLoading } = useEventList({ page, pageSize, keyword: search, ... });
+   const deleteMutation = useDeleteEvent();
+   const updateStatusMutation = useUpdatePublishStatus();
+   const events = (data?.items ?? []) as Event[];
```

- 删除所有 mock 导入
- 用 `useEventList` 替换 `mockEvents` 过滤逻辑
- 用 `useDeleteEvent` 替换空的删除确认
- 用 `useUpdatePublishStatus` 替换空的状态变更确认
- 添加 `isLoading` 的 Skeleton/loading 状态
- 处理 `error` 状态

- [ ] **Step 3: 改造其余 4 个赛事子页面**

`invite-codes.tsx`、`shuttle-buses.tsx`、`results.tsx`、`registration-cards.tsx` 使用相同的模式：

1. 删除 mock 导入
2. 引入对应 hooks
3. 添加 loading 状态
4. 实现空操作的逻辑

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: integrate events module with real API"
```

---

## Task 6: 订单模块

**Files:**

- Create: `src/api/modules/orders.ts`
- Modify: `src/routes/_authenticated/orders/events.tsx`
- Modify: `src/routes/_authenticated/orders/online.tsx`

- [ ] **Step 1: 创建订单 API 模块**

```typescript
// src/api/modules/orders.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 订单管理 } from "@/api/generated";
import type { QueryOrderDto } from "@/api/generated";

export const orderKeys = {
  all: ["orders"] as const,
  list: (params?: Record<string, unknown>) => [...orderKeys.all, "list", params] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

export function useOrderList(params?: QueryOrderDto) {
  return useQuery({
    queryKey: orderKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await 订单管理.orderControllerFindAll({ query: params });
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useRefundOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await 订单管理.orderControllerRefund({ path: { id } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
```

- [ ] **Step 2: 改造 orders/events.tsx 和 orders/online.tsx**

删除 mock 导入，使用 `useOrderList` 和 `useRefundOrder`。

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: integrate orders module with real API"
```

---

## Task 7: 组委会模块

**Files:**

- Create: `src/api/modules/organizers.ts`
- Modify: `src/routes/_authenticated/organizers.tsx`

- [ ] **Step 1: 创建组委会 API 模块**

```typescript
// src/api/modules/organizers.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 组委会 } from "@/api/generated";
import type { CreateOrganizerDto, UpdateOrganizerDto } from "@/api/generated";

export const organizerKeys = {
  all: ["organizers"] as const,
  list: (params?: Record<string, unknown>) => [...organizerKeys.all, "list", params] as const,
  detail: (id: string) => [...organizerKeys.all, "detail", id] as const,
};

export function useOrganizerList(params?: { page?: number; pageSize?: number; keyword?: string }) {
  return useQuery({
    queryKey: organizerKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await 组委会.organizerControllerFindAll({ query: params });
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useCreateOrganizer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateOrganizerDto) => {
      const { data } = await 组委会.organizerControllerCreate({ body });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: organizerKeys.all }),
  });
}

export function useUpdateOrganizer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateOrganizerDto }) => {
      const { data } = await 组委会.organizerControllerUpdate({ path: { id }, body });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: organizerKeys.all }),
  });
}

export function useDeleteOrganizer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await 组委会.organizerControllerRemove({ path: { id } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: organizerKeys.all }),
  });
}

export function useUpdateOrganizerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: number }) => {
      const { data } = await 组委会.organizerControllerUpdateStatus({
        path: { id },
        body: { status },
      });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: organizerKeys.all }),
  });
}

export function useResetOrganizerPassword() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await 组委会.organizerControllerResetPassword({ path: { id } });
      return data;
    },
  });
}
```

- [ ] **Step 2: 改造 organizers.tsx**

- 删除 `import { mockOrganizers } from "@/mocks/data/organizers"`
- 使用 `useOrganizerList` 替换 mock 数据
- 实现新增、编辑、删除、启用/停用、重置密码的 mutation 调用
- 添加 loading 和 error 状态

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: integrate organizers module with real API"
```

---

## Task 8: 配速员模块

**Files:**

- Create: `src/api/modules/pacers.ts`
- Modify: `src/routes/_authenticated/pacers/list.tsx`
- Modify: `src/routes/_authenticated/pacers/tests.tsx`
- Modify: `src/routes/_authenticated/pacers/events.tsx`

- [ ] **Step 1: 创建配速员 API 模块**

```typescript
// src/api/modules/pacers.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 配速员管理 } from "@/api/generated";
import type { CreatePacerDto, QueryPacerDto, AssignPacerDto } from "@/api/generated";

export const pacerKeys = {
  all: ["pacers"] as const,
  list: (params?: Record<string, unknown>) => [...pacerKeys.all, "list", params] as const,
  detail: (id: string) => [...pacerKeys.all, "detail", id] as const,
  tests: () => [...pacerKeys.all, "tests"] as const,
  events: () => [...pacerKeys.all, "events"] as const,
};

export function usePacerList(params?: QueryPacerDto) {
  return useQuery({
    queryKey: pacerKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await 配速员管理.pacerControllerFindAll({ query: params });
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useApprovePacer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await 配速员管理.pacerControllerApprove({ path: { id } });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pacerKeys.all }),
  });
}

export function useSuspendPacer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await 配速员管理.pacerControllerSuspend({ path: { id } });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pacerKeys.all }),
  });
}

export function useRevokePacer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await 配速员管理.pacerControllerRevoke({ path: { id } });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pacerKeys.all }),
  });
}

export function useDeletePacer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await 配速员管理.pacerControllerRemove({ path: { id } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pacerKeys.all }),
  });
}

export function usePacerTests() {
  return useQuery({
    queryKey: pacerKeys.tests(),
    queryFn: async () => {
      const { data } = await 配速员管理.pacerControllerFindTests();
      return data;
    },
  });
}

export function usePacerEvents() {
  return useQuery({
    queryKey: pacerKeys.events(),
    queryFn: async () => {
      const { data } = await 配速员管理.pacerControllerFindEvents();
      return data;
    },
  });
}

export function useAssignPacer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: AssignPacerDto) => {
      const { data } = await 配速员管理.pacerControllerAssign({ body });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pacerKeys.all }),
  });
}

export function useWithdrawPacer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await 配速员管理.pacerControllerWithdraw({ path: { id } });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pacerKeys.all }),
  });
}
```

- [ ] **Step 2: 改造 pacers/list.tsx、pacers/tests.tsx、pacers/events.tsx**

- 删除 mock 导入
- 使用对应 hooks
- 实现审核、暂停、解除、删除、分配、弃权等 mutation
- 添加 loading 状态

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: integrate pacers module with real API"
```

---

## Task 9: 用户和角色模块

**Files:**

- Create: `src/api/modules/users.ts`
- Create: `src/api/modules/roles.ts`
- Modify: `src/routes/_authenticated/users.tsx`
- Modify: `src/routes/_authenticated/roles.tsx`

- [ ] **Step 1: 创建用户 API 模块**

```typescript
// src/api/modules/users.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 用户管理 } from "@/api/generated";
import type { CreateUserDto, UpdateUserDto } from "@/api/generated";

export const userKeys = {
  all: ["users"] as const,
  list: (params?: Record<string, unknown>) => [...userKeys.all, "list", params] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

export function useUserList(params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
}) {
  return useQuery({
    queryKey: userKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await 用户管理.userControllerFindAll({ query: params });
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateUserDto) => {
      const { data } = await 用户管理.userControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateUserDto }) => {
      const { data } = await 用户管理.userControllerUpdate({ path: { id }, body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await 用户管理.userControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: number }) => {
      const { data } = await 用户管理.userControllerUpdateStatus({
        path: { id },
        query: { status },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await 用户管理.userControllerResetPassword({ path: { id } });
      return data;
    },
  });
}
```

- [ ] **Step 2: 创建角色 API 模块**

```typescript
// src/api/modules/roles.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 角色管理 } from "@/api/generated";
import type { CreateRoleDto } from "@/api/generated";

export const roleKeys = {
  all: ["roles"] as const,
  list: () => [...roleKeys.all, "list"] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
};

export function useRoleList() {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: async () => {
      const { data } = await 角色管理.roleControllerFindAll();
      return data;
    },
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateRoleDto) => {
      const { data } = await 角色管理.roleControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await 角色管理.roleControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  });
}

export function useAssignPermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, permissionIds }: { id: string; permissionIds: string[] }) => {
      const { data } = await 角色管理.roleControllerAssignPermissions({
        path: { id },
        body: { permissionIds },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  });
}
```

- [ ] **Step 3: 改造 users.tsx 和 roles.tsx**

- 删除内联 mock 数据
- 使用 hooks
- 实现 CRUD 操作

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: integrate users and roles modules with real API"
```

---

## Task 10: 其余业务模块

**目标:** 创建剩余模块的 API hooks 并改造对应页面。

**Files:**

- Create: `src/api/modules/athletic-centers.ts`
- Create: `src/api/modules/registration-cards.ts`
- Create: `src/api/modules/notifications.ts`
- Create: `src/api/modules/client-configs.ts`
- Modify: `src/routes/_authenticated/athletic-centers.tsx`
- Modify: `src/routes/_authenticated/events/registration-cards.tsx`
- Modify: `src/routes/_authenticated/settings/notifications.tsx`
- Modify: `src/routes/_authenticated/settings/client-config.tsx`

- [ ] **Step 1: 创建田管中心 API 模块**

```typescript
// src/api/modules/athletic-centers.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 田管中心 } from "@/api/generated";
import type { CreateAthleticCenterDto } from "@/api/generated";

export const athleticCenterKeys = {
  all: ["athletic-centers"] as const,
  list: (params?: Record<string, unknown>) => [...athleticCenterKeys.all, "list", params] as const,
};

export function useAthleticCenterList(params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}) {
  return useQuery({
    queryKey: athleticCenterKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await 田管中心.athleticCenterControllerFindAll({ query: params });
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useCreateAthleticCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateAthleticCenterDto) => {
      const { data } = await 田管中心.athleticCenterControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: athleticCenterKeys.all }),
  });
}

export function useDeleteAthleticCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await 田管中心.athleticCenterControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: athleticCenterKeys.all }),
  });
}

export function useUpdateAthleticCenterStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: number }) => {
      const { data } = await 田管中心.athleticCenterControllerUpdateStatus({
        path: { id },
        body: { status },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: athleticCenterKeys.all }),
  });
}
```

- [ ] **Step 2: 创建报名卡、通知、客户端配置 API 模块**

报名卡 (`registration-cards.ts`):

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 报名卡管理 } from "@/api/generated";
import type { CreateRegistrationCardDto, UpdateRegistrationCardDto } from "@/api/generated";

export const registrationCardKeys = {
  all: ["registration-cards"] as const,
  list: (params?: Record<string, unknown>) =>
    [...registrationCardKeys.all, "list", params] as const,
  detail: (id: string) => [...registrationCardKeys.all, "detail", id] as const,
};

export function useRegistrationCardList(params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  phone?: string;
  idNumber?: string;
}) {
  return useQuery({
    queryKey: registrationCardKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await 报名卡管理.registrationCardControllerFindAll({ query: params });
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useCreateRegistrationCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateRegistrationCardDto) => {
      const { data } = await 报名卡管理.registrationCardControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: registrationCardKeys.all }),
  });
}

export function useDeleteRegistrationCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await 报名卡管理.registrationCardControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: registrationCardKeys.all }),
  });
}
```

通知 (`notifications.ts`):

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 消息通知 } from "@/api/generated";
import type { CreateNotificationDto } from "@/api/generated";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params?: Record<string, unknown>) => [...notificationKeys.all, "list", params] as const,
};

export function useNotificationList(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: notificationKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await 消息通知.notificationControllerFindAll({ query: params });
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateNotificationDto) => {
      const { data } = await 消息通知.notificationControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
```

客户端配置 (`client-configs.ts`):

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 客户端配置 } from "@/api/generated";
import type { BatchUpdateClientConfigDto } from "@/api/generated";

export const clientConfigKeys = {
  all: ["client-configs"] as const,
};

export function useClientConfigList() {
  return useQuery({
    queryKey: clientConfigKeys.all,
    queryFn: async () => {
      const { data } = await 客户端配置.clientConfigControllerFindAll();
      return data;
    },
  });
}

export function useBatchUpdateClientConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: BatchUpdateClientConfigDto) => {
      const { data } = await 客户端配置.clientConfigControllerBatchUpdate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: clientConfigKeys.all }),
  });
}
```

- [ ] **Step 3: 改造 4 个页面**

- `athletic-centers.tsx`: 删除 mock，使用 `useAthleticCenterList` + mutations
- `registration-cards.tsx`: 删除 mock，使用 `useRegistrationCardList`
- `notifications.tsx`: 删除内联 mock，使用 `useNotificationList`
- `client-config.tsx`: 删除内联 mock，使用 `useClientConfigList` + `useBatchUpdateClientConfig`

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: integrate remaining business modules with real API"
```

---

## Task 11: 系统管理模块（权限、菜单、字典、日志）

**目标:** 创建系统管理模块 hooks。这些模块当前没有独立页面，但为后续扩展做准备。

**Files:**

- Create: `src/api/modules/permissions.ts`
- Create: `src/api/modules/menus.ts`
- Create: `src/api/modules/dicts.ts`
- Create: `src/api/modules/logs.ts`

- [ ] **Step 1: 创建 4 个系统管理模块**

每个模块遵循相同的模式：query keys + list hook + CRUD mutations。

权限 (`permissions.ts`):

```typescript
import { useQuery } from "@tanstack/react-query";
import { 权限管理 } from "@/api/generated";

export const permissionKeys = {
  all: ["permissions"] as const,
  tree: () => [...permissionKeys.all, "tree"] as const,
};

export function usePermissionTree() {
  return useQuery({
    queryKey: permissionKeys.tree(),
    queryFn: async () => {
      const { data } = await 权限管理.permissionControllerFindTree();
      return data;
    },
  });
}
```

菜单 (`menus.ts`):

```typescript
import { useQuery } from "@tanstack/react-query";
import { 菜单管理 } from "@/api/generated";

export const menuKeys = {
  all: ["menus"] as const,
  tree: () => [...menuKeys.all, "tree"] as const,
  userTree: () => [...menuKeys.all, "userTree"] as const,
};

export function useMenuTree() {
  return useQuery({
    queryKey: menuKeys.tree(),
    queryFn: async () => {
      const { data } = await 菜单管理.menuControllerFindTree();
      return data;
    },
  });
}

export function useUserMenuTree() {
  return useQuery({
    queryKey: menuKeys.userTree(),
    queryFn: async () => {
      const { data } = await 菜单管理.menuControllerFindUserTree();
      return data;
    },
  });
}
```

字典 (`dicts.ts`):

```typescript
import { useQuery } from "@tanstack/react-query";
import { 字典管理 } from "@/api/generated";

export const dictKeys = {
  all: ["dicts"] as const,
  byCode: (code: string) => [...dictKeys.all, "code", code] as const,
};

export function useDictByCode(code: string) {
  return useQuery({
    queryKey: dictKeys.byCode(code),
    queryFn: async () => {
      const { data } = await 字典管理.dictControllerFindByCode({ path: { code } });
      return data;
    },
    enabled: !!code,
  });
}
```

日志 (`logs.ts`):

```typescript
import { useQuery } from "@tanstack/react-query";
import { 操作日志 } from "@/api/generated";

export const logKeys = {
  all: ["logs"] as const,
  list: (params?: Record<string, unknown>) => [...logKeys.all, "list", params] as const,
};

export function useLogList(params?: {
  page?: number;
  pageSize?: number;
  module?: string;
  userId?: string;
}) {
  return useQuery({
    queryKey: logKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await 操作日志.logControllerFindAll({ query: params });
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}
```

- [ ] **Step 2: 提交**

```bash
git add -A
git commit -m "feat: add system management API modules (permissions, menus, dicts, logs)"
```

---

## Task 12: 仪表盘和文件上传模块

**目标:** 创建仪表盘数据 hooks 和文件上传 hooks。

**Files:**

- Create: `src/api/modules/dashboard.ts`
- Create: `src/api/modules/files.ts`
- Modify: `src/routes/_authenticated/index.tsx`

- [ ] **Step 1: 创建文件上传 API 模块**

```typescript
// src/api/modules/files.ts
import { useMutation } from "@tanstack/react-query";
import { 文件上传 } from "@/api/generated";

export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await 文件上传.uploadControllerUpload({
        body: formData as unknown as { file: unknown },
      });
      return data;
    },
  });
}
```

- [ ] **Step 2: 创建仪表盘 API 模块**

仪表盘没有独立的后端端点，数据来自多个模块的列表接口。使用已有的 hooks 组合：

```typescript
// src/api/modules/dashboard.ts
import { useQuery } from "@tanstack/react-query";
import { useOrderList } from "./orders";
import { useEventList } from "./events";

// 仪表盘使用各模块的 list 接口获取汇总数据
export function useDashboardData() {
  const orders = useOrderList({ page: 1, pageSize: 5 });
  const events = useEventList({ page: 1, pageSize: 5 });

  return {
    recentOrders: orders.data?.items ?? [],
    recentEvents: events.data?.items ?? [],
    isLoading: orders.isLoading || events.isLoading,
  };
}
```

- [ ] **Step 3: 改造仪表盘页面**

- 删除 `import { dashboardStats, recentOrders, recentEvents } from "@/mocks/data/dashboard"`
- 使用 `useDashboardData()` 或直接使用各模块的 list hooks
- 注意：后端没有独立的 dashboard stats 端点，需要根据实际数据调整展示

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: integrate dashboard and file upload modules"
```

---

## Task 13: 统一导出和清理

**目标:** 创建统一导出文件，删除所有 mock 数据和旧类型文件。

**Files:**

- Create: `src/api/index.ts`
- Modify: `package.json`（添加 openapi-ts script）
- Delete: `src/mocks/` 整个目录
- Delete: `src/lib/api.ts`

- [ ] **Step 1: 创建统一导出**

```typescript
// src/api/index.ts
export { client } from "./client";
export { queryClient } from "./query-client";

// Modules
export * from "./modules/auth";
export * from "./modules/events";
export * from "./modules/orders";
export * from "./modules/organizers";
export * from "./modules/pacers";
export * from "./modules/users";
export * from "./modules/roles";
export * from "./modules/registration-cards";
export * from "./modules/athletic-centers";
export * from "./modules/notifications";
export * from "./modules/client-configs";
export * from "./modules/permissions";
export * from "./modules/menus";
export * from "./modules/dicts";
export * from "./modules/logs";
export * from "./modules/files";
export * from "./modules/dashboard";
```

- [ ] **Step 2: 删除 mock 数据**

```bash
rm -rf src/mocks/
rm src/lib/api.ts
```

- [ ] **Step 3: 确保 package.json 有 openapi-ts 脚本**

```json
{
  "scripts": {
    "openapi-ts": "openapi-ts"
  }
}
```

- [ ] **Step 4: 更新 .gitignore**

将生成的代码加入 .gitignore（可选，取决于是否要提交生成代码）：

```git
# Generated API client (regenerate with: pnpm openapi-ts)
# src/api/generated/
```

- [ ] **Step 5: 全量验证**

1. 启动 backend: `cd backend && pnpm start:dev`
2. 启动 admin: `cd admin && pnpm dev`
3. 测试所有页面：
   - 登录/登出
   - 各列表页加载数据
   - CRUD 操作（新增、编辑、删除）
   - 状态切换（启用/禁用、发布/下架）
   - 分页和搜索

- [ ] **Step 6: 最终提交**

```bash
git add -A
git commit -m "feat: complete API integration - remove all mock data"
```

---

## 执行顺序

按以下顺序执行，每个 task 完成后系统应可正常运行：

1. **Task 1** → 配置客户端（基础）
2. **Task 2** → QueryClient（基础）
3. **Task 3** → 认证模块（必须先完成，其他页面需要登录）
4. **Task 4** → 类型对齐（清理旧类型）
5. **Task 5-12** → 各业务模块（可并行）
6. **Task 13** → 清理和验证
