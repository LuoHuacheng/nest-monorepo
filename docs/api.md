# API 设计

## 后端 API

- **框架**: NestJS
- **基础 URL**: `http://localhost:4001`
- **OpenAPI Spec**: `http://localhost:4001/docs-json`
- **Swagger UI**: `http://localhost:4001/docs`

## 响应格式

所有接口返回统一的响应包装：

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

## 生成的客户端

`@match/api-client` 包从 OpenAPI spec 自动生成：

```bash
# API 变更后重新生成
pnpm generate:api-client
```

### 在 Admin 中使用 (TanStack Start)

```ts
import { Events } from "@match/api-client";

const { data } = await Events.getEvents();
```

### 在小程序中使用 (Taro)

小程序使用自己的 HTTP 客户端（Taro.request），但可以导入类型：

```ts
import type { Event, Order } from "@match/api-client";
```

## 认证

- 基于 JWT token 的认证
- Token 存储在 Zustand store（admin）/ wx.setStorageSync（小程序）
- 401 响应触发自动登出
