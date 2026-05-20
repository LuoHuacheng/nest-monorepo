# 体育赛事管理后台 - 开发计划

## 技术栈

- TanStack Start (框架)
- React 19
- TypeScript
- TanStack Query (数据获取)
- TanStack Form (表单)
- TanStack Table (表格)
- Axios (HTTP 请求)
- Zustand (状态管理)
- Tailwind CSS v4
- shadcn/ui (组件库)
- zod (数据验证)
- oxc（lint & format）
- lefthook (git hooks)

---

## 阶段一：项目初始化 ✅

### 已完成内容

1. 创建 TanStack Start 项目
2. 安装依赖
   - @tanstack/react-query
   - @tanstack/react-form
   - @tanstack/react-table
   - axios
   - zustand
   - zod
   - tailwind-merge
   - clsx
3. 配置路径别名（`@/*` → `./src/*`）
4. 初始化 shadcn/ui（15 个组件）
5. 创建目录结构
6. 创建核心文件（api.ts, auth.ts, utils.ts）

---

## 阶段二：基础框架

### 2.1 登录页面

**文件**：`src/routes/login.tsx`

**功能**：

- 登录表单（用户名、密码）
- 表单验证
- 调用登录 API
- 存储 token 到 localStorage
- 跳转到首页

**Mock API**：

```typescript
// src/mocks/handlers/auth.ts
export const loginHandler = async (username: string, password: string) => {
  // 模拟登录
  return {
    token: "mock-token",
    user: {
      id: "1",
      username,
      name: "管理员",
      avatar: "/logo192.png",
      phone: "13800000001",
      email: "admin@example.com",
      status: 1,
      roles: ["admin"],
    },
  };
};
```

### 2.2 路由鉴权

**文件**：`src/routes/_authenticated.tsx`

**功能**：

- 检查 token 是否存在
- 未登录跳转到登录页
- 已登录渲染子路由

**实现**：

```typescript
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: () => <Outlet />
})
```

### 2.3 Layout 组件

**文件**：

- `src/components/layout/sidebar.tsx`
- `src/components/layout/header.tsx`
- `src/components/layout/main-layout.tsx`

**Sidebar 菜单结构**：

```plain
├── Dashboard
├── 赛事管理
│   ├── 赛事列表
│   ├── 报名卡列表
│   ├── 邀请码列表
│   ├── 摆渡车列表
│   └── 成绩列表
├── 订单管理
│   ├── 赛事订单
│   └── 线上赛订单
├── 组委会
├── 田管中心
├── 配速员管理
│   ├── 配速员列表
│   ├── 配速员实测
│   └── 配速员赛事
├── 用户管理
├── 角色管理
└── 系统配置
    ├── 消息通知
    └── 客户端配置
```

**Header 功能**：

- 用户信息显示
- 退出登录按钮
- 折叠侧边栏按钮

### 2.4 API 请求封装完善

**文件**：`src/lib/api.ts`

**功能**：

- 请求拦截（添加 token）
- 响应拦截（401 跳转登录）
- 错误处理
- 类型安全的请求方法

---

## 阶段三：Dashboard

### 3.1 Dashboard 首页

**文件**：`src/routes/_authenticated/index.tsx`

**功能**：

- 统计卡片（今日订单数、今日新增用户、待处理退款、本月营收）
- 最近订单列表
- 最近赛事列表
- 快捷操作按钮

**Mock 数据**：

```typescript
// src/mocks/data/dashboard.ts
export const dashboardStats = {
  todayOrders: 128,
  todayUsers: 56,
  pendingRefunds: 12,
  monthlyRevenue: 158000,
};
```

---

## 阶段四：赛事管理

### 4.1 赛事列表

**文件**：`src/routes/_authenticated/events/list.tsx`

**功能**：

- 列表展示（TanStack Table）
- 搜索（赛事名称、地点、状态、分类、属性、热门、日期）
- 新增赛事
- 编辑赛事
- 删除赛事
- 发布赛事
- 结束赛事
- 查看详情

**类型定义**：

```typescript
// src/types/event.ts
export interface Event {
  id: string;
  name: string;
  category: string;
  status: "draft" | "published" | "ended";
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  province: string;
  city: string;
  address: string;
  location: string;
  tags: string[];
  packetPickupTime: string;
  packetPickupLocation: string;
  coverImages: string[];
  isHot: boolean;
  attributes: Array<"online" | "shuttle_bus" | "pacer_recruitment">;
  description: string;
  remark?: string;
  competitionRules?: string;
  entryStatement?: string;
  raceRoute?: string;
  registrationNotice?: string;
  pickupNotice?: string;
  maxParticipants: number;
  currentParticipants: number;
  organizerId: string;
  registrationGroups: EventRegistrationGroup[];
  createdAt: string;
  updatedAt?: string;
}

export interface EventRegistrationGroup {
  groupType: string;
  specName: string;
  specDescription?: string;
  genderLimit: string;
  minAge: number;
  maxAge: number;
  price: number;
  quota: number;
}
```

### 4.2 报名卡列表

**文件**：`src/routes/_authenticated/events/registration-cards.tsx`

**功能**：

- 列表展示
- 搜索（姓名、手机号、身份证号）
- 查看详情

**字段**：

`name`, `relationship`, `idNumber`, `gender`, `birthDate`, `bloodType`, `clothingSize`, `phone`, `province`, `city`, `permanentAddress`, `detailedAddress`, `emergencyContactName`, `emergencyContactPhone`, `status`, `createdAt`, `updatedAt`

### 4.3 邀请码列表

**文件**：`src/routes/_authenticated/events/invite-codes.tsx`

**功能**：

- 列表展示
- 搜索
- 导出
- 查看使用记录

**字段**：`eventId`, `code`, `maxUses`, `usedCount`, `status`, `expiresAt`, `createdAt`

### 4.4 摆渡车列表

**文件**：`src/routes/_authenticated/events/shuttle-buses.tsx`

**功能**：

- 列表展示
- 搜索
- 导出

**字段**：`eventId`, `route`, `departureTime`, `capacity`, `status`, `createdAt`

### 4.5 成绩列表

**文件**：`src/routes/_authenticated/events/results.tsx`

**功能**：

- 列表展示
- 搜索
- 导出

**字段**：`eventId`, `userId`, `bibNumber`, `finishTime`, `rank`, `status`, `createdAt`

---

## 阶段五：订单管理

### 5.1 赛事订单

**文件**：`src/routes/_authenticated/orders/events.tsx`

**功能**：

- 列表展示
- 搜索
- 导出
- 查看详情
- 退款操作

**类型定义**：

```typescript
// src/types/order.ts
export interface Order {
  id: string;
  orderNo: string;
  eventName: string;
  userName: string;
  amount: number;
  status: "pending" | "paid" | "refunded" | "cancelled";
  createdAt: string;
}
```

### 5.2 线上赛订单

**文件**：`src/routes/_authenticated/orders/online.tsx`

**功能**：

- 列表展示
- 搜索
- 导出
- 查看详情
- 退款操作

---

## 阶段六：组织管理

### 6.1 组委会

**文件**：`src/routes/_authenticated/organizers.tsx`

**功能**：

- 列表展示
- 搜索
- 新增
- 编辑
- 重置密码
- 启用/停用

**字段**：

`loginAccount`, `password`, `name`, `contact`, `phone`, `backupContact`, `backupPhone`, `certificateNo`, `eventDate`, `province`, `city`, `address`, `eventScale`, `eventItems`, `operator`, `email`, `remark`, `status`, `createdAt`, `updatedAt`

### 6.2 田管中心

**文件**：`src/routes/_authenticated/athletic-centers.tsx`

**功能**：

- 列表展示
- 搜索
- 新增
- 编辑
- 删除
- 启用/禁用

**字段**：`name`, `contact`, `phone`, `address`, `status`, `createdAt`, `updatedAt`

---

## 阶段七：配速员管理

### 7.1 配速员列表

**文件**：`src/routes/_authenticated/pacers/index.tsx`

**功能**：

- 列表展示
- 搜索
- 导出
- 查看详情
- 审核
- 暂停授权
- 解除授权
- 删除

**字段**：

`pacerNo`, `name`, `phone`, `idCard`, `avatar`, `paceSegments`, `targetTime`, `clothingSize`, `validFrom`, `validTo`, `healthReportUrl`, `ecgImageUrl`, `marathonCertificates`, `pacePlanImageUrl`, `status`, `approvedAt`, `createdAt`, `updatedAt`

### 7.2 配速员实测

**文件**：`src/routes/_authenticated/pacers/tests.tsx`

**功能**：

- 列表展示
- 搜索
- 导出
- 编辑

**字段**：`pacerId`, `testDate`, `location`, `finishTime`, `videoUrl`, `status`, `createdAt`

### 7.3 配速员赛事

**文件**：`src/routes/_authenticated/pacers/events.tsx`

**功能**：

- 列表展示
- 搜索
- 导出
- 查看详情
- 分配
- 弃权

**字段**：`pacerId`, `eventId`, `targetTime`, `status`, `assignedAt`, `createdAt`

---

## 阶段八：系统管理

### 8.1 用户管理

**文件**：`src/routes/_authenticated/users.tsx`

**功能**：

- 列表展示
- 搜索
- 编辑
- 启用/禁用
- 删除

**字段**：`username`, `password`, `name`, `avatar`, `phone`, `email`, `status`, `createdAt`, `updatedAt`

### 8.2 角色管理

**文件**：`src/routes/_authenticated/roles.tsx`

**功能**：

- 列表展示
- 搜索
- 新增
- 编辑
- 删除

**字段**：`name`, `code`, `description`, `status`, `createdAt`

### 8.3 消息通知

**文件**：`src/routes/_authenticated/settings/notifications.tsx`

**功能**：

- 列表展示
- 搜索

**字段**：`title`, `content`, `type`, `targetType`, `targetId`, `status`, `sentAt`, `createdAt`

### 8.4 客户端配置

**文件**：`src/routes/_authenticated/settings/client-config.tsx`

**功能**：

- 配置项展示
- 配置项编辑

---

## 开发规范

### 命名规范

- 文件名：kebab-case（如 `user-list.tsx`）
- 组件名：PascalCase（如 `UserList`）
- 函数名：camelCase（如 `getUserList`）
- 类型名：PascalCase（如 `UserInfo`）
- 常量名：UPPER_SNAKE_CASE（如 `API_BASE_URL`）

### 代码规范

- 使用 TypeScript 严格模式
- 使用 ESLint + Prettier 格式化代码
- 组件使用函数式组件 + Hooks
- 使用 TanStack Query 管理服务端状态
- 使用 Zustand 管理客户端状态
- 使用 zod 验证表单数据

### Git 规范

- 提交信息格式：`type(scope): description`
  - feat: 新功能
  - fix: 修复
  - docs: 文档
  - style: 格式
  - refactor: 重构
  - test: 测试
  - chore: 构建/工具

---

## 目录结构

```plain
admin/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui 组件
│   │   ├── layout/          # 布局组件
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── main-layout.tsx
│   │   └── common/          # 通用组件
│   │       ├── data-table.tsx
│   │       ├── search-form.tsx
│   │       └── confirm-dialog.tsx
│   ├── lib/
│   │   ├── api.ts           # axios 请求封装
│   │   ├── auth.ts          # 鉴权逻辑
│   │   └── utils.ts         # 工具函数
│   ├── hooks/               # 自定义 hooks
│   ├── stores/              # Zustand stores
│   │   └── auth.ts
│   ├── types/               # TypeScript 类型定义
│   │   ├── auth.ts
│   │   ├── event.ts
│   │   ├── order.ts
│   │   └── common.ts
│   ├── mocks/               # Mock 数据
│   │   ├── handlers/
│   │   └── data/
│   └── routes/              # 路由文件
│       ├── __root.tsx
│       ├── login.tsx
│       ├── _authenticated.tsx
│       └── _authenticated/
│           ├── index.tsx
│           ├── events/
│           ├── orders/
│           ├── organizers.tsx
│           ├── athletic-centers.tsx
│           ├── pacers/
│           ├── users.tsx
│           ├── roles.tsx
│           └── settings/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── components.json
```

---

## 开发命令

```bash
# 启动开发服务器
pnpm dev

# 类型检查
pnpm typecheck

# 构建
pnpm build

# 运行测试
pnpm test

# 添加 shadcn/ui 组件
pnpm dlx shadcn@latest add <component-name>
```
