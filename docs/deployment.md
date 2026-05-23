# Docker + Jenkins 部署方案

## Context

将 monorepo 的 admin（TanStack Start SSR）和 api（NestJS）部署到传统云服务器。使用 Docker 容器化，Jenkins 监控 GitHub 推送自动构建。

## 整体架构

```txt
┌─────────────────────────────────────────────────────────┐
│                    云服务器                               │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Nginx     │    │   Jenkins   │    │  PostgreSQL │  │
│  │  (HTTPS)    │    │  (CI/CD)    │    │   (数据库)   │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │         │
│  ┌──────┴──────┐    ┌──────┴──────┐                  │
│  │   Admin     │    │    API      │                  │
│  │  (port 4000)│    │ (port 4001) │                  │
│  └─────────────┘    └─────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

## 前置条件

- 云服务器：Ubuntu 22.04+ / CentOS 8+
- 域名：已解析到服务器 IP
- GitHub：私有仓库，需配置 Personal Access Token

## 实现步骤

### 1. 创建 Dockerfile（多阶段构建）

#### apps/api/Dockerfile

```dockerfile
# 构建阶段
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile
COPY apps/api/ ./apps/api/
RUN cd apps/api && pnpm prisma generate && pnpm build

# 运行阶段
FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/generated ./generated
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./
RUN pnpm install --prod --frozen-lockfile
EXPOSE 4001
CMD ["node", "dist/main.js"]
```

#### apps/admin/Dockerfile

```dockerfile
# 构建阶段
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile
COPY apps/admin/ ./apps/admin/
RUN pnpm build:admin

# 运行阶段
FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=builder /app/apps/admin/dist ./dist
COPY --from=builder /app/apps/admin/package.json ./
RUN pnpm install --prod --frozen-lockfile
EXPOSE 4000
CMD ["node", "dist/server/server.js"]
```

### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: match_db
      POSTGRES_USER: match_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U match_user -d match_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DATABASE_URL: postgresql://match_user:${DB_PASSWORD}@postgres:5432/match_db
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-15m}
      JWT_REFRESH_EXPIRES_IN: ${JWT_REFRESH_EXPIRES_IN:-7d}
      PORT: 4001
      UPLOAD_DIR: /app/uploads
    volumes:
      - uploads:/app/uploads
    ports:
      - "4001:4001"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    environment:
      API_URL: http://111.228.29.123:4001
    ports:
      - "4000:4000"
    depends_on:
      - api
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - admin
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  uploads:
```

### 3. 创建 Nginx 反向代理配置（HTTPS）

#### nginx/nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream admin {
        server admin:4000;
    }

    upstream api {
        server api:4001;
    }

    # HTTP -> HTTPS 重定向
    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$host$request_uri;
    }

    # HTTPS 配置
    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL 证书（Let's Encrypt）
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # SSL 安全配置
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # API 路由
        location /api/ {
            proxy_pass http://api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Admin 前端
        location / {
            proxy_pass http://admin;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 4. 创建 Jenkinsfile

```groovy
pipeline {
    agent any

    environment {
        DOCKER_COMPOSE = 'docker-compose'
        DB_PASSWORD = credentials('match-db-password')
        JWT_SECRET = credentials('match-jwt-secret')
        GITHUB_TOKEN = credentials('github-personal-token')
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                // 私有仓库使用 Personal Access Token
                git branch: 'main',
                    url: "https://${GITHUB_TOKEN}@github.com/your-username/match.git",
                    credentialsId: 'github-personal-token'
            }
        }

        stage('Prisma Migrate') {
            steps {
                sh '''
                    cd apps/api
                    npx prisma migrate deploy
                '''
            }
        }

        stage('Build') {
            steps {
                sh '${DOCKER_COMPOSE} build'
            }
        }

        stage('Test') {
            steps {
                sh 'pnpm test'
            }
        }

        stage('Deploy') {
            steps {
                sh '${DOCKER_COMPOSE} up -d'
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
            sh '${DOCKER_COMPOSE} logs --tail=100'
        }
    }
}
```

### 5. 创建环境变量文件

#### .env.production

```bash
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## 文件清单

| 文件 | 用途 |
| ------ | ------ |
| `apps/api/Dockerfile` | API 镜像构建 |
| `apps/admin/Dockerfile` | Admin 镜像构建 |
| `docker-compose.yml` | 容器编排 |
| `nginx/nginx.conf` | 反向代理配置 |
| `Jenkinsfile` | CI/CD 流水线 |
| `.env.production` | 环境变量模板 |

## 部署流程

### 1. 服务器环境准备

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo apt install docker-compose-plugin

# 安装 Jenkins
docker run -d --name jenkins -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
```

### 2. SSL 证书申请（Let's Encrypt）

```bash
# 安装 certbot
sudo apt install certbot

# 申请证书（需先停止 Nginx）
sudo certbot certonly --standalone -d your-domain.com

# 证书位置
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem

# 复制到项目 nginx/ssl 目录
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/*.pem nginx/ssl/
```

### 3. GitHub Personal Access Token

1. 访问 GitHub Settings > Developer settings > Personal access tokens
2. 生成新 token，权限勾选 `repo`（完整仓库访问）
3. 复制 token 保存

### 4. Jenkins 配置

1. 访问 `http://server-ip:8080`，完成 Jenkins 初始化
2. 安装插件：GitHub Integration、Docker Pipeline
3. 添加凭据：
   - `github-personal-token`：GitHub Personal Access Token
   - `match-db-password`：数据库密码
   - `match-jwt-secret`：JWT 密钥
4. 创建 Pipeline 项目，配置 GitHub webhook URL：`http://server-ip:8080/github-webhook/`

### 5. 部署启动

```bash
# 克隆代码
git clone https://github.com/your-username/match.git
cd match

# 配置环境变量
cp .env.production.example .env.production
# 编辑 .env.production 填入实际值

# 启动服务
docker compose up -d

# 查看日志
docker compose logs -f
```

### 6. GitHub Webhook 配置

1. 进入仓库 Settings > Webhooks
2. 添加 webhook：
   - Payload URL：`http://server-ip:8080/github-webhook/`
   - Content type：`application/json`
   - Events：Just the push event

## 验证方式

1. 访问 `https://your-domain.com` 查看 admin 前端
2. 访问 `https://your-domain.com/api/health` 检查 API
3. 推送代码到 GitHub，观察 Jenkins 自动构建
4. 检查 `docker compose ps` 确认所有容器运行正常
