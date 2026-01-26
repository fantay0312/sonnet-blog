---
title: Zen Blog 快速开始指南
timestamp: 2025-01-26
description: 从零开始搭建你的禅意博客，包括环境准备、项目初始化和首次运行。
tags:
  - 教程
  - 入门
  - Astro
toc: true
---

## 简介

Zen Blog 是一个融合东方禅意美学与现代技术的博客系统，基于 Astro 5 构建，支持中英双语、多主题配色、全文搜索等功能。

## 环境要求

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js** 18.0 或更高版本
- **pnpm** 包管理器（推荐）
- **Git** 版本控制

### 安装 pnpm

如果尚未安装 pnpm，可以通过以下命令安装：

```bash
npm install -g pnpm
```

## 获取项目

### 方式一：克隆仓库

```bash
git clone https://github.com/your-username/zen-blog.git
cd zen-blog
```

### 方式二：使用模板

在 GitHub 上点击 "Use this template" 按钮创建自己的仓库。

## 安装依赖

进入项目目录后，安装所有依赖：

```bash
pnpm install
```

## 启动开发服务器

```bash
pnpm dev
```

默认情况下，开发服务器会在 `http://localhost:4321` 启动。打开浏览器访问该地址，即可预览你的博客。

## 项目结构

```
zen-blog/
├── src/
│   ├── components/     # 组件
│   ├── content/        # 内容目录
│   │   ├── note/       # 文记（长文章）
│   │   ├── jotting/    # 随笔（短内容）
│   │   ├── prologue/   # 序章（首页引言）
│   │   └── about/      # 关于页面
│   ├── i18n/           # 国际化翻译
│   ├── layouts/        # 页面布局
│   ├── pages/          # 路由页面
│   └── styles/         # 全局样式
├── public/             # 静态资源
├── site.config.ts      # 站点配置
└── package.json
```

## 基础配置

编辑 `site.config.ts` 文件，配置你的站点信息：

```typescript
export default {
  title: "你的博客名称",
  description: "博客描述",
  author: {
    name: "你的名字",
    email: "your@email.com",
    github: "your-github",
  },
  // ...更多配置
};
```

## 创建第一篇文章

在 `src/content/note/zh-cn/` 目录下创建一个 Markdown 文件：

```markdown
---
title: 我的第一篇文章
timestamp: 2025-01-26
description: 这是文章描述
tags:
  - 标签1
  - 标签2
toc: true
---

## 正文开始

在这里写你的文章内容...
```

## 构建与预览

### 构建生产版本

```bash
pnpm build
```

构建产物位于 `dist/` 目录。

### 本地预览构建结果

```bash
pnpm preview
```

## 下一步

- 阅读 [内容管理指南](/note/zen-blog-content) 学习如何组织内容
- 阅读 [配置详解](/note/zen-blog-config) 深入了解配置选项
- 阅读 [部署指南](/note/zen-blog-deploy) 将博客发布上线
