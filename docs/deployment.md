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

## 传统云服务器部署（NestJS API）

### 1. 服务器环境准备

```bash
# 安装 Node.js 22+
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PM2（进程管理）
npm install -g pm2
```

### 2. 部署步骤

```bash
# 1. 克隆代码
git clone <your-repo-url> /var/www/match
cd /var/www/match

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp apps/api/.env.example apps/api/.env
# 编辑 .env，配置 DATABASE_URL、JWT_SECRET 等

# 4. 生成 Prisma Client
pnpm prisma:generate

# 5. 运行数据库迁移
pnpm prisma:migrate

# 6. 构建项目
pnpm build:api

# 7. 使用 PM2 启动
pm2 start apps/api/dist/main.js --name "match-api"
```

### 3. PM2 配置（推荐）

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'match-api',
    script: 'apps/api/dist/main.js',
    cwd: '/var/www/match',
    instances: 'max',  // 或固定数量如 4
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4001
    },
    max_memory_restart: '1G',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/var/log/match/api-error.log',
    out_file: '/var/log/match/api-out.log',
  }]
};
```

启动：`pm2 start ecosystem.config.js`

### 4. Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 文件上传大小限制
        client_max_body_size 50M;
    }

    # Swagger 文档
    location /docs {
        proxy_pass http://127.0.0.1:4001;
    }
}
```

### 5. SSL 证书（推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

### 6. 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs match-api

# 重启应用
pm2 restart match-api

# 停止应用
pm2 stop match-api

# 监控
pm2 monit
```

### 7. 自动部署脚本（可选）

创建 `deploy.sh`：

```bash
#!/bin/bash
cd /var/www/match
git pull
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm build:api
pm2 restart match-api
echo "Deploy completed!"
```

### 8. 关键注意事项

1. **数据库**：确保 PostgreSQL 可从服务器访问
2. **环境变量**：生产环境使用强密码的 JWT_SECRET
3. **端口**：确保防火墙开放 80/443 端口
4. **日志**：配置日志轮转避免磁盘占满
5. **备份**：定期备份数据库

## 小程序部署

微信小程序通过微信开发者工具部署：

1. 构建：`pnpm build:miniapp`
2. 通过微信开发者工具上传
3. 在微信公众平台提交审核
