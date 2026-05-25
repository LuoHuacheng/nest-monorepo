# 服务器部署指南（GitHub Actions + PM2）

## 概述

使用 GitHub Actions + SSH 实现 push 到 main 分支后自动构建并部署到服务器。

**架构**：GitHub 构建 → rsync 部署 → PM2 运行 → Nginx 反向代理

## 服务器配置

- **规格**：2核2G，Ubuntu 22.04+
- **PostgreSQL**：端口 5432
- **Node.js**：v22

---

## 第一步：服务器环境配置

### 1.1 安装 PostgreSQL

```bash
sudo apt update && sudo apt install -y postgresql-16 postgresql-client-16
sudo systemctl start postgresql && sudo systemctl enable postgresql
```

### 1.2 PostgreSQL 低内存配置

编辑 `/etc/postgresql/16/main/postgresql.conf`：

```ini
shared_buffers = 64MB
work_mem = 4MB
maintenance_work_mem = 32MB
max_connections = 50
huge_pages = off
synchronous_commit = off
checkpoint_timeout = 10min
```

重启使配置生效：

```bash
sudo systemctl restart postgresql
```

### 1.3 创建数据库

```bash
sudo su - postgres
psql << 'EOF'
CREATE USER match_user WITH PASSWORD '12qwaszx';
CREATE DATABASE match_db OWNER match_user;
ALTER USER match_user CREATEDB;
\q
EOF
```

### 1.4 创建部署用户

```bash
sudo adduser deploy
echo "deploy ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/deploy
```

### 1.5 安装 PM2

```bash
sudo npm install -g pm2
```

### 1.6 安装 Nginx

```bash
sudo apt install -y nginx
```

### 1.7 创建项目目录

```bash
sudo mkdir -p /opt/match
sudo chown -R deploy:deploy /opt/match
```

---

## 第二步：SSH 密钥配置

### 2.1 服务器端（部署用户）

```bash
sudo su - deploy
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
```

### 2.2 GitHub Secrets

在仓库 Settings > Secrets and variables > Actions 中添加：

| Secret 名称 | 说明 | 示例 |
| ------------- | ------ | ------ |
| `SERVER_HOST` | 服务器 IP | `111.228.29.123` |
| `SERVER_USER` | SSH 用户名 | `deploy` |
| `SERVER_SSH_KEY` | 私钥内容 | `-----BEGIN...` |

---

## 第三步：首次手动部署

```bash
# SSH 登录服务器
ssh deploy@SERVER_HOST

# 初始化项目目录
cd /opt/match
git init
git remote add origin https://github.com/LuoHuacheng/match.git
git fetch origin main
git reset --hard origin/main

# 安装依赖
pnpm install --frozen-lockfile

# 创建环境变量
cat > /opt/match/.env << 'EOF'
DATABASE_URL=postgresql://match_user:12qwaszx@localhost:5432/match_db
JWT_SECRET=12qwaszx
JWT_EXPIRES_IN=2h
JWT_REFRESH_EXPIRES_IN=7d
PORT=4001
EOF

# 构建
pnpm build

# 启动服务
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 第四步：Nginx 配置

```bash
sudo nano /etc/nginx/conf.d/match.conf
```

内容：

```nginx
server {
    listen 80;
    server_name _;

    # Admin 静态文件
    root /opt/match/apps/admin/dist;
    index index.html;

    # Admin SPA 路由
    location /admin/ {
        try_files $uri $uri/ /admin/index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:4001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 根路径重定向
    location = / {
        return 302 /admin/;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

重载 Nginx：

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 第五步：验证部署

```bash
# 本地测试 API
curl http://SERVER_HOST/api/health

# 服务器查看 PM2 状态
pm2 status
pm2 logs
```

---

## 常用命令

```bash
# API 服务管理
pm2 list
pm2 logs match-api
pm2 restart match-api

# Nginx 管理
sudo nginx -t
sudo systemctl reload nginx
```

---

## 回滚方案

```bash
ssh deploy@SERVER_HOST
cd /opt/match

# 回滚代码
git reset --hard HEAD~1
git pull

# 重新构建
pnpm build
pm2 restart match-api
```

---

## 资源占用（2核2G）

| 服务 | 内存 | 说明 |
| ------ | ------ | ------ |
| PostgreSQL | ~80MB | 低内存配置 |
| match-api | ~120MB | NestJS |
| Nginx + 系统 | ~1.7GB | 剩余给系统 |

总计约 1.9GB，保留 100MB 缓冲区。
