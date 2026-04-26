# Onia Website — 个人网站

<p align="center">
  一个功能完整、高度可定制的个人作品集网站
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#目录结构">目录结构</a> •
  <a href="#生产部署">生产部署</a> •
  <a href="#后台功能导览">后台管理</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white" alt="Next.js 14">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
</p>

---

## 功能特性

- 🌙☀️ **Night / Day 双主题** — 访客可自由切换，颜色和字体支持后台实时编辑
- 🎨 **玻璃拟态 UI** — 现代化的 Glassmorphism 设计风格
- 🛡️ **首次启动引导** — 自动检测初始化状态，引导设置管理员账户
- 🎛️ **全功能后台面板** — 主题、布局、内容、功能开关、资源管理一站式管理
- ⚡ **SSE 实时同步** — 管理员保存配置后，全站访客无刷新即时更新
- 🚫 **安全防护** — 支持路由级右键/DevTools 禁用配置，管理员路径自动豁免
- 🌐 **中英双语支持** — 轻量级 i18n 实现，Markdown 内容支持双语后缀
- 📝 **Markdown 内容管理** — 项目、页面内容使用 Markdown 格式存储
- 🔒 **JWT 认证** — HttpOnly Cookie 存储，登录限速防暴力破解
- 💾 **自动备份** — 配置自动备份，保留最近 10 份历史版本

---

## 技术栈

| 层级 | 技术选型 |
|------|----------|
| 前端框架 | Next.js 14 (App Router) + React 18 |
| 开发语言 | TypeScript 5 |
| 样式方案 | Tailwind CSS + CSS Variables |
| 动画库 | Framer Motion |
| 状态管理 | Zustand |
| UI 组件 | shadcn/ui (深度定制) |
| 认证方案 | JWT + bcryptjs |
| 实时同步 | Server-Sent Events (SSE) |
| 内容管理 | Markdown + gray-matter |
| 数据验证 | Zod |

---

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`，系统将自动检测初始化状态并跳转到 `/setup` 引导页。

### 完成初始化

在初始化页面填写以下信息：

| 配置项 | 说明 |
|--------|------|
| 网站名称 | 中文和英文两个版本 |
| 管理员账户 | 用户名和密码（密码至少 8 位） |
| 默认主题 | Night（深色）或 Day（浅色） |

初始化完成后，系统自动跳转到 `/login` 登录页面。

### 进入后台管理

使用初始化时设置的账户登录后，即可进入 `/admin` 管理面板进行全站配置。

---

## 目录结构

```
OniaWebsite/
├── config.json              # 管理员凭证与服务器配置（自动生成，勿入 Git）
├── config.example.json      # 配置示例文件
├── .setup.lock              # 初始化锁文件（标识已完成初始化）
├── data/                    # 所有持久化数据
│   ├── site-config.json     # 站点可编辑配置（主题、布局、内容等）
│   ├── backups/             # 自动备份文件
│   ├── content/
│   │   ├── projects/        # 项目 Markdown 文件
│   │   └── pages/           # 页面 Markdown 文件
│   ├── i18n/                # 界面词条语言包
│   │   ├── zh-CN.json       # 中文词条
│   │   └── en-US.json       # 英文词条
│   └── uploads/             # 上传的图片及字体文件
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (site)/          # 前台主站页面
│   │   ├── admin/           # 后台管理页面
│   │   ├── api/             # REST API 接口
│   │   ├── login/           # 登录页面
│   │   └── setup/           # 初始化引导页面
│   ├── components/          # React 组件
│   │   ├── ui/              # UI 基础组件
│   │   ├── site/            # 站点业务组件
│   │   └── admin/           # 后台管理组件
│   ├── lib/                 # 服务端工具库
│   ├── hooks/               # 客户端 Hooks
│   ├── store/               # Zustand 状态管理
│   └── styles/              # CSS 变量与主题定义
├── public/                  # 静态资源
├── scripts/
│   └── backup.mjs           # 备份脚本
├── docker-compose.yml       # Docker 编排配置
├── ecosystem.config.js      # PM2 进程管理配置
└── package.json
```

---

## 生产部署

### 方式一：直接运行

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

### 方式二：PM2 进程管理（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 使用配置文件启动
pm2 start ecosystem.config.js

# 保存配置
pm2 save

# 设置开机自启
pm2 startup
```

### 方式三：Docker 部署

```bash
# 先在本地完成初始化（生成 config.json 和 .setup.lock）
npm run dev

# 然后启动 Docker
docker compose up -d
```

### Nginx 反向代理配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 备份与恢复

```bash
# 手动备份（备份 data/ 目录和 config.json）
npm run backup

# 备份文件存储在 ./backups/ 目录
# 自动保留最近 5 份备份
```

---

## 安全说明

| 安全项 | 实现方式 |
|--------|----------|
| 配置文件 | `config.json` 已加入 `.gitignore`，含密码哈希和 JWT 密钥 |
| 密码存储 | bcrypt (cost=12) 哈希算法 |
| 认证令牌 | JWT 存储在 HttpOnly Cookie，防止 XSS 攻击 |
| 登录防护 | 同 IP 5 次失败登录后锁定 15 分钟 |
| 配置写入 | 所有写入 API 强制 JWT 鉴权 + Zod 格式验证 |
| 原子写入 | 配置文件使用原子写入，防止并发损坏 |

> ⚠️ 注意：右键/DevTools 禁用仅为体验层保护，无法阻止专业用户查看源代码。

---

## 后台功能导览

| 模块 | 路径 | 功能描述 |
|------|------|----------|
| 仪表盘 | `/admin` | 站点统计概览和快速入口 |
| 主题编辑 | `/admin/theme` | Night/Day 配色方案、字体设置、玻璃效果调整 |
| 布局管理 | `/admin/layout-editor` | 导航栏、页脚配置、首页区块拖拽排序 |
| 内容管理 | `/admin/content` | Hero、关于、技能、联系方式、项目内容编辑 |
| 功能开关 | `/admin/features` | 右键禁用、DevTools 检测、动画效果等开关 |
| 资源管理 | `/admin/assets` | 图片/字体文件上传与管理 |
| 安全设置 | `/admin/security` | 修改管理员密码、查看登录日志 |

---

## 开发计划

- [x] 基础框架搭建与初始化流程
- [x] JWT 认证与权限管理
- [x] Night/Day 主题切换
- [x] 玻璃拟态 UI 组件
- [x] SSE 实时配置同步
- [x] 后台管理面板
- [x] Markdown 内容管理
- [x] 多语言支持
- [x] 配置备份机制
- [x] Docker 支持
- [ ] 更多主题预设
- [ ] 插件扩展系统
- [ ] 数据分析统计

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

---

## 许可证

[MIT](LICENSE) © 2026 Onia

---

<p align="center">
  <sub>Built with ❤️ by Onia</sub>
</p>

tips: 该仓库可能不会再进行功能更新.