---
title: Zen Blog 部署指南
timestamp: 2025-01-26
description: 将 Zen Blog 部署到各种平台，包括 Vercel、Netlify、Cloudflare Pages 和传统服务器。
tags:
  - 教程
  - 部署
  - DevOps
toc: true
---

## 构建项目

在部署之前，先在本地构建并测试：

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 本地预览
pnpm preview
```

确认一切正常后，再进行部署。

## Vercel 部署

Vercel 是部署 Astro 项目的首选平台，配置简单且性能优异。

### 步骤

1. 将代码推送到 GitHub
2. 访问 [Vercel](https://vercel.com) 并登录
3. 点击 "New Project"
4. 导入你的 GitHub 仓库
5. Vercel 会自动检测 Astro 项目
6. 点击 "Deploy"

### 配置

Vercel 会自动识别 Astro 项目，无需额外配置。如需自定义，可在项目根目录创建 `vercel.json`：

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "astro"
}
```

### 环境变量

在 Vercel 控制台的 Settings > Environment Variables 中添加：

- `ADMIN_API_KEY` - 管理后台 API 密钥

## Netlify 部署

Netlify 同样提供优秀的静态站点托管服务。

### 步骤

1. 将代码推送到 GitHub
2. 访问 [Netlify](https://netlify.com) 并登录
3. 点击 "New site from Git"
4. 选择你的仓库
5. 配置构建命令

### 构建配置

```toml
# netlify.toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

## Cloudflare Pages 部署

Cloudflare Pages 提供全球 CDN 和免费的 SSL。

### 步骤

1. 访问 [Cloudflare Pages](https://pages.cloudflare.com)
2. 连接 GitHub 仓库
3. 设置构建配置：
   - 构建命令：`pnpm build`
   - 输出目录：`dist`
4. 部署

### 注意事项

Cloudflare Pages 使用自己的 Node.js 运行时，确保兼容性：

```toml
# wrangler.toml
compatibility_date = "2024-01-01"
node_compat = true
```

## GitHub Pages 部署

适合个人博客，完全免费。

### 配置 Astro

修改 `astro.config.mjs`：

```javascript
export default defineConfig({
  site: 'https://username.github.io',
  base: '/repo-name',  // 如果不是 username.github.io
});
```

### GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### 启用 Pages

在仓库 Settings > Pages 中：
- Source: GitHub Actions

## 传统服务器部署

如果使用 VPS 或云服务器。

### 使用 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/zen-blog/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /404.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 部署脚本

```bash
#!/bin/bash
# deploy.sh

cd /var/www/zen-blog
git pull origin main
pnpm install
pnpm build

# 可选：重载 Nginx
sudo systemctl reload nginx
```

## Docker 部署

使用 Docker 容器化部署。

### Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  zen-blog:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

## 域名配置

### 添加自定义域名

各平台添加自定义域名的方式类似：

1. 在平台控制台添加域名
2. 配置 DNS 记录

### DNS 配置

```
# A 记录（指向 IP）
A     @     76.76.21.21

# CNAME 记录（指向平台域名）
CNAME www   your-project.vercel.app
```

### SSL 证书

大多数平台自动提供免费的 SSL 证书。如果自托管，可使用 Let's Encrypt：

```bash
sudo certbot --nginx -d your-domain.com
```

## 部署检查清单

部署前确认以下事项：

- [ ] 所有内容无草稿标记
- [ ] 配置文件中的 URL 正确
- [ ] 环境变量已设置
- [ ] 本地构建成功
- [ ] 本地预览正常
- [ ] SEO 元数据完整
- [ ] 图片已优化
- [ ] 404 页面正常

## 持续部署

配置自动部署，每次推送代码后自动更新：

1. 连接 Git 仓库到部署平台
2. 设置触发分支（通常是 `main`）
3. 推送代码即自动部署

## 监控与维护

### 性能监控

- 使用 [PageSpeed Insights](https://pagespeed.web.dev/) 检测性能
- 使用 [Lighthouse](https://developer.chrome.com/docs/lighthouse/) 进行全面审计

### 日志查看

各平台的日志位置：
- Vercel: Functions > Logs
- Netlify: Site > Deploys > Deploy log
- Cloudflare: Workers & Pages > Logs

### 定期维护

- 更新依赖：`pnpm update`
- 检查构建警告
- 清理未使用的资源
