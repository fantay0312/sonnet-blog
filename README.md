# 禅意博客 (Zen Blog)

一个融合东方美学与现代技术的 Astro 博客主题，支持中英双语。

## 特点

- 🎨 **禅意设计** - 米白/竹青（浅色）、墨黑/金色（深色）配色方案
- 🌏 **双语支持** - 中文和英文完整支持
- 🌓 **明暗模式** - 三态切换（浅色/深色/跟随系统）
- 🔍 **全文搜索** - Pagefind 静态搜索（构建后可用）
- 📡 **RSS 订阅** - Atom 1.0 格式
- 📊 **Spotlight** - GitHub 贡献热力图（实时从 GitHub API 获取，每天动态变化）
- 💼 **Skills** - 可自定义的技能展示滚动条
- 📝 **内容分类** - 序章、文记、随笔、絮述

---

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## 配置指南

### 1. 基本信息配置

编辑 `site.config.ts` 文件：

```typescript
const config: SiteConfig = {
  // 站点标题（显示在页头和浏览器标签）
  title: "禅意博客",

  // 首页序言（支持换行符 \n）
  prologue: "行到水穷处\n坐看云起时",

  // 作者信息
  author: {
    name: "Your Name",        // 你的名字
    email: "hi@your.mail",    // 邮箱（可选）
    link: "https://your.website",  // 个人网站（可选）
  },

  // 站点描述（用于 SEO）
  description: "一个融合禅意美学的现代博客",

  // 版权信息
  copyright: {
    type: "CC BY-NC-ND 4.0",  // 许可证类型
    year: "2025",             // 年份
  },

  // ...
};
```

### 2. 语言配置

```typescript
i18n: {
  locales: ["zh-cn", "en"],   // 支持的语言
  defaultLocale: "zh-cn",     // 默认语言
},
```

- 默认语言的页面路径不带前缀：`/note/hello-world`
- 其他语言带前缀：`/en/note/hello-world`

### 3. Spotlight（GitHub 贡献热力图）配置

```typescript
github: {
  enabled: true,              // 是否启用
  username: "your-username",  // 你的 GitHub 用户名
  tooltipEnabled: true,       // 鼠标悬停时显示详情
},
```

**说明**：Spotlight 会自动从 GitHub API 获取你最近一年的贡献数据，每次访问页面时实时更新。颜色深浅代表贡献数量。

### 4. Skills（技能展示）配置

```typescript
skills: {
  enabled: true,    // 是否启用
  data: [
    {
      direction: "left",    // 滚动方向：left 或 right
      skills: [
        {
          name: "JavaScript",                           // 技能名称
          icon: "icon-[mdi--language-javascript]",      // 图标
          url: "https://developer.mozilla.org/..."      // 链接（可选）
        },
        { name: "TypeScript", icon: "icon-[mdi--language-typescript]" },
        { name: "React", icon: "icon-[mdi--react]" },
        // ... 添加更多技能
      ],
    },
    {
      direction: "right",   // 第二行向右滚动
      skills: [
        { name: "Node.js", icon: "icon-[mdi--nodejs]" },
        { name: "Tailwind CSS", icon: "icon-[mdi--tailwind]" },
        // ... 添加更多技能
      ],
    },
    // 可以添加更多行...
  ],
},
```

**添加新技能**：
1. 在 `skills.data` 数组中找到对应的行
2. 添加新的技能对象 `{ name: "技能名", icon: "图标类名" }`
3. 图标可以在 [Iconify](https://icon-sets.iconify.design/) 查找

**图标格式**：icon-[图标集--图标名]
- 例如：mdi 图标集的 react 图标写作 `icon-[mdi--react]`
- 例如：lucide 图标集的 code 图标写作 `icon-[lucide--code]`

---

## 内容管理

### 目录结构

```
src/content/
├── preface/              # 序章（首页展示）
│   ├── zh-cn/
│   │   └── welcome.md
│   └── en/
│       └── welcome.md
├── note/                 # 文记（长篇文章）
│   ├── zh-cn/
│   │   └── hello-world.md
│   └── en/
│       └── hello-world.md
├── jotting/              # 随笔（短篇内容）
│   ├── zh-cn/
│   │   └── first-thought.md
│   └── en/
│       └── first-thought.md
├── information/          # 絮述（关于页面）
│   ├── zh-cn/
│   │   └── introduction.md
│   └── en/
│       └── introduction.md
└── projects/             # 项目展示
    └── zen-blog.yaml
```

### 文记（Note）格式

```markdown
---
title: 文章标题
timestamp: 2025-01-24          # 发布日期
description: 文章描述（可选）   # 显示在列表和 SEO
tags:                          # 标签（可选）
  - 标签1
  - 标签2
series: 系列名称               # 系列（可选）
toc: true                      # 是否显示目录（默认 true）
top: 0                         # 置顶优先级（数字越大越靠前）
draft: false                   # 是否为草稿
sensitive: false               # 敏感内容警告
---

文章正文...
```

### 随笔（Jotting）格式

```markdown
---
title: 随笔标题
timestamp: 2025-01-24
description: 简短描述（可选）
tags:
  - 随想
top: 0
draft: false
---

随笔内容...
```

### 序章（Preface）格式

```markdown
---
timestamp: 2025-01-24
---

首页展示的引言内容...
```

### 絮述/关于（Information）

编辑 `src/content/information/zh-cn/introduction.md`：

```markdown
---
---

# 关于我

这里写你的自我介绍...

## 联系方式

- Email: your@email.com
- GitHub: https://github.com/your-username
```

### 项目（Projects）格式

创建 `src/content/projects/项目名.yaml`：

```yaml
name: 项目名称
description: 项目描述
githubUrl: https://github.com/user/repo    # GitHub 地址（可选）
website: https://project-site.com          # 项目网站（可选）
icon: icon-[lucide--code]                  # 图标
star: 100                                  # Star 数（可选）
fork: 20                                   # Fork 数（可选）
draft: false                               # 是否为草稿
```

---

## 导航结构

导航栏顺序（从左到右）：
1. **序章** - 首页
2. **文记** - 长篇文章
3. **随笔** - 短篇内容
4. **项目** - 项目展示
5. **相册** - 照片展示
6. **絮述** - 关于页面（最右边）

如需修改顺序，编辑 `src/layouts/Header.astro` 中的 `navLinks` 数组。

---

## 翻译自定义

编辑 `src/i18n/zh-cn/index.yaml` 或 `src/i18n/en/index.yaml`：

```yaml
navigation:
  home: 序章        # 首页
  note: 文记        # 长篇文章
  jotting: 随笔     # 短篇内容
  about: 絮述       # 关于
  projects: 项目    # 项目
  photos: 相册      # 相册
```

---

## 配色方案

### 浅色模式
| 用途 | 颜色 | 色值 |
|------|------|------|
| 背景 | 米白/和纸 | `#FDFBF7` |
| 文字 | 墨色 | `#2C2C2A` |
| 强调 | 竹青 | `#7B9E87` |
| 弱化 | 枯山水砂 | `#E8E4DC` |

### 深色模式
| 用途 | 颜色 | 色值 |
|------|------|------|
| 背景 | 墨黑 | `#0E0E0C` |
| 文字 | 枯叶白 | `#E8E4DC` |
| 强调 | 金箔 | `#C4A962` |
| 弱化 | 暗色 | `#1E1E1C` |

如需自定义配色，编辑 `src/styles/global.css` 中的 CSS 变量。

---

## 部署

### Vercel（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 框架选择 Astro
4. 点击部署

### Netlify

1. 将代码推送到 GitHub
2. 在 Netlify 中导入项目
3. 构建命令：`npm run build`
4. 发布目录：`dist`

### 自托管

```bash
npm run build
# 将 dist 目录部署到你的服务器
```

---

## 常见问题

### Q: 如何添加新的技能图标？

1. 访问 [Iconify](https://icon-sets.iconify.design/)
2. 搜索你需要的图标
3. 复制图标名称（如 `mdi:react`）
4. 转换格式：`icon-[mdi--react]`（冒号改为双横线）

### Q: Spotlight 不显示数据？

检查 `site.config.ts` 中的 `github.username` 是否正确设置为你的 GitHub 用户名。

### Q: 如何禁用某个功能？

在 `site.config.ts` 中设置：
- `github.enabled: false` - 禁用 Spotlight
- `skills.enabled: false` - 禁用技能展示

### Q: 搜索功能不工作？

搜索功能需要在生产构建后才能使用：
```bash
npm run build
npm run preview
```

---

## 技术栈

- [Astro](https://astro.build) - 静态站点生成
- [React](https://react.dev) - 交互组件
- [Tailwind CSS](https://tailwindcss.com) - 样式系统
- [Pagefind](https://pagefind.app) - 静态搜索
- [Iconify](https://iconify.design) - 图标系统

---

## 许可证

MIT License
