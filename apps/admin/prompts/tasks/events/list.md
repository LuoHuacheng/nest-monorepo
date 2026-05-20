# 赛事列表模块开发 Prompt

请实现赛事列表页面。

## 功能要求

- 赛事列表
- 搜索, 可以按赛事名称(name)或地点(location)搜索
- 筛选, 可以按照发布状态(publishStatus)、赛事状态(eventStatus)、赛事分类(category)、赛事类型(eventType)、配速方式(needPace)、赛事热度(isHot)、赛事日期(eventStart, eventEnd)进行筛选
- 新增赛事, 弹窗或新页面, 内容字段较多, 后续补全
- 编辑赛事, 弹窗或新页面, 内容字段较多, 后续补全
- 发布/取消发布赛事, 二次弹窗确认
- 查看该赛事下已报名人员, 弹窗或新页面
- 查看该赛事下的订单, 弹窗或新页面
- 赛事抽签, 报名结束后如果报名人数大于赛事最大参赛人数则展示, 弹窗或新页面
- 删除赛事, 弹窗进行二次确认

## 字段

- id
- name
- category
- eventType
- needPace
- isHot
- isOnline
- eventStart
- eventEnd
- registrationStart
- registrationEnd
- location
- participants
- publishStatus
- eventStatus
- property
- createdAt

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
