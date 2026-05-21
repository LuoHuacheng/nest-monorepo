# 邀请码模块开发 Prompt

请实现邀请码列表页面。

## 功能要求

- 邀请码列表
- 搜索, 可以按邀请码(code)搜索
- 筛选, 可以按照赛事(下拉单选)、状态、创建时间区间进行筛选
- 新增邀请码, 弹窗, 表单字段需要有 [CreateInviteCodeDto](../../../../../packages/api-client/src/generated/types.gen.ts)中`CreateInviteCodeDto`的字段
- 编辑邀请码, 弹窗, 表单字段需要有 [UpdateInviteCodeDto](../../../../../packages/api-client/src/generated/types.gen.ts)中`UpdateInviteCodeDto`的字段
- 查看已使用该邀请码的报名人员

## 字段

id以及[CreateInviteCodeDto](../../../../../packages/api-client/src/generated/types.gen.ts)中`CreateInviteCodeDto`的字段

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
