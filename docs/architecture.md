# 架构

## Monorepo 结构

```txt
match/
├── apps/
│   ├── api/          NestJS 后端
│   ├── admin/        TanStack Start 管理后台
│   └── miniapp/      Taro 微信小程序
├── packages/
│   ├── api-client/   OpenAPI 生成的 SDK (@match/api-client)
│   ├── types/        共享 TypeScript 类型 (@match/types)
│   ├── schemas/      Zod 校验 schema (@match/schemas)
│   ├── permissions/  角色与权限定义 (@match/permissions)
│   └── utils/        共享工具函数 (@match/utils)
├── prisma/           数据库 schema 与迁移
└── docs/             文档
```

## 技术栈

| 层级 | 技术 |
| ------ | ------ |
| 后端 | NestJS, Prisma, PostgreSQL |
| 管理后台 | TanStack Start, React 19, TanStack Query/Router/Table/Form |
| 小程序 | Taro 4, React 18, 微信小程序 |
| 共享 | TypeScript 5.7+, Zod, date-fns |
| 构建 | Turborepo, pnpm workspaces |
| 代码检查 | oxlint + oxc formatter |
| Git hooks | lefthook |

## 包依赖关系

```txt
api ──────────────────────────────┐
admin ──── @match/api-client ─────┤
miniapp ── @match/api-client ─────┤
          @match/types  ◄─────────┘ (所有应用)
          @match/schemas
          @match/permissions
          @match/utils
```

## 关键决策

- **API Client**: 通过 `@hey-api/openapi-ts` 从后端 OpenAPI spec 生成，作为 workspace 包共享
- **Prisma schema**: 放在仓库根目录 (`prisma/`)，以便 `api-client` 代码生成时引用
- **Taro 依赖提升**: 使用 `.npmrc` 的 `public-hoist-pattern` 替代 `shamefully-hoist`
- **Lint/Format**: oxlint + oxc（非 ESLint/Prettier），配置从根目录级联
