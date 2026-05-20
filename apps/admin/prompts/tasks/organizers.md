# 组委会模块开发 Prompt

请实现组委会页面。

## 功能要求

- 组委会列表
- 搜索, 可以按组委会名称、账号、联系人或电话搜索
- 筛选, 可以按照状态(status)、创建时间(startDate,endDate)进行筛选
- 新增组委会, 弹窗或新页面, 表单字段需要有 [CreateOrganizerDto](../../../../packages/api-client/src/generated/types.gen.ts)中`CreateOrganizerDto`的字段
- 编辑组委会, 弹窗或新页面, 表单字段需要有 [UpdateOrganizerDto](../../../../packages/api-client/src/generated/types.gen.ts)中`UpdateOrganizerDto`的字段
- 启用/停用组委会, 二次弹窗确认
- 查看组委会详情
- 重置组委会密码

## 字段

id以及[CreateOrganizerDto](../../../../packages/api-client/src/generated/types.gen.ts)中`CreateOrganizerDto`的字段

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
