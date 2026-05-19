# 赛事状态与发布状态分离设计

## 概述

将 Event 模型的单一 `status` 字段拆分为两个独立维度：

- **赛事状态**（EventStatus）：基于时间和业务条件自动计算，6个状态
- **发布状态**（PublishStatus）：管理员手动控制，3个状态

## 赛事状态（自动计算）

### 状态定义

| 状态 | 标识 | 计算条件 |
| ------ | ------ | ---------- |
| 报名未开始 | `registration_not_started` | `now < registrationStartDate` |
| 报名中 | `registration_open` | `registrationStartDate <= now < registrationEndDate` |
| 报名结束 | `registration_ended` | `registrationEndDate <= now` 且（分组/抽签未完成 或 管理员未确认） |
| 比赛未开始 | `event_not_started` | `registrationEndDate <= now` 且 分组/抽签已完成 且 管理员已确认 且 `now < startDate` |
| 比赛进行中 | `event_in_progress` | `startDate <= now < endDate` |
| 比赛结束 | `event_ended` | `now >= endDate` |

### 业务标记字段

- `groupDrawCompleted` (Boolean)：分组/抽签是否完成
- `adminConfirmed` (Boolean)：管理员是否确认报名结束

这两个标记用于区分"报名结束"与"比赛未开始"状态。

### 计算逻辑

```typescript
function computeEventStatus(event: {
  startDate: Date;
  endDate: Date;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
  groupDrawCompleted: boolean;
  adminConfirmed: boolean;
}): EventStatus {
  const now = new Date();

  if (now >= event.endDate) return "event_ended";
  if (now >= event.startDate) return "event_in_progress";

  if (!event.registrationStartDate || now < event.registrationStartDate)
    return "registration_not_started";
  if (event.registrationEndDate && now < event.registrationEndDate)
    return "registration_open";

  // registrationEndDate <= now < startDate
  if (event.groupDrawCompleted && event.adminConfirmed)
    return "event_not_started";
  return "registration_ended";
}
```

### 空值处理

- `registrationStartDate` 为 null：视为"报名未开始"
- `registrationEndDate` 为 null 且 `registrationStartDate` 不为 null：视为"报名中"（报名无截止时间）
- 两个报名时间都为 null：直接进入比赛状态判断（跳过报名阶段）

## 发布状态（手动控制）

| 状态 | 标识 | 说明 |
| ------ | ------ | ------ |
| 草稿 | `draft` | 默认状态，仅管理员可见 |
| 已发布 | `published` | 对用户可见，可报名 |
| 已下架 | `offline` | 从用户端下架，不再可见 |

允许的转换：`draft → published → offline`，以及 `offline → published`（重新上架）。

## 数据库变更

### Prisma Schema 修改

```prisma
model Event {
  // 删除
  // status  String  @default("draft")

  // 新增
  publishStatus      String    @default("draft") @map("publish_status")
  groupDrawCompleted  Boolean   @default(false) @map("group_draw_completed")
  adminConfirmed      Boolean   @default(false) @map("admin_confirmed")

  // 保留原有时间字段
  startDate             DateTime  @map("start_date")
  endDate               DateTime  @map("end_date")
  registrationStartDate DateTime? @map("registration_start_date")
  registrationEndDate   DateTime? @map("registration_end_date")
}
```

### 数据库迁移

1. 添加 `publish_status` 列，默认 `"draft"`
2. 添加 `group_draw_completed` 列，默认 `false`
3. 添加 `admin_confirmed` 列，默认 `false`
4. 迁移旧数据：`status = "draft"` → `publish_status = "draft"`，`status = "published"` → `publish_status = "published"`，`status = "ended"` → `publish_status = "published"` + `admin_confirmed = true`
5. 删除 `status` 列

## 后端变更

### 新增文件

- `src/modules/event/event-status.ts`：`computeEventStatus` 函数和 `EventStatus` 类型定义

### 修改文件

- `event.controller.ts`：
  - `PATCH /events/:id/status` → 拆分为 `PATCH /events/:id/publish-status`（更新发布状态）
  - 新增 `PATCH /events/:id/confirm-registration-end`（管理员确认报名结束，设置 `adminConfirmed = true`）
- `event.service.ts`：
  - `findAll`：返回结果注入 `eventStatus`（计算值）；支持按 `eventStatus` 和 `publishStatus` 分别筛选
  - `findOne`：返回结果注入 `eventStatus`
  - `updatePublishStatus`：替换原 `updateStatus`，校验合法转换
  - `confirmRegistrationEnd`：设置 `adminConfirmed = true`
- `dto/query-event.dto.ts`：`status` 筛选拆为 `eventStatus` + `publishStatus`
- `dto/update-publish-status.dto.ts`：新增，校验 `publishStatus` 值

### API 变更

| 旧 | 新 | 说明 |
| ---- | ----- | ------ |
| `PATCH /events/:id/status` | `PATCH /events/:id/publish-status` | 更新发布状态 |
| — | `PATCH /events/:id/confirm-registration-end` | 管理员确认报名结束 |
| `GET /events?status=x` | `GET /events?eventStatus=x&publishStatus=x` | 分别筛选 |

## 前端变更

### 类型定义 (`types/event.ts`)

```typescript
export type EventStatus =
  | "registration_not_started"
  | "registration_open"
  | "registration_ended"
  | "event_not_started"
  | "event_in_progress"
  | "event_ended";

export type PublishStatus = "draft" | "published" | "offline";
```

### 赛事列表页 (`routes/_authenticated/events/list.tsx`)

- 新增"赛事状态"列，Badge 展示6种状态
- 修改"发布状态"列，支持手动切换（下拉菜单：发布/下架/重新上架）
- 筛选栏支持按两种状态分别筛选
- 操作栏：根据赛事状态显示"确认报名结束"按钮（仅在 `registration_ended` 状态显示）

### 状态颜色方案

**赛事状态 Badge：**

| 状态 | 颜色 | Variant |
| ------ | ------ | ------ ---|
| 报名未开始 | 黄色 | `secondary` |
| 报名中 | 绿色 | `default` |
| 报名结束 | 橙色 | `outline` |
| 比赛未开始 | 蓝色 | `secondary` |
| 比赛进行中 | 蓝色 | `default` |
| 比赛结束 | 灰色 | `outline` |

**发布状态 Badge：**

| 状态 | 颜色 | Variant |
| ------ | ------ | ------ ---|
| 草稿 | 灰色 | `secondary` |
| 已发布 | 主色 | `default` |
| 已下架 | 灰色 | `outline` |

### Mock 数据 (`mocks/data/events.ts`)

更新 mock 数据，包含 `publishStatus`、`groupDrawCompleted`、`adminConfirmed` 字段，移除旧 `status` 字段。

## 影响范围

### 需要修改的文件

**后端：**

- `prisma/schema.prisma`
- `src/modules/event/event.controller.ts`
- `src/modules/event/event.service.ts`
- `src/modules/event/dto/query-event.dto.ts`
- `src/modules/event/dto/create-event.dto.ts`（如有 status 引用）
- 新增 `src/modules/event/event-status.ts`
- 新增 `src/modules/event/dto/update-publish-status.dto.ts`

**前端：**

- `src/types/event.ts`
- `src/routes/_authenticated/events/list.tsx`
- `src/mocks/data/events.ts`

### 不受影响的部分

- 其他子页面（报名卡、邀请码、摆渡车、成绩）的状态系统独立，不受影响
- 订单状态系统独立，不受影响
