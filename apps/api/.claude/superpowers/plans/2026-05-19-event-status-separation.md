# 赛事状态与发布状态分离 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Event 模型的单一 `status` 字段拆分为自动计算的"赛事状态"（6态）和手动控制的"发布状态"（3态）。

**Architecture:** 赛事状态不存库，由服务层根据当前时间 + 时间字段 + 业务标记（`groupDrawCompleted`、`adminConfirmed`）实时计算。发布状态存入数据库，管理员手动控制。前端类型、mock 数据、列表页同步更新。

**Tech Stack:** NestJS, Prisma, React, TanStack Router, Tailwind CSS, shadcn/ui

---

## File Structure

### Backend (新建)

- `backend/src/modules/event/event-status.ts` — `computeEventStatus` 函数 + `EventStatus` 类型
- `backend/src/modules/event/dto/update-publish-status.dto.ts` — 更新发布状态的 DTO

### Backend (修改)

- `backend/prisma/schema.prisma` — Event 模型字段变更
- `backend/src/modules/event/event.controller.ts` — 拆分 status 端点为 publish-status + confirm-registration-end
- `backend/src/modules/event/event.service.ts` — 注入 computed eventStatus，更新发布状态逻辑
- `backend/src/modules/event/dto/query-event.dto.ts` — 筛选拆为 eventStatus + publishStatus

### Frontend (修改)

- `admin/src/types/event.ts` — EventStatus + PublishStatus 类型定义
- `admin/src/routes/_authenticated/events/list.tsx` — 表格列、筛选、操作按钮
- `admin/src/mocks/data/events.ts` — mock 数据更新

---

## Task 1: 后端 — 新增 event-status.ts

**Files:**

- Create: `backend/src/modules/event/event-status.ts`

- [ ] **Step 1: 创建 `computeEventStatus` 函数**

```typescript
export type EventStatus =
  | "registration_not_started"
  | "registration_open"
  | "registration_ended"
  | "event_not_started"
  | "event_in_progress"
  | "event_ended";

export function computeEventStatus(event: {
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

- [ ] **Step 2: 验证文件创建成功**

Run: `cat backend/src/modules/event/event-status.ts`
Expected: 文件内容与上述代码一致

---

## Task 2: 后端 — Prisma Schema 变更

**Files:**

- Modify: `backend/prisma/schema.prisma:138-177`

- [ ] **Step 1: 修改 Event 模型**

将 `schema.prisma` 中的 Event 模型从：

```prisma
model Event {
  id                    String    @id @default(cuid())
  name                  String
  category              String?
  status                String    @default("draft") // draft / published / ended
  startDate             DateTime  @map("start_date")
  endDate               DateTime  @map("end_date")
  registrationStartDate DateTime? @map("registration_start_date")
  registrationEndDate   DateTime? @map("registration_end_date")
```

修改为：

```prisma
model Event {
  id                    String    @id @default(cuid())
  name                  String
  category              String?
  publishStatus         String    @default("draft") @map("publish_status") // draft / published / offline
  groupDrawCompleted    Boolean   @default(false) @map("group_draw_completed")
  adminConfirmed        Boolean   @default(false) @map("admin_confirmed")
  startDate             DateTime  @map("start_date")
  endDate               DateTime  @map("end_date")
  registrationStartDate DateTime? @map("registration_start_date")
  registrationEndDate   DateTime? @map("registration_end_date")
```

即：删除 `status` 字段，新增 `publishStatus`、`groupDrawCompleted`、`adminConfirmed` 三个字段。

- [ ] **Step 2: 创建 Prisma migration**

Run: `cd backend && npx prisma migrate dev --name split-event-status`
Expected: migration 文件生成成功，Prisma client 重新生成

- [ ] **Step 3: 编写数据迁移 SQL**

在生成的 migration 文件中添加数据迁移逻辑：

```sql
-- 将旧 status 映射到新 publishStatus
UPDATE "event" SET "publish_status" = "status" WHERE "status" IN ('draft', 'published');
UPDATE "event" SET "publish_status" = 'published', "admin_confirmed" = true WHERE "status" = 'ended';

-- 删除旧列
ALTER TABLE "event" DROP COLUMN "status";
```

注意：如果 migration 已经自动生成了 DROP COLUMN，则跳过重复的 DROP。

- [ ] **Step 4: 验证 migration 执行成功**

Run: `cd backend && npx prisma migrate status`
Expected: 所有 migration 状态为 applied

---

## Task 3: 后端 — 更新 DTO

**Files:**

- Modify: `backend/src/modules/event/dto/query-event.dto.ts`
- Create: `backend/src/modules/event/dto/update-publish-status.dto.ts`

- [ ] **Step 1: 修改 `QueryEventDto`**

将 `query-event.dto.ts` 中的 `status` 筛选字段替换为 `eventStatus` + `publishStatus`：

```typescript
import { IsBoolean, IsDateString, IsOptional, IsString, IsIn } from "class-validator";
import { Transform } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryEventDto extends PaginationDto {
  @ApiPropertyOptional({ description: "搜索关键词（赛事名称/地点）" })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: "赛事状态（自动计算）",
    enum: [
      "registration_not_started",
      "registration_open",
      "registration_ended",
      "event_not_started",
      "event_in_progress",
      "event_ended",
    ],
  })
  @IsOptional()
  @IsString()
  eventStatus?: string;

  @ApiPropertyOptional({
    description: "发布状态",
    enum: ["draft", "published", "offline"],
  })
  @IsOptional()
  @IsString()
  publishStatus?: string;

  @ApiPropertyOptional({ description: "赛事分类" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: "赛事属性",
    enum: ["online", "shuttle_bus", "pacer_recruitment"],
  })
  @IsOptional()
  @IsString()
  attribute?: string;

  @ApiPropertyOptional({ description: "是否热门" })
  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  isHot?: boolean;

  @ApiPropertyOptional({ description: "赛事日期起" })
  @IsOptional()
  @IsDateString()
  dateStart?: string;

  @ApiPropertyOptional({ description: "赛事日期止" })
  @IsOptional()
  @IsDateString()
  dateEnd?: string;
}
```

- [ ] **Step 2: 创建 `UpdatePublishStatusDto`**

创建文件 `backend/src/modules/event/dto/update-publish-status.dto.ts`：

```typescript
import { IsIn, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePublishStatusDto {
  @ApiProperty({ description: "发布状态", enum: ["draft", "published", "offline"] })
  @IsNotEmpty()
  @IsIn(["draft", "published", "offline"])
  publishStatus!: string;
}
```

- [ ] **Step 3: 验证文件内容**

Run: `cat backend/src/modules/event/dto/update-publish-status.dto.ts`
Expected: 文件存在且内容正确

---

## Task 4: 后端 — 更新 EventService

**Files:**

- Modify: `backend/src/modules/event/event.service.ts`

- [ ] **Step 1: 导入 `computeEventStatus`**

在 `event.service.ts` 顶部添加导入：

```typescript
import { computeEventStatus } from "./event-status";
```

- [ ] **Step 2: 添加 `injectEventStatus` 辅助方法**

在 `EventService` 类中添加私有方法（在 `buildEventData` 方法之前）：

```typescript
private injectEventStatus(event: any) {
  const { eventStatus } = computeEventStatus({
    startDate: event.startDate,
    endDate: event.endDate,
    registrationStartDate: event.registrationStartDate,
    registrationEndDate: event.registrationEndDate,
    groupDrawCompleted: event.groupDrawCompleted,
    adminConfirmed: event.adminConfirmed,
  });
  return { ...event, eventStatus };
}
```

- [ ] **Step 3: 修改 `findAll` 方法**

将 `findAll` 方法从：

```typescript
async findAll(query: QueryEventDto): Promise<PaginatedResult<any>> {
  const { page, pageSize, keyword, status, category, attribute, isHot, dateStart, dateEnd } =
    query;
  const where: any = {};

  if (keyword) {
    where.OR = [
      { name: { contains: keyword, mode: "insensitive" } },
      { address: { contains: keyword, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;
  if (category) where.category = category;
  if (attribute) where.attributes = { has: attribute };
  if (isHot !== undefined) where.isHot = isHot;
  if (dateStart) where.startDate = { gte: new Date(dateStart) };
  if (dateEnd) where.endDate = { lte: new Date(`${dateEnd}T23:59:59`) };

  const [items, total] = await Promise.all([
    this.prisma.event.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    this.prisma.event.count({ where }),
  ]);
  return { items, total, page, pageSize };
}
```

修改为：

```typescript
async findAll(query: QueryEventDto): Promise<PaginatedResult<any>> {
  const { page, pageSize, keyword, eventStatus, publishStatus, category, attribute, isHot, dateStart, dateEnd } =
    query;
  const where: any = {};

  if (keyword) {
    where.OR = [
      { name: { contains: keyword, mode: "insensitive" } },
      { address: { contains: keyword, mode: "insensitive" } },
    ];
  }
  if (publishStatus) where.publishStatus = publishStatus;
  if (category) where.category = category;
  if (attribute) where.attributes = { has: attribute };
  if (isHot !== undefined) where.isHot = isHot;
  if (dateStart) where.startDate = { gte: new Date(dateStart) };
  if (dateEnd) where.endDate = { lte: new Date(`${dateEnd}T23:59:59`) };

  const [items, total] = await Promise.all([
    this.prisma.event.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    this.prisma.event.count({ where }),
  ]);

  const itemsWithStatus = items.map((item) => this.injectEventStatus(item));

  // eventStatus 是计算值，需在内存中过滤
  if (eventStatus) {
    const filtered = itemsWithStatus.filter((item) => item.eventStatus === eventStatus);
    return { items: filtered, total: filtered.length, page, pageSize };
  }

  return { items: itemsWithStatus, total, page, pageSize };
}
```

- [ ] **Step 4: 修改 `findOne` 方法**

将 `findOne` 方法的返回值注入 `eventStatus`：

```typescript
async findOne(id: string) {
  const event = await this.prisma.event.findUnique({
    where: { id },
    include: {
      registrationCards: { orderBy: { sort: "asc" } },
    },
  });
  if (!event) throw new NotFoundException("赛事不存在");
  return this.injectEventStatus(event);
}
```

- [ ] **Step 5: 替换 `updateStatus` 为 `updatePublishStatus` 和 `confirmRegistrationEnd`**

删除现有的 `updateStatus` 方法：

```typescript
async updateStatus(id: string, status: string) {
  await this.findOne(id);
  return this.prisma.event.update({ where: { id }, data: { status } });
}
```

替换为：

```typescript
async updatePublishStatus(id: string, publishStatus: string) {
  const event = await this.findOne(id);
  const validTransitions: Record<string, string[]> = {
    draft: ["published"],
    published: ["offline"],
    offline: ["published"],
  };
  if (!validTransitions[event.publishStatus]?.includes(publishStatus)) {
    throw new BadRequestException(
      `不允许从 "${event.publishStatus}" 转换为 "${publishStatus}"`,
    );
  }
  return this.prisma.event.update({ where: { id }, data: { publishStatus } });
}

async confirmRegistrationEnd(id: string) {
  const event = await this.findOne(id);
  if (event.adminConfirmed) {
    throw new BadRequestException("已确认过报名结束");
  }
  return this.prisma.event.update({
    where: { id },
    data: { adminConfirmed: true },
  });
}
```

- [ ] **Step 6: 更新 `create` 方法的默认值**

`create` 方法中 Prisma 会自动使用 schema 的 `@default("draft")`，无需修改。但 `buildEventData` 中不包含 `publishStatus`，确认不受影响。

---

## Task 5: 后端 — 更新 EventController

**Files:**

- Modify: `backend/src/modules/event/event.controller.ts`

- [ ] **Step 1: 导入 `UpdatePublishStatusDto`**

在 `event.controller.ts` 的导入中添加：

```typescript
import { UpdatePublishStatusDto } from "./dto/update-publish-status.dto";
```

- [ ] **Step 2: 替换 `updateStatus` 端点**

将：

```typescript
@Patch(":id/status")
@Permissions("event:update")
@ApiOperation({ summary: "更新赛事状态" })
updateStatus(@Param("id") id: string, @Body("status") status: string) {
  return this.eventService.updateStatus(id, status);
}
```

替换为：

```typescript
@Patch(":id/publish-status")
@Permissions("event:update")
@ApiOperation({ summary: "更新发布状态" })
updatePublishStatus(@Param("id") id: string, @Body() dto: UpdatePublishStatusDto) {
  return this.eventService.updatePublishStatus(id, dto.publishStatus);
}

@Patch(":id/confirm-registration-end")
@Permissions("event:update")
@ApiOperation({ summary: "确认报名结束" })
confirmRegistrationEnd(@Param("id") id: string) {
  return this.eventService.confirmRegistrationEnd(id);
}
```

- [ ] **Step 3: 验证编译通过**

Run: `cd backend && npx tsc --noEmit`
Expected: 无编译错误

---

## Task 6: 前端 — 更新类型定义

**Files:**

- Modify: `admin/src/types/event.ts`

- [ ] **Step 1: 替换 `EventStatus` 类型并新增 `PublishStatus`**

将 `event.ts` 第 1 行：

```typescript
export type EventStatus = "draft" | "published" | "ended";
```

替换为：

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

- [ ] **Step 2: 更新 `Event` 接口**

将 `Event` 接口中的 `status: EventStatus` 替换为：

```typescript
  publishStatus: PublishStatus;
  eventStatus?: EventStatus; // 计算值，API 返回时注入
  groupDrawCompleted: boolean;
  adminConfirmed: boolean;
```

具体来说，将第 27 行的 `status: EventStatus;` 替换为上述 4 行。

- [ ] **Step 3: 更新 re-export**

确认 `admin/src/types/index.ts` 中重新导出了 `PublishStatus` 类型。

---

## Task 7: 前端 — 更新 Mock 数据

**Files:**

- Modify: `admin/src/mocks/data/events.ts`

- [ ] **Step 1: 更新 mock 事件数据**

将每个 mock 事件中的 `status` 字段替换为 `publishStatus`、`groupDrawCompleted`、`adminConfirmed`：

事件 1（北京马拉松）：`publishStatus: "published"`, `groupDrawCompleted: true`, `adminConfirmed: true`
事件 2（上海半马）：`publishStatus: "published"`, `groupDrawCompleted: false`, `adminConfirmed: false`
事件 3（杭州马拉松）：`publishStatus: "draft"`, `groupDrawCompleted: false`, `adminConfirmed: false`
事件 4（深圳线上跑）：`publishStatus: "published"`, `groupDrawCompleted: false`, `adminConfirmed: false`
事件 5（厦门马拉松）：`publishStatus: "published"`, `groupDrawCompleted: true`, `adminConfirmed: true`

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `cd admin && npx tsc --noEmit`
Expected: 无编译错误（可能有其他无关错误，关注 event 相关即可）

---

## Task 8: 前端 — 更新赛事列表页

**Files:**

- Modify: `admin/src/routes/_authenticated/events/list.tsx`

- [ ] **Step 1: 更新 import**

将 import 中的 `EventStatus` 替换为同时导入 `EventStatus` 和 `PublishStatus`：

```typescript
import type { Event, EventAttribute, EventStatus, PublishStatus } from "@/types/event";
```

- [ ] **Step 2: 替换 `statusMap` 为两个 map**

将：

```typescript
const statusMap: Record<
  EventStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "草稿", variant: "secondary" },
  published: { label: "已发布", variant: "default" },
  ended: { label: "已结束", variant: "outline" },
};
```

替换为：

```typescript
const eventStatusMap: Record<
  EventStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  registration_not_started: { label: "报名未开始", variant: "secondary" },
  registration_open: { label: "报名中", variant: "default" },
  registration_ended: { label: "报名结束", variant: "outline" },
  event_not_started: { label: "比赛未开始", variant: "secondary" },
  event_in_progress: { label: "比赛中", variant: "default" },
  event_ended: { label: "已结束", variant: "outline" },
};

const publishStatusMap: Record<
  PublishStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "草稿", variant: "secondary" },
  published: { label: "已发布", variant: "default" },
  offline: { label: "已下架", variant: "outline" },
};
```

- [ ] **Step 3: 更新筛选状态变量**

将：

```typescript
const [filterStatus, setFilterStatus] = useState(ALL);
```

替换为：

```typescript
const [filterEventStatus, setFilterEventStatus] = useState(ALL);
const [filterPublishStatus, setFilterPublishStatus] = useState(ALL);
```

- [ ] **Step 4: 更新筛选逻辑**

在 `filtered` 函数中，将：

```typescript
if (filterStatus !== ALL && e.status !== filterStatus) return false;
```

替换为：

```typescript
if (filterPublishStatus !== ALL && e.publishStatus !== filterPublishStatus) return false;
```

注意：`eventStatus` 是计算值，前端 mock 数据中暂不计算，筛选在 `filterPublishStatus` 基础上进行即可。如需筛选 `eventStatus`，需要在前端也实现 `computeEventStatus` 逻辑。

- [ ] **Step 5: 更新 `resetFilters` 函数**

将 `setFilterStatus(ALL)` 替换为：

```typescript
setFilterEventStatus(ALL);
setFilterPublishStatus(ALL);
```

- [ ] **Step 6: 更新表格列定义**

将赛事状态列从：

```typescript
{
  key: "status",
  title: "赛事状态",
  render: (val: unknown) => {
    const s = statusMap[val as EventStatus];
    return s ? <Badge variant={s.variant}>{s.label}</Badge> : String(val);
  },
},
```

替换为两列：

```typescript
{
  key: "eventStatus",
  title: "赛事状态",
  render: (val: unknown) => {
    const s = eventStatusMap[val as EventStatus];
    return s ? <Badge variant={s.variant}>{s.label}</Badge> : String(val ?? "-");
  },
},
{
  key: "publishStatus",
  title: "发布状态",
  render: (val: unknown) => {
    const s = publishStatusMap[val as PublishStatus];
    return s ? <Badge variant={s.variant}>{s.label}</Badge> : String(val);
  },
},
```

- [ ] **Step 7: 更新操作按钮逻辑**

将操作菜单中的状态判断从 `event.status` 更新为 `event.publishStatus`：

```typescript
{event.publishStatus === "draft" && (
  <DropdownMenuItem
    onClick={() => setStatusAction({ id: event.id, action: "publish" })}
  >
    发布
  </DropdownMenuItem>
)}
{event.publishStatus === "published" && (
  <DropdownMenuItem onClick={() => setStatusAction({ id: event.id, action: "offline" })}>
    下架
  </DropdownMenuItem>
)}
{event.publishStatus === "offline" && (
  <DropdownMenuItem onClick={() => setStatusAction({ id: event.id, action: "republish" })}>
    重新上架
  </DropdownMenuItem>
)}
```

同时更新 `statusAction` 的类型：

```typescript
const [statusAction, setStatusAction] = useState<{
  id: string;
  action: "publish" | "offline" | "republish";
} | null>(null);
```

并更新赛事抽签条件：

```typescript
{event.currentParticipants > 0 && event.publishStatus === "published" && (
  <DropdownMenuItem onClick={() => setDrawEvent(event)}>赛事抽签</DropdownMenuItem>
)}
```

- [ ] **Step 8: 更新筛选栏 UI**

将赛事状态筛选替换为两个筛选器：

```typescript
<FilterItem label="赛事状态">
  <Select
    value={filterEventStatus}
    onValueChange={(v) => {
      setFilterEventStatus(v);
      setPage(1);
    }}
  >
    <SelectTrigger className="w-full min-w-40">
      <SelectValue placeholder="全部" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value={ALL}>全部</SelectItem>
      <SelectItem value="registration_not_started">报名未开始</SelectItem>
      <SelectItem value="registration_open">报名中</SelectItem>
      <SelectItem value="registration_ended">报名结束</SelectItem>
      <SelectItem value="event_not_started">比赛未开始</SelectItem>
      <SelectItem value="event_in_progress">比赛中</SelectItem>
      <SelectItem value="event_ended">已结束</SelectItem>
    </SelectContent>
  </Select>
</FilterItem>

<FilterItem label="发布状态">
  <Select
    value={filterPublishStatus}
    onValueChange={(v) => {
      setFilterPublishStatus(v);
      setPage(1);
    }}
  >
    <SelectTrigger className="w-full min-w-40">
      <SelectValue placeholder="全部" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value={ALL}>全部</SelectItem>
      <SelectItem value="draft">草稿</SelectItem>
      <SelectItem value="published">已发布</SelectItem>
      <SelectItem value="offline">已下架</SelectItem>
    </SelectContent>
  </Select>
</FilterItem>
```

- [ ] **Step 9: 更新 ConfirmDialog**

更新发布状态变更的确认对话框文案：

```typescript
<ConfirmDialog
  open={statusAction !== null}
  onOpenChange={() => setStatusAction(null)}
  title={
    statusAction?.action === "publish"
      ? "确认发布"
      : statusAction?.action === "offline"
        ? "确认下架"
        : "确认重新上架"
  }
  description={
    statusAction?.action === "publish"
      ? "确定要发布该赛事吗？发布后选手即可看到并报名。"
      : statusAction?.action === "offline"
        ? "确定要下架该赛事吗？下架后选手将无法看到该赛事。"
        : "确定要重新上架该赛事吗？上架后选手将重新看到该赛事。"
  }
  onConfirm={() => setStatusAction(null)}
  confirmText={
    statusAction?.action === "publish"
      ? "确认发布"
      : statusAction?.action === "offline"
        ? "确认下架"
        : "确认上架"
  }
/>
```

- [ ] **Step 10: 验证前端编译和运行**

Run: `cd admin && npx tsc --noEmit`
Expected: 无编译错误

Run: `cd admin && pnpm dev`
Expected: 开发服务器启动成功，赛事列表页正常渲染

---

## Task 9: 端到端验证

- [ ] **Step 1: 后端编译检查**

Run: `cd backend && npx tsc --noEmit`
Expected: 无编译错误

- [ ] **Step 2: 前端编译检查**

Run: `cd admin && npx tsc --noEmit`
Expected: 无编译错误

- [ ] **Step 3: 启动后端服务**

Run: `cd backend && pnpm start:dev`
Expected: 服务启动成功，无报错

- [ ] **Step 4: 启动前端服务**

Run: `cd admin && pnpm dev`
Expected: 开发服务器启动，赛事列表页正常

- [ ] **Step 5: 手动验证赛事列表页**

- 表格应显示"赛事状态"和"发布状态"两列
- 筛选栏应有"赛事状态"和"发布状态"两个筛选器
- 操作菜单应根据 `publishStatus` 显示不同选项（发布/下架/重新上架）
- 确认对话框文案应正确
