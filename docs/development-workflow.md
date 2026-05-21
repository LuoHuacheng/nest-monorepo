# 开发工作流

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动所有服务
pnpm dev

# 或单独启动
pnpm dev:api      # 后端 :4001
pnpm dev:admin    # 管理后台 :4000
pnpm dev:miniapp  # 小程序 (Taro)
```

## 日常工作流

1. **拉取最新代码**: `git pull`
2. **安装依赖（如有变更）**: `pnpm install`
3. **启动开发**: `pnpm dev`
4. **修改代码**
5. **Lint**: `pnpm lint`（自动修复）或 `pnpm lint:check`（仅检查）
6. **格式化**: `pnpm format`
7. **类型检查**: `pnpm typecheck`
8. **测试**: `pnpm test`
9. **提交**: lefthook pre-commit 自动运行

## API 变更

1. 修改 NestJS controller/DTO
2. 后端自动生成 OpenAPI spec
3. 运行 `pnpm generate:api-client` 更新共享客户端
4. admin 和 miniapp 自动获得更新的类型

## 数据库变更

1. 编辑 `apps/api/prisma/schema.prisma`
2. 运行 `pnpm prisma:migrate` 创建迁移
3. 迁移自动应用到本地数据库
4. 提交迁移文件

## Git Hooks (lefthook)

Pre-commit hooks 自动运行：

- `lint-api`: 对 `apps/api/**/*.ts` 运行 oxlint
- `lint-admin`: 对 `apps/admin/**/*.{ts,tsx}` 运行 oxlint
- `lint-miniapp`: 对 `apps/miniapp/**/*.{ts,tsx}` 运行 oxlint
- `format-*`: 对每个应用运行 oxc formatter

## 命令速查

```bash
# 开发
pnpm dev                    # 所有应用
pnpm dev:api                # 仅后端
pnpm dev:admin              # 仅管理后台
pnpm dev:miniapp            # 仅小程序

# 构建
pnpm build                  # 所有应用
pnpm build:api / build:admin / build:miniapp

# Lint & 格式化
pnpm lint:check             # 检查
pnpm lint                   # 自动修复
pnpm format:check           # 检查格式
pnpm format                 # 自动格式化

# 测试
pnpm test                   # 所有测试

# 数据库
pnpm prisma:generate        # 重新生成 Prisma Client
pnpm prisma:migrate         # 执行迁移
pnpm --filter api exec prisma db seed        # 导入种子数据
pnpm --filter api exec prisma migrate status # 迁移状态
pnpm --filter api exec prisma studio         # Prisma Studio
```
