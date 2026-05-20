# 权限设计

## 角色体系

角色定义在 `@match/permissions` 中：

```ts
enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}
```

### 角色层级

| 角色 | 等级 | 说明 |
| ------ | ------ | ------ |
| ADMIN | 100 | 系统管理员，完全访问权限 |
| USER | 10 | 普通用户 |

## 授权机制

### 后端 (NestJS)

- Guard 检查用户角色是否满足路由要求
- 装饰器：`@Roles(Role.ADMIN)`、`@CurrentUser()`
- Service 层验证资源所有权

### 前端 (Admin)

- 路由级：`_authenticated.tsx` 布局守卫
- 组件级：根据用户角色条件渲染
- API 级：API 客户端拦截器处理 401/403

### 小程序

- 基于微信 openid/session 的认证
- 手机号授权通过 `<button open-type="getPhoneNumber">`
- 所有 API 调用在后端校验角色

## 数据访问规则

| 资源 | USER | ADMIN |
| ------ | ------ | ------ |
| 个人信息 | 读/写 | 读/写 |
| 所有用户 | - | 读/写 |
| 赛事 | 只读 | 读/写 |
| 订单（本人） | 读/写 | 读/写 |
| 订单（全部） | - | 读/写 |
| 成绩 | 只读 | 读/写 |
