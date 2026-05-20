# taro-react-starter

Taro + React 多端应用脚手架

## 技术栈

- **框架**: Taro 4.x + React 18
- **语言**: TypeScript
- **样式**: Tailwind CSS 4 + PostCSS
- **组件库**: NutUI React (Taro 版本)
- **状态管理**: Zustand
- **网络请求**: Axios
- **代码规范**: Oxlint + Oxfmt + Stylelint
- **包管理器**: pnpm

## 功能支持

支持多端编译：

- [x] 微信小程序 (weapp)
- [x] H5 (h5)
- [x] 支付宝小程序 (alipay)
- [x] QQ 小程序 (qq)
- [x] 字节跳动小程序 (tt)
- [x] 百度小程序 (swan)
- [x] 京东小程序 (jd)
- [x] React Native (rn)
- [x] 鸿蒙原生应用 (harmony-hybrid)

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 微信小程序
pnpm dev:weapp

# H5
pnpm dev:h5

# 支付宝小程序
pnpm dev:alipay

# QQ 小程序
pnpm dev:qq

# 字节跳动小程序
pnpm dev:tt

# 百度小程序
pnpm dev:swan

# 京东小程序
pnpm dev:jd

# React Native
pnpm dev:rn

# 鸿蒙原生应用
pnpm dev:harmony-hybrid
```

### 构建生产包

```bash
# 微信小程序
pnpm build:weapp

# H5
pnpm build:h5

# 支付宝小程序
pnpm build:alipay

# QQ 小程序
pnpm build:qq

# 字节跳动小程序
pnpm build:tt

# 百度小程序
pnpm build:swan

# 京东小程序
pnpm build:jd

# React Native
pnpm build:rn

# 鸿蒙原生应用
pnpm build:harmony-hybrid
```

### 代码规范

```bash
# 代码格式检查
pnpm format:check

# 自动格式化代码
pnpm format

# 代码检查
pnpm lint

# 自动修复代码问题
pnpm lint:fix
```

### 创建新页面

```bash
pnpm new
```

## 项目结构

```
src/
├── assets/           # 静态资源
│   ├── font/         # 字体文件
│   └── icon/         # 图标资源
├── components/      # 公共组件
├── config/           # 配置文件
├── lib/             # 工具库
│   ├── http/         # HTTP 请求封装
│   ├── cookies.ts    # Cookie 操作
│   ├── date.ts       # 日期处理
│   ├── is.ts         # 类型判断
│   ├── math.ts       # 数学运算
│   ├── number.ts     # 数字处理
│   ├── storage.ts    # 本地存储
│   └── utils.ts      # 通用工具
├── pages/           # 页面目录
│   ├── index/       # 首页
│   ├── match/       # 比赛页
│   ├── mine/        # 个人中心页
│   └── pacer/       # 跑步页
├── router/          # 路由配置
├── stores/          # 状态管理
├── styles/          # 全局样式
├── app.config.ts    # 应用配置
├── app.css          # 全局样式
└── app.tsx          # 根组件
```

## 浏览器支持

### 开发环境

- 支持 ES6 Module 的浏览器
- Node.js 维护版本

### 生产环境

- 最近 3 个版本
- Android >= 4.1
- iOS >= 8

## License

MIT
