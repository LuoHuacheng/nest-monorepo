# 赛事列表模块开发 Prompt

请实现赛事列表页面。

## 功能要求

- 赛事列表
- 搜索, 可以按赛事名称(name)或地点(location)搜索
- 筛选, 可以按照发布状态(publishStatus)、赛事状态(eventStatus)、赛事分类(category)、赛事类型(eventType)、配速方式(needPace)、赛事热度(isHot)、赛事日期(eventStart, eventEnd)进行筛选
- 新增赛事, 弹窗或新页面, 表单字段需要有 [CreateEventDto](../../../../../packages/api-client/src/generated/types.gen.ts)中`CreateEventDto`的字段
- 编辑赛事, 弹窗或新页面, 表单字段需要有 [CreateEventDto](../../../../../packages/api-client/src/generated/types.gen.ts)中`UpdateEventDto`的字段
- 备注:
  新增或编辑赛事中的赛事分类为下拉单选列表, 有以下选项: 马拉松赛,路跑活动,越野赛,定向赛,自行车赛,篮球赛,羽毛球,展演,乒乓球,游泳,线上赛,徒步,足球,田径,其他;
  赛事属性为多选Checkbox, 有以下选项: 线上赛,提供摆渡车,招募配速员赛事,以上选项要通过label和value进行中英文映射
  报名组别中的规格名称specName在赛事类型选择马拉松时表现为下拉单选,选项有全马和半马,其他赛事类型则为文本输入
- 发布/取消发布赛事, 二次弹窗确认
- 查看该赛事下已报名人员, 弹窗或新页面
- 查看该赛事下的订单, 弹窗或新页面
- 赛事抽签, 报名结束后如果报名人数大于赛事最大参赛人数则展示, 弹窗或新页面
- 删除赛事, 弹窗进行二次确认

## 字段

id以及[CreateEventDto](../../../../../packages/api-client/src/generated/types.gen.ts)中`CreateEventDto`的字段

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
