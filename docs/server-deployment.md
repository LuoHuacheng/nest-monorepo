# 服务器部署指南（GitHub Actions + PM2 原生部署）

## 概述

使用 GitHub Actions + SSH 实现 push 到 main 分支后自动构建并部署到服务器。
**不使用 Docker**，直接用 PM2 管理 Node.js 进程，节省资源。

## 前置条件

- 服务器：京东云 2核2G，Ubuntu 22.04+
- PostgreSQL 16 已安装
- GitHub 仓库已配置

---

## 第一步：服务器环境配置

### 1.1 安装 PostgreSQL

```bash
# 安装 PostgreSQL
sudo apt update
sudo apt install -y postgresql-16 postgresql-client-16

# 启动并设置开机自启
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 1.2 创建数据库用户

```bash
sudo su - postgres

# 创建用户和数据库
psql << 'EOF'
CREATE USER match_user WITH PASSWORD 'E9LRT6eWR2b2w7PKTDoc8rYL';
CREATE DATABASE match_db OWNER match_user;
ALTER USER match_user CREATEDB;
\q
EOF

exit
```

### 1.3 创建部署用户

```bash
# 创建用户
sudo adduser deploy

# 配置 sudo 免密
echo "deploy ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/deploy
```

### 1.4 安装 PM2

```bash
sudo npm install -g pm2
```

---

## 第二步：SSH 密钥配置

### 2.1 服务器端

以 deploy 用户身份生成 SSH 密钥：

```bash
sudo su - deploy
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
```

### 2.2 GitHub 端

- 查看服务器公钥：

```bash
cat ~/.ssh/id_ed25519.pub
```

- 在 GitHub 仓库 Settings > Secrets and variables > Actions 中添加：

  - `SERVER_HOST`: 服务器 IP 地址（如 `111.228.29.123`）
  - `SERVER_USER`: `deploy`
  - `SERVER_SSH_KEY`: 服务器私钥内容（`~/.ssh/id_ed25519` 的内容）

---

## 第三步：创建项目目录

```bash
sudo mkdir -p /opt/match
sudo chown -R deploy:deploy /opt/match
```

---

## 第四步：环境变量配置

在服务器创建 `/opt/match/.env` 文件：

```bash
sudo su - deploy
nano /opt/match/.env
```

内容参考 `apps/api/.env.production`：

```bash
# 数据库
DB_PASSWORD=your_secure_password
DATABASE_URL=postgresql://match_user:your_secure_password@localhost:5432/match_db

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# API
PORT=4001
UPLOAD_DIR=/opt/match/uploads

# Admin
API_URL=http://111.228.29.123:4001
```

创建 uploads 目录：

```bash
mkdir -p /opt/match/uploads
```

---

## 第五步：首次手动部署（验证用）

```bash
# SSH 登录服务器
ssh deploy@111.228.29.123

# 手动拉取代码（首次）
cd /opt/match
git clone https://github.com/LuoHuacheng/match.git .
git checkout main

# 安装依赖
pnpm install --frozen-lockfile

# 构建
pnpm build

# 运行数据库迁移
pnpm prisma migrate deploy

# 启动服务
pm2 start ecosystem.config.js
pm2 save

# 设置开机自启
pm2 startup
```

---

## 第六步：PM2 管理命令

```bash
# 查看进程状态
pm2 list

# 查看日志
pm2 logs

# 重启服务
pm2 restart all

# 停止服务
pm2 stop all

# 删除所有进程
pm2 delete all
```

---

## 第七步：Nginx 配置

创建 `/etc/nginx/conf.d/match.conf`：

```nginx
upstream match_api {
    server 127.0.0.1:4001;
}

upstream match_admin {
    server 127.0.0.1:4000;
}

server {
    listen 80;
    server_name 111.228.29.123;

    # API 路由 - /api/* -> localhost:4001/api/*
    location /api/ {
        proxy_pass http://match_api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin 前端 - /admin/* -> localhost:4000/admin/*
    location /admin/ {
        proxy_pass http://match_admin/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 健康检查 - /health -> api
    location /health {
        proxy_pass http://match_api/health;
        proxy_set_header Host $host;
    }
}
```

重载 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 第八步：验证

### 8.1 本地验证

```bash
# 本地构建测试
pnpm build

# 启动服务
pm2 start ecosystem.config.js

# 测试 API
curl http://localhost:4001/health

# 测试 Admin
curl http://localhost:4000/ | head -c 100
```

### 8.2 GitHub Actions 触发

推送代码到 main 分支后，GitHub Actions 会自动：

1. 安装依赖（使用 npmmirror 镜像）
2. 构建项目
3. 复制文件到服务器
4. 运行 Prisma Migrate
5. 重启 PM2 服务

查看 Actions 日志：`https://github.com/LuoHuacheng/match/actions`

---

## 回滚方案

如果部署失败：

```bash
# SSH 登录服务器
ssh deploy@111.228.29.123
cd /opt/match

# 查看 git 历史，找到上一个稳定版本
git log --oneline -10

# 回滚到上一个版本
git reset --hard HEAD~1
git pull

# 重新构建和部署
pnpm build
pm2 restart all
```

或者使用 PM2 的历史版本：

```bash
# 查看所有版本
pm2 list

# 回滚到某个版本
pm2 delete all
git reset --hard <commit-hash>
pnpm build
pm2 start ecosystem.config.js
```

---

## 资源配置（2核2G）

| 服务 | 内存限制 | 说明 |
| ------ | --------- | ------ |
| PostgreSQL | 256MB | 数据库 |
| match-api (NestJS) | 400MB | 处理 API 请求 |
| match-admin (SSR) | 200MB | 前台管理界面 |
| 系统+Nginx+其他 | ~1.1GB | 剩余给系统 |

总内存需求：~1.9GB，留有余量给系统。

---

## 注意事项

1. **防火墙**：确保 80 端口已开放
2. **安全组**（京东云）：在云控制台开放 80 端口入站规则
3. **数据安全**：`.env` 文件包含敏感信息，不要提交到 GitHub
4. **GitHub Secrets**：`SERVER_SSH_KEY` 是私钥，不要泄露
5. **PM2 开机自启**：首次部署后执行 `pm2 startup` 确保服务器重启后自动启动
