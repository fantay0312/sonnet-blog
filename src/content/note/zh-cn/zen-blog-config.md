---
title: Zen Blog 配置详解
timestamp: 2025-01-26
description: 深入了解 Zen Blog 的配置选项，包括站点信息、主题配色、国际化和功能开关。
tags:
  - 教程
  - 配置
  - 自定义
toc: true
---

## 配置文件

Zen Blog 的核心配置位于 `site.config.ts` 文件中。

## 站点基础信息

```typescript
export default {
  // 站点标题
  title: "禅意博客",

  // 站点描述，用于 SEO
  description: "一个融合东方禅意与现代技术的博客",

  // 站点 URL
  url: "https://your-domain.com",

  // 作者信息
  author: {
    name: "你的名字",
    email: "your@email.com",
    github: "your-github",
    twitter: "your-twitter",
  },
};
```

## 国际化配置

Zen Blog 内置中英双语支持。

```typescript
i18n: {
  // 默认语言
  defaultLocale: "zh-cn",

  // 支持的语言列表
  locales: ["zh-cn", "en"],
},
```

### 语言文件

语言翻译文件位于 `src/i18n/` 目录：

```
src/i18n/
├── zh-cn/
│   └── index.yaml
├── en/
│   └── index.yaml
└── index.ts
```

### 添加新翻译

编辑对应语言的 YAML 文件：

```yaml
# src/i18n/zh-cn/index.yaml
navigation:
  home: 归墟
  note: 墨痕
  jotting: 浮生
  tags: 标签
  archive: 归档
```

## 主题配色

Zen Blog 支持多种预设配色方案。

### 可用配色

- **默认禅意**：青灰绿调
- **琥珀暖调**：暖金色系
- **靛蓝水墨**：蓝黑搭配
- **墨绿山水**：深绿意境

### 配色切换

用户可以通过页面右上角的配色切换按钮自由选择。选择会保存在浏览器本地存储中。

### 自定义配色

在 `src/styles/themes/` 目录下创建新的配色文件：

```css
/* src/styles/themes/custom.css */
:root[data-color="custom"] {
  --zen-accent: #your-color;
  --zen-accent-light: #your-light-color;
  --zen-accent-dark: #your-dark-color;
}
```

## 明暗模式

系统自动检测用户偏好，也支持手动切换。

```typescript
theme: {
  // 默认模式: "light" | "dark" | "system"
  defaultMode: "system",
},
```

### CSS 变量

主题使用 CSS 变量实现，便于自定义：

```css
:root {
  --zen-background: #faf9f7;
  --zen-foreground: #2d2d2d;
  --zen-muted: #f0ede8;
  --zen-border: #e5e2dd;
}

.dark {
  --zen-background: #0e0e0c;
  --zen-foreground: #e8e6e3;
  --zen-muted: #1a1a18;
  --zen-border: #2a2a28;
}
```

## 功能开关

可以启用或禁用各项功能：

```typescript
features: {
  // 搜索功能
  search: true,

  // RSS 订阅
  rss: true,

  // 评论系统
  comments: false,

  // 阅读时间估算
  readingTime: true,

  // 内容热力图
  heatmap: true,
},
```

## 导航配置

主导航链接在 `src/layouts/Header.astro` 中定义：

```typescript
const navLinks = [
  { name: t("navigation.home"), path: `${basePath}/` },
  { name: t("navigation.note"), path: `${basePath}/note` },
  { name: t("navigation.jotting"), path: `${basePath}/jotting` },
  { name: t("navigation.projects"), path: `${basePath}/projects` },
  { name: t("navigation.about"), path: `${basePath}/about` },
];
```

## SEO 配置

### 元数据

每个页面自动生成 SEO 元数据：

- `<title>` 标签
- `<meta description>`
- Open Graph 标签
- Twitter Card 标签

### Sitemap

构建时自动生成 `sitemap.xml`。

### Robots.txt

位于 `public/robots.txt`，可根据需要修改：

```
User-agent: *
Allow: /
Sitemap: https://your-domain.com/sitemap.xml
```

## 静态资源

### 图标

网站图标位于 `public/` 目录：

- `favicon.svg` - 主图标
- `favicon.ico` - 兼容图标

### 字体

Zen Blog 使用以下字体：

- **霞鹜文楷** - 中文正文
- **Ma Shan Zheng** - 书法装饰
- **Inter** - 英文正文

字体通过 CSS `@font-face` 加载，支持本地字体和在线字体。

## 分析与监控

### Umami Analytics

```typescript
analytics: {
  umami: {
    websiteId: "your-website-id",
    src: "https://analytics.your-domain.com/script.js",
  },
},
```

### Google Analytics

```typescript
analytics: {
  google: {
    measurementId: "G-XXXXXXXXXX",
  },
},
```

## 环境变量

敏感配置使用环境变量：

```bash
# .env
ADMIN_API_KEY=your-secret-key
```

在代码中使用：

```typescript
const apiKey = import.meta.env.ADMIN_API_KEY;
```

## 下一步

- 阅读 [部署指南](/note/zen-blog-deploy) 将博客发布上线
