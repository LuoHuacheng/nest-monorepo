# 数据库

## 配置

- **ORM**: Prisma
- **数据库**: PostgreSQL
- **Schema 位置**: `prisma/schema.prisma`
- **迁移文件**: `prisma/migrations/`

## 常用命令

```bash
# 生成 Prisma Client
pnpm prisma:generate

# 执行待处理的迁移
pnpm prisma:migrate

# 查看迁移状态
pnpm --filter api exec prisma migrate status

# 重置数据库（仅限开发环境！）
pnpm --filter api exec prisma migrate reset --force

# 导入种子数据
pnpm --filter api exec prisma db seed

# 打开 Prisma Studio
pnpm --filter api exec prisma studio
```

## Schema 位置

Prisma schema 放在仓库根目录 (`prisma/`)，以便跨包共享。`api` 应用通过 `prisma.config.ts` 引用：

```ts
// apps/api/prisma.config.ts
export default defineConfig({
  schema: "../../prisma/schema.prisma",
  migrations: { path: "../../prisma/migrations" },
});
```

生成的 Prisma Client 输出到 `apps/api/generated/prisma/`。

## 迁移安全

- 禁止在生产环境运行 `migrate reset`
- 所有迁移必须可回滚，或有数据备份策略
- 添加 NOT NULL 列需要提供默认值用于回填
- 注意索引对大表的影响
