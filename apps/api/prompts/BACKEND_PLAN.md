# 体育赛事管理系统 - 后端架构设计计划

## Context

前端管理后台（TanStack Start）已完成阶段一，需要配套的后端 API 服务。后端基于 NestJS + PostgreSQL + Prisma ORM，提供 JWT 认证、RBAC 权限控制、Swagger 文档。业务范围覆盖：系统管理（用户/角色/权限/菜单/字典/日志/文件上传）+ 业务模块（赛事/订单/组委会/田管中心/配速员/消息通知/客户端配置）。

---

## 一、项目模块划分

```plain
后端模块分为两大层：系统基础层 + 业务层

系统基础层：
├── auth          — 登录认证（JWT）、Token 刷新
├── user          — 管理员用户 CRUD
├── role          — 角色管理 + RBAC
├── permission    — 权限点管理
├── menu          — 动态菜单管理
├── dict          — 字典管理（通用枚举值）
├── log           — 操作日志记录
└── upload        — 文件上传（OSS / 本地）

业务层：
├── event              — 赛事管理（赛事、邀请码、摆渡车、成绩）
├── registration-card  — 报名卡管理（独立模块）
├── order              — 订单管理（赛事订单、线上赛订单、退款）
├── organizer     — 组委会管理
├── athletic-center — 田管中心管理
├── pacer         — 配速员管理（配速员、实测、配速员赛事）
├── notification  — 消息通知
└── client-config — 客户端配置
```

---

## 二、数据库表设计

### 系统基础表

| 表名 | 说明 | 核心字段 |
| --- | --- | --- |
| `sys_user` | 管理员用户 | id, username, password, name, avatar, phone, email, status, created_at, updated_at |
| `sys_role` | 角色 | id, name, code, description, status, created_at |
| `sys_user_role` | 用户-角色关联 | user_id, role_id |
| `sys_permission` | 权限点 | id, name, code, type(button/api), parent_id, created_at |
| `sys_role_permission` | 角色-权限关联 | role_id, permission_id |
| `sys_menu` | 菜单 | id, name, path, icon, parent_id, sort, type(dir/menu/button), permission_code, status, created_at |
| `sys_dict` | 字典类型 | id, name, code, description, status |
| `sys_dict_item` | 字典项 | id, dict_id, label, value, sort, status |
| `sys_log` | 操作日志 | id, user_id, module, action, method, path, ip, request_body, response_status, created_at |

### 业务表

| 表名 | 说明 | 核心字段 |
| --- | --- | --- |
| `event` | 赛事 | id, name, category, status(draft/published/ended), start_date, end_date, registration_start_date, registration_end_date, province, city, address, location, tags(json), packet_pickup_time, packet_pickup_location, cover_images(json), is_hot, attributes(json), description, remark, competition_rules, entry_statement, race_route, registration_notice, pickup_notice, max_participants, current_participants, organizer_id, created_at |
| `event_registration_group` | 赛事报名组别 | id, event_id, name, group_type, spec_name, spec_description, gender_limit, min_age, max_age, price, quota, sold_count, status, sort, created_at |
| `registration_card` | 参赛人报名卡 | id, name, relationship, id_number, gender, birth_date, blood_type, clothing_size, phone, province, city, permanent_address, detailed_address, emergency_contact_name, emergency_contact_phone, status, created_at, updated_at |
| `event_invite_code` | 邀请码 | id, event_id, registrationGroup, code, desc, max_uses, used_count, status, expires_at, created_at |
| `event_shuttle_bus` | 摆渡车 | id, event_id, route, departure_time, capacity, status, created_at |
| `event_result` | 成绩 | id, event_id, user_id, bib_number, finish_time, rank, status, created_at |
| `order` | 订单 | id, order_no, event_id, user_id, registration_card_id, amount, status(pending/paid/refunded/cancelled), paid_at, refunded_at, created_at |
| `organizer` | 组委会 | id, login_account, name, contact, phone, backup_contact, backup_phone, certificate_no, event_date, province, city, address, event_scale, event_items(json), operator, email, remark, password, status, created_at, updated_at |
| `athletic_center` | 田管中心 | id, name, contact, phone, address, status, created_at |
| `pacer` | 配速员 | id, pacer_no, name, phone, id_card, avatar, pace_segments(json), target_time, clothing_size, valid_from, valid_to, health_report_url, ecg_image_url, marathon_certificates(json), pace_plan_image_url, status(pending/approved/suspended/revoked), approved_at, created_at, updated_at |
| `pacer_test` | 配速员实测 | id, pacer_id, test_date, location, finish_time, video_url, status, created_at |
| `pacer_event` | 配速员赛事 | id, pacer_id, event_id, target_time, status(assigned/withdrawn/completed), assigned_at, created_at |
| `notification` | 消息通知 | id, title, content, type, target_type(all/user), target_id, status(sent/pending), sent_at, created_at |
| `client_config` | 客户端配置 | id, key, value, description, updated_at |
| `file` | 上传文件 | id, original_name, filename, path, mime_type, size, uploader_id, created_at |

---

## 三、RESTful API 路由设计

### 认证 `/api/auth`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | 管理员登录 | 公开 |
| POST | `/api/auth/refresh` | 刷新 Token | 登录 |
| GET | `/api/auth/profile` | 获取当前用户信息 | 登录 |
| POST | `/api/auth/logout` | 退出登录 | 登录 |

### 用户 `/api/users`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/users` | 用户列表（分页/搜索） | user:list |
| GET | `/api/users/:id` | 用户详情 | user:list |
| POST | `/api/users` | 创建用户 | user:create |
| PATCH | `/api/users/:id` | 更新用户 | user:update |
| DELETE | `/api/users/:id` | 删除用户 | user:delete |
| PATCH | `/api/users/:id/status` | 启用/禁用 | user:update |

### 角色 `/api/roles`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/roles` | 角色列表 | role:list |
| GET | `/api/roles/:id` | 角色详情（含权限） | role:list |
| POST | `/api/roles` | 创建角色 | role:create |
| PATCH | `/api/roles/:id` | 更新角色 | role:update |
| DELETE | `/api/roles/:id` | 删除角色 | role:delete |
| PUT | `/api/roles/:id/permissions` | 分配权限 | role:assign |

### 权限 `/api/permissions`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/permissions` | 权限树 | permission:list |
| POST | `/api/permissions` | 创建权限 | permission:create |
| PATCH | `/api/permissions/:id` | 更新权限 | permission:update |
| DELETE | `/api/permissions/:id` | 删除权限 | permission:delete |

### 菜单 `/api/menus`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/menus` | 菜单树 | menu:list |
| GET | `/api/menus/tree` | 当前用户菜单树 | 登录 |
| POST | `/api/menus` | 创建菜单 | menu:create |
| PATCH | `/api/menus/:id` | 更新菜单 | menu:update |
| DELETE | `/api/menus/:id` | 删除菜单 | menu:delete |

### 字典 `/api/dicts`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/dicts` | 字典类型列表 | dict:list |
| POST | `/api/dicts` | 创建字典类型 | dict:create |
| PATCH | `/api/dicts/:id` | 更新字典类型 | dict:update |
| DELETE | `/api/dicts/:id` | 删除字典类型 | dict:delete |
| GET | `/api/dicts/:id/items` | 字典项列表 | dict:list |
| POST | `/api/dicts/:id/items` | 创建字典项 | dict:create |
| PATCH | `/api/dicts/items/:id` | 更新字典项 | dict:update |
| DELETE | `/api/dicts/items/:id` | 删除字典项 | dict:delete |
| GET | `/api/dicts/by-code/:code` | 按 code 查询字典项 | 登录 |

### 操作日志 `/api/logs`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/logs` | 日志列表（分页/筛选） | log:list |

### 文件 `/api/files`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| POST | `/api/files/upload` | 上传文件 | 登录 |
| GET | `/api/files/:id` | 获取文件信息 | 登录 |

### 赛事 `/api/events`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/events` | 赛事列表 | event:list |
| GET | `/api/events/:id` | 赛事详情 | event:list |
| GET | `/api/events/:id/participants` | 赛事参赛人列表 | event:list |
| GET | `/api/events/:id/orders` | 赛事订单列表 | event:list |
| POST | `/api/events` | 创建赛事 | event:create |
| PATCH | `/api/events/:id` | 更新赛事 | event:update |
| DELETE | `/api/events/:id` | 删除赛事 | event:delete |
| PATCH | `/api/events/:id/status` | 发布/结束赛事 | event:update |

#### 创建/更新赛事字段

`POST /api/events` 需要一次性提交赛事基础信息、赛事详细信息、报名级别和详情内容；`PATCH /api/events/:id` 字段均可选，传入 `registrationGroups` 时会整体替换该赛事的报名级别。若报名级别已有订单或售出记录，后端拒绝整体替换。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | string | 是 | 赛事名称 |
| `category` | string | 是 | 赛事分类，例如马拉松赛 |
| `maxParticipants` | number | 是 | 人数限制 |
| `startDate` / `endDate` | ISO datetime | 是 | 比赛日期、结束日期 |
| `registrationStartDate` / `registrationEndDate` | ISO datetime | 是 | 报名开始/结束时间 |
| `province` / `city` / `address` | string | 是 | 比赛城市与详细地址，后端同步生成兼容字段 `location` |
| `tags` | string[] | 否 | 标签，前端可用斜杠展示 |
| `packetPickupTime` / `packetPickupLocation` | ISO datetime / string | 是 | 赛事包领取时间、地址 |
| `coverImages` | string[] | 是 | 封面图，1-2 张，建议使用文件上传接口返回路径 |
| `isHot` | boolean | 否 | 是否热门赛事 |
| `organizerId` | string | 是 | 关联组委会 |
| `attributes` | string[] | 否 | 赛事属性：`online`、`shuttle_bus`、`pacer_recruitment` |
| `registrationGroups` | object[] | 是 | 报名组别列表 |
| `description` | string | 是 | 赛事描述，最多 500 字 |
| `remark` | string | 否 | 后台备注，最多 200 字 |
| `competitionRules` / `entryStatement` / `raceRoute` / `registrationNotice` / `pickupNotice` | string | 否 | 赛事详情富文本：竞赛规程、参赛声明、比赛路线、报名须知、领物须知 |

`registrationGroups` 子项字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `groupType` | string | 是 | 组别类型，例如个人组 |
| `specName` | string | 是 | 规格名称，例如马拉松 |
| `specDescription` | string | 否 | 规格描述 |
| `price` | number | 是 | 价格（元） |
| `genderLimit` | string | 是 | 性别限制，例如不限/男/女 |
| `minAge` / `maxAge` | number | 是 | 年龄限制 |
| `quota` | number | 是 | 该级别人数限制 |

#### 邀请码 `/api/events/:eventId/invite-codes`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/events/:eventId/invite-codes` | 邀请码列表 |
| POST | `/api/events/:eventId/invite-codes` | 创建邀请码 |
| DELETE | `/api/events/invite-codes/:id` | 删除邀请码 |

#### 摆渡车 `/api/events/:eventId/shuttle-buses`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/events/:eventId/shuttle-buses` | 摆渡车列表 |
| POST | `/api/events/:eventId/shuttle-buses` | 创建摆渡车 |
| PATCH | `/api/events/shuttle-buses/:id` | 更新摆渡车 |
| DELETE | `/api/events/shuttle-buses/:id` | 删除摆渡车 |

#### 成绩 `/api/events/:eventId/results`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/events/:eventId/results` | 成绩列表 |
| POST | `/api/events/:eventId/results/import` | 导入成绩 |

### 报名卡 `/api/registration-cards`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/registration-cards` | 报名卡列表（分页/搜索，可按 keyword/phone/idNumber 筛选） | registration-card:list |
| GET | `/api/registration-cards/:id` | 报名卡详情 | registration-card:list |
| POST | `/api/registration-cards` | 创建报名卡 | registration-card:create |
| PATCH | `/api/registration-cards/:id` | 更新报名卡 | registration-card:update |
| DELETE | `/api/registration-cards/:id` | 删除报名卡 | registration-card:delete |

#### 创建/更新报名卡字段

`POST /api/registration-cards` 创建参赛人报名卡；`PATCH /api/registration-cards/:id` 字段均可选。`createdAt` 由后端自动生成。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | string | 是 | 姓名 |
| `relationship` | string | 是 | 与本人关系，例如本人 |
| `idNumber` | string | 是 | 身份证号 |
| `gender` | string | 是 | 性别 |
| `birthDate` | ISO date/datetime | 是 | 出生日期 |
| `bloodType` | string | 否 | 血型 |
| `clothingSize` | string | 否 | 衣服尺码 |
| `phone` | string | 是 | 手机号码 |
| `province` / `city` | string | 否 | 常住省份、城市 |
| `permanentAddress` | string | 否 | 常住地址展示值 |
| `detailedAddress` | string | 否 | 详细地址 |
| `emergencyContactName` | string | 是 | 紧急联系人姓名 |
| `emergencyContactPhone` | string | 是 | 紧急联系人电话 |
| `status` | number | 否 | 更新时可用，1=启用，0=禁用 |

### 订单 `/api/orders`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/orders` | 订单列表（分页/筛选 type=event/online） | order:list |
| GET | `/api/orders/:id` | 订单详情 | order:list |
| POST | `/api/orders/:id/refund` | 退款 | order:refund |

### 组委会 `/api/organizers`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/organizers` | 组委会列表 | organizer:list |
| GET | `/api/organizers/:id` | 组委会详情 | organizer:list |
| POST | `/api/organizers` | 创建组委会 | organizer:create |
| PATCH | `/api/organizers/:id` | 更新组委会 | organizer:update |
| DELETE | `/api/organizers/:id` | 删除组委会 | organizer:delete |
| PATCH | `/api/organizers/:id/status` | 启用/停用 | organizer:update |
| POST | `/api/organizers/:id/reset-password` | 重置密码 | organizer:update |

#### 创建/更新组委会字段

`POST /api/organizers` 创建组委会并初始化登录账号；`PATCH /api/organizers/:id` 字段均可选。`password` 写入时由后端 bcrypt 加密，长度要求 6-20 位。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `loginAccount` | string | 是 | 登录账号 |
| `password` | string | 是 | 登录密码，6-20 位 |
| `name` | string | 是 | 组委会名称，最多 50 字 |
| `contact` | string | 是 | 联系人 |
| `phone` | string | 是 | 联系电话 |
| `backupContact` | string | 是 | 备用联系人 |
| `backupPhone` | string | 是 | 备用联系电话 |
| `certificateNo` | string | 是 | 资质证书编号 |
| `eventDate` | ISO datetime | 是 | 赛事时间 |
| `province` / `city` | string | 是 | 赛事省份、城市 |
| `address` | string | 是 | 详细地址 |
| `eventScale` | number | 是 | 赛事规模（人数） |
| `eventItems` | string[] | 是 | 赛事项目，例如马拉松、半程马拉松 |
| `operator` | string | 否 | 运营单位 |
| `email` | string | 是 | 组委会邮箱 |
| `remark` | string | 否 | 备注，最多 200 字 |

### 田管中心 `/api/athletic-centers`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/athletic-centers` | 田管中心列表 | athletic-center:list |
| GET | `/api/athletic-centers/:id` | 田管中心详情 | athletic-center:list |
| POST | `/api/athletic-centers` | 创建田管中心 | athletic-center:create |
| PATCH | `/api/athletic-centers/:id` | 更新田管中心 | athletic-center:update |
| DELETE | `/api/athletic-centers/:id` | 删除田管中心 | athletic-center:delete |
| PATCH | `/api/athletic-centers/:id/status` | 启用/禁用 | athletic-center:update |

### 配速员 `/api/pacers`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/pacers` | 配速员列表 | pacer:list |
| GET | `/api/pacers/:id` | 配速员详情 | pacer:list |
| POST | `/api/pacers` | 创建配速员 | pacer:create |
| PATCH | `/api/pacers/:id/approve` | 审核通过 | pacer:approve |
| PATCH | `/api/pacers/:id/suspend` | 暂停授权 | pacer:suspend |
| PATCH | `/api/pacers/:id/revoke` | 解除授权 | pacer:revoke |
| DELETE | `/api/pacers/:id` | 删除 | pacer:delete |
| GET | `/api/pacers/tests/list` | 实测列表 | pacer:list |
| PATCH | `/api/pacers/tests/:id` | 编辑实测 | pacer:update |
| GET | `/api/pacers/events/list` | 配速员赛事列表 | pacer:list |
| GET | `/api/pacers/events/:id` | 配速员赛事详情 | pacer:list |
| POST | `/api/pacers/events/assign` | 分配配速员 | pacer:assign |
| PATCH | `/api/pacers/events/:id/withdraw` | 弃权 | pacer:update |

#### 创建配速员字段

`POST /api/pacers` 创建配速员。`pacerNo` 不传时后端按当天日期自动生成；`createdAt` 作为提交时间由后端自动生成。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `pacerNo` | string | 否 | PacerID，例如 2026050800001 |
| `name` | string | 是 | 姓名 |
| `phone` | string | 是 | 手机号 |
| `idCard` | string | 是 | 身份证号 |
| `avatar` | string | 否 | 头像 |
| `paceSegments` | string[] | 是 | 配速段，例如半马2:30、半马2:45、半马3:00 |
| `targetTime` | string | 否 | 目标时间/配速目标，兼容旧字段 |
| `clothingSize` | string | 是 | 尺码 |
| `validFrom` / `validTo` | ISO datetime | 是 | 有效期开始/结束时间 |
| `healthReportUrl` | string | 是 | 体检报告文件地址 |
| `ecgImageUrl` | string | 是 | 心电图图片地址 |
| `marathonCertificates` | string[] | 是 | 马拉松成绩证书，最多 4 张 |
| `pacePlanImageUrl` | string | 是 | 个人配速计划图片 |
| `status` | string | 否 | 状态：pending/approved/suspended/revoked |

### 消息通知 `/api/notifications`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/notifications` | 消息列表 | notification:list |
| POST | `/api/notifications` | 创建并发送 | notification:create |

### 客户端配置 `/api/client-configs`

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/client-configs` | 配置列表 | client-config:list |
| PATCH | `/api/client-configs` | 批量更新配置 | client-config:update |

---

## 四、各模块职责

| 模块 | 职责 |
| --- | --- |
| **auth** | JWT 登录/刷新/登出，密码 bcrypt 加密，AuthGuard 守卫 |
| **user** | 管理员 CRUD，密码重置，状态管理 |
| **role** | 角色 CRUD，用户-角色绑定，角色-权限绑定 |
| **permission** | 权限点 CRUD，生成权限树，供 RBAC 拦截 |
| **menu** | 菜单 CRUD，生成菜单树，根据角色返回动态菜单 |
| **dict** | 字典类型+字典项 CRUD，按 code 查询供前端下拉使用 |
| **log** | 通过拦截器自动记录操作日志（用户、模块、动作、IP、请求体） |
| **upload** | 文件上传到本地/OSS，返回可访问 URL |
| **event** | 赛事全生命周期管理，创建/更新时维护基础信息、报名级别、富文本详情，关联邀请码/摆渡车/成绩 |
| **registration-card** | 参赛人报名卡 CRUD，维护姓名、证件、联系方式、地址、紧急联系人等资料 |
| **order** | 订单查询/导出/退款，关联赛事和用户 |
| **organizer** | 组委会账户管理，维护登录账号、联系人、备用联系人、资质证书、赛事信息、运营单位和备注 |
| **athletic-center** | 田管中心基础数据管理 |
| **pacer** | 配速员申请/审核/授权/赛事分配全流程，维护基础信息、配速段、有效期、健康证明、成绩证书和个人配速计划 |
| **notification** | 消息推送（站内信/模板） |
| **client-config** | 客户端版本/开关等配置项管理 |

---

## 五、开发顺序

```plain
第一阶段：项目骨架 + 认证
  1. 项目初始化（NestJS + Prisma + PostgreSQL 连接）
  2. Swagger 配置
  3. 全局异常过滤器 + 响应拦截器（统一返回格式 { code, data, message }）
  4. auth 模块（登录/Token 刷新/JWT 守卫/RBAC 守卫）
  5. sys_user 表 + 用户模块基础 CRUD

第二阶段：RBAC 完整链路
  6. role 模块 + sys_user_role 关联
  7. permission 模块 + sys_role_permission 关联
  8. menu 模块 + 动态菜单接口
  9. RBAC 守卫完善（根据请求路径匹配权限 code）

第三阶段：系统辅助模块
  10. dict 模块
  11. log 模块（操作日志拦截器）
  12. upload 模块

第四阶段：业务模块（按前端开发阶段对应）
  13. event 模块（赛事 + 邀请码 + 摆渡车 + 成绩）
  14. registration-card 模块（报名卡管理）
  15. order 模块（赛事订单 + 线上赛订单 + 退款）
  16. organizer 模块
  17. athletic-center 模块
  18. pacer 模块（配速员 + 实测 + 赛事分配）

第五阶段：收尾
  19. notification 模块
  20. client-config 模块
  21. 接口联调 + Swagger 文档完善
```

---

## 六、推荐目录结构

```plain
backend/
├── prisma/
│   ├── schema.prisma              # Prisma Schema
│   ├── seed.ts                    # 种子数据脚本
│   └── migrations/                # 数据库迁移
├── src/
│   ├── common/
│   │   ├── decorators/            # 自定义装饰器
│   │   │   ├── public.decorator.ts
│   │   │   ├── permissions.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── guards/                # 守卫
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── rbac.guard.ts
│   │   ├── interceptors/          # 拦截器
│   │   │   └── transform.interceptor.ts
│   │   ├── filters/               # 异常过滤器
│   │   │   └── http-exception.filter.ts
│   │   └── dto/                   # 通用 DTO
│   │       └── pagination.dto.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       └── login.dto.ts
│   │   ├── user/
│   │   │   ├── user.module.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── dto/
│   │   ├── role/
│   │   ├── permission/
│   │   ├── menu/
│   │   ├── dict/
│   │   ├── log/
│   │   ├── upload/
│   │   ├── event/
│   │   │   ├── event.module.ts
│   │   │   ├── event.controller.ts
│   │   │   ├── event.service.ts
│   │   │   └── dto/
│   │   ├── registration-card/
│   │   │   ├── registration-card.module.ts
│   │   │   ├── registration-card.controller.ts
│   │   │   ├── registration-card.service.ts
│   │   │   └── dto/
│   │   ├── order/
│   │   ├── organizer/
│   │   ├── athletic-center/
│   │   ├── pacer/
│   │   ├── notification/
│   │   └── client-config/
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── app.module.ts
│   └── main.ts
├── generated/prisma/              # Prisma 自动生成（gitignore）
├── .env
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── pnpm-lock.yaml
```

---

## 七、统一响应格式

```typescript
// 成功响应
{
  code: 200,
  data: T,
  message: 'success'
}

// 分页响应
{
  code: 200,
  data: {
    items: T[],
    total: number,
    page: number,
    pageSize: number
  },
  message: 'success'
}

// 错误响应
{
  code: 400/401/403/404/500,
  data: null,
  message: '错误信息'
}
```

---

## 八、技术栈版本

| 依赖 | 版本 |
| --- | --- |
| NestJS | 11.x |
| Prisma | 7.x |
| PostgreSQL | 14+ |
| @nestjs/jwt | 11.x |
| @nestjs/passport | 11.x |
| @nestjs/swagger | 11.x |
| bcrypt | 6.x |
| class-validator | 0.15.x |
| class-transformer | 0.5.x |

---

## 九、启动步骤

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 设置 DATABASE_URL 和 JWT_SECRET

# 3. 生成 Prisma Client
pnpm prisma:generate

# 4. 运行数据库迁移
pnpm prisma:migrate

# 5. 导入种子数据
pnpm prisma:seed

# 6. 启动开发服务器
pnpm start:dev

# 7. 访问 Swagger 文档
# http://localhost:4001/docs
```

默认管理员账号：`admin` / `admin123`
