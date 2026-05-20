# 部署

## 环境

| 环境 | 说明 |
| ------ | ------ |
| local | 开发者本地 |
| staging | 预发布环境 |
| production | 生产环境 |

## 构建

```bash
# 构建所有包
pnpm build

# 构建指定应用
pnpm build:api
pnpm build:admin
pnpm build:miniapp
```

## 部署前检查清单

1. `pnpm typecheck` 通过
2. `pnpm lint:check` 通过
3. `pnpm test` 通过
4. 数据库迁移向后兼容
5. API 变更后重新生成 OpenAPI 客户端（`pnpm generate:api-client`）
6. 环境变量已配置

## 小程序部署

微信小程序通过微信开发者工具部署：

1. 构建：`pnpm build:miniapp`
2. 通过微信开发者工具上传
3. 在微信公众平台提交审核
