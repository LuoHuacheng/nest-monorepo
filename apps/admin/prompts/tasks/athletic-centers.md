# 田管中心模块开发 Prompt

请实现田管中心页面。

## 功能要求

- 田管中心列表
- 搜索, 可以按田管中心名称、地址、联系人或电话搜索
- 筛选, 可以按照状态(status)、创建时间(startDate,endDate)进行筛选
- 新增田管中心, 弹窗或新页面, 表单字段需要有 [CreateAthleticCenterDto](../../../../packages/api-client/src/generated/types.gen.ts)中`CreateAthleticCenterDto`的字段
- 编辑田管中心, 弹窗或新页面, 表单字段需要有 [UpdateOrganizerDto](../../../../packages/api-client/src/generated/types.gen.ts)中`UpdateOrganizerDto`的字段
- 启用/停用田管中心, 二次弹窗确认
- 查看田管中心详情
- 重置田管中心密码

## 字段

id以及[CreateAthleticCenterDto](../../../../packages/api-client/src/generated/types.gen.ts)中`CreateAthleticCenterDto`的字段

## 技术要求

- TanStack Query
- TanStack Form
- zod
- shadcn/ui
- TypeScript 类型完整

## 限制

- 不要新增依赖
- 修改后运行 pnpm typecheck

## 输出要求

先说明修改计划，再修改代码。
