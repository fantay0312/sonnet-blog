# Sonnet Blog

一个融合东方美学与现代技术的 Astro 博客，支持中英双语和管理后台。

## 特性

- **禅意设计** - 水墨风格，5 种配色主题（竹青/金箔/樱粉/碧海/藤紫）
- **双语支持** - 中文和英文
- **管理后台** - 可视化管理项目、技能、API Keys
- **API 上传** - 支持通过 API 发布文章（配合 Obsidian 插件）
- **内容热力图** - 展示发布频率
- **GitHub 集成** - 显示 GitHub 贡献热力图
- **全文搜索** - Pagefind 静态搜索
- **RSS 订阅** - Atom 格式

---

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

---

## 可配置项一览

| 配置项 | 文件位置 | 说明 |
|--------|----------|------|
| 站点基本信息 | `site.config.ts` | 标题、作者、描述、版权 |
| 首页序言 | `src/content/preface/{locale}/welcome.md` | 首页展示的引言 |
| 关于页面 | `src/content/information/{locale}/introduction.md` | 个人介绍 |
| 导航文案 | `src/i18n/{locale}/index.yaml` | 导航栏文字 |
| 项目列表 | 管理后台 `/fantay` → Projects | 可视化添加 |
| 技能展示 | 管理后台 `/fantay` → Skills | 可视化添加 |
| API Keys | 管理后台 `/fantay` → API Keys | 管理 API 密钥 |
| 配色方案 | `src/styles/global.css` | CSS 变量 |

---

## 配置详解

### 1. 站点基本信息

编辑 `site.config.ts`：

```typescript
const config: SiteConfig = {
  title: "Sonnet",                    // 站点标题
  prologue: "北海虽赊...",            // 首页副标题（支持 \n 换行）

  author: {
    name: "Fantasy",                  // 作者名
    email: "hi@your.mail",            // 邮箱（可选）
    link: "https://your.website",     // 个人网站（可选）
  },

  description: "诗意栖居，代码织梦",   // SEO 描述

  copyright: {
    type: "CC BY-NC-ND 4.0",          // 许可证
    year: "2026",                     // 年份（显示在页脚）
  },

  i18n: {
    locales: ["zh-cn", "en"],         // 支持的语言
    defaultLocale: "zh-cn",           // 默认语言
  },

  pagination: {
    note: 15,                         // 文记每页数量
    jotting: 24,                      // 随笔每页数量
  },

  github: {
    enabled: true,                    // 是否显示 GitHub 热力图
    username: "your-username",        // GitHub 用户名
    tooltipEnabled: true,             // 悬停显示详情
  },

  skills: {
    enabled: true,                    // 是否显示技能栏
    // 技能数据通过管理后台配置
  },
};
```

### 2. 首页序言

编辑 `src/content/preface/zh-cn/welcome.md`：

```markdown
---
timestamp: 2025-01-24
---

欢迎来到 Sonnet。

诗意栖居，代码织梦。

> 北海虽赊，扶摇可接；东隅已逝，桑榆非晚。
```

### 3. 关于页面

编辑 `src/content/information/zh-cn/introduction.md`：

```markdown
---
---

# 关于我

我是一名热爱技术与设计的开发者。

## 联系方式

- Email: hi@your.mail
- Website: https://your.website
```

### 4. 导航文案

编辑 `src/i18n/zh-cn/index.yaml`：

```yaml
navigation:
  home: 归墟          # 首页
  note: 墨痕          # 长篇文章
  jotting: 浮生       # 短篇随笔
  projects: 造物      # 项目
  photos: 拾光        # 相册
  about: 云深         # 关于
```

---

## 管理后台

访问 `/fantay` 进入管理后台。

### 首次登录

1. 访问 `/fantay`
2. 首次访问会要求设置管理员账号密码
3. 设置完成后登录

### 功能模块

| 模块 | 说明 |
|------|------|
| API Keys | 管理 API 密钥，用于 Obsidian 插件等外部工具上传文章 |
| Skills | 管理首页技能展示栏 |
| Projects | 管理项目展示页面 |
| Photos | 管理相册（待完善） |

### 添加技能

1. 进入 Skills 标签
2. 选择滚动方向（左/右）
3. 输入技能名称和图标
4. 图标格式：`icon-[图标集--图标名]`，如 `icon-[mdi--react]`
5. 图标查询：[Iconify](https://icon-sets.iconify.design/)

### 添加项目

1. 进入 Projects 标签
2. 点击 "Add New Project"
3. 填写项目信息（名称、描述、GitHub 地址、网站）

---

## 内容管理

### 目录结构

```
src/content/
├── note/                 # 文记（长篇文章）
│   ├── zh-cn/
│   │   └── 文章.md
│   └── en/
├── jotting/              # 随笔（短篇）
│   ├── zh-cn/
│   └── en/
├── preface/              # 首页序言
│   ├── zh-cn/
│   │   └── welcome.md
│   └── en/
└── information/          # 关于页面
    ├── zh-cn/
    │   └── introduction.md
    └── en/
```

### 文记（Note）格式

```markdown
---
title: "文章标题"
timestamp: 2026-01-26T09:00:00.000Z
draft: false
tags:
  - "标签1"
  - "标签2"
toc: true                 # 显示目录
top: 0                    # 置顶优先级（数字越大越靠前）
---

正文内容...
```

### 随笔（Jotting）格式

```markdown
---
title: "随笔标题"
timestamp: 2026-01-26T09:00:00.000Z
draft: false
mood: "思考"              # 可选：心情标签
---

随笔内容...
```

### 支持的 Markdown 语法

- **加粗**：`**文本**`
- *斜体*：`*文本*`
- ~~删除线~~：`~~文本~~`
- ==高亮==：`==文本==`
- `行内代码`：`` `代码` ``
- 代码块、表格、任务列表、数学公式（KaTeX）

---

## API 上传

### 验证 API Key

```bash
curl -H "Authorization: Bearer sonnet_sk_xxx" \
  http://localhost:4321/api/auth/verify
```

### 上传文记

```bash
curl -X POST \
  -H "Authorization: Bearer sonnet_sk_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "文章标题",
    "content": "Markdown 内容",
    "tags": ["标签1"],
    "draft": false,
    "locale": "zh-cn"
  }' \
  http://localhost:4321/api/upload/note
```

### 上传随笔

```bash
curl -X POST \
  -H "Authorization: Bearer sonnet_sk_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "随笔内容",
    "title": "可选标题",
    "mood": "思考",
    "draft": false,
    "locale": "zh-cn"
  }' \
  http://localhost:4321/api/upload/jotting
```

---

## 数据存储

| 数据 | 文件位置 | 说明 |
|------|----------|------|
| 管理员账号 | `data/admin.json` | 密码已哈希存储 |
| API Keys | `data/api-keys.json` | 密钥已哈希存储 |
| 项目列表 | `data/projects.json` | 通过管理后台管理 |
| 技能列表 | `data/skills.json` | 通过管理后台管理 |

**注意**：`data/` 目录包含敏感数据，不建议提交到公开仓库。

---

## 配色自定义

编辑 `src/styles/global.css`，修改 CSS 变量：

```css
/* 浅色模式 */
:root {
  --zen-background: #fdfbf7;      /* 背景色 */
  --zen-foreground: #2c2c2a;      /* 文字色 */
  --zen-accent: #7b9e87;          /* 强调色（竹青） */
  --zen-muted: #f5f3ef;           /* 弱化背景 */
  --zen-border: #e8e4dc;          /* 边框色 */
}

/* 深色模式 */
.dark {
  --zen-background: #0e0e0c;
  --zen-foreground: #e8e4dc;
  --zen-accent: #c4a962;          /* 强调色（金箔） */
  --zen-muted: #1a1a18;
  --zen-border: #2a2a28;
}
```

### 可选配色主题

用户可在页面右上角切换配色：

| 主题 | 浅色 | 深色 |
|------|------|------|
| 竹青 | `#7B9E87` | `#5A7A63` |
| 金箔 | `#C4A962` | `#D4B972` |
| 樱粉 | `#E8A0A0` | `#D48A8A` |
| 碧海 | `#6B9DAD` | `#5A8A9A` |
| 藤紫 | `#9B8AA6` | `#8A7A96` |

---

## 部署

### Vercel（推荐）

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 框架选择 Astro
4. 部署

### 自托管

```bash
npm run build
# 使用 Node.js 运行
node dist/server/entry.mjs
```

---

## 技术栈

- [Astro 5](https://astro.build) - 全栈框架
- [React 19](https://react.dev) - 交互组件
- [Tailwind CSS 4](https://tailwindcss.com) - 样式
- [Pagefind](https://pagefind.app) - 静态搜索

---

## 许可证

MIT License
