---
title: Zen Blog 内容管理指南
timestamp: 2025-01-26
description: 详细介绍 Zen Blog 的内容分类、Frontmatter 配置、标签系统和归档功能。
tags:
  - 教程
  - 内容管理
  - Markdown
toc: true
---

## 内容分类

Zen Blog 将内容划分为四个主要类型，每种类型有其特定用途：

### 文记（Note）

深度文章和技术笔记，适合长篇内容。

- 路径：`src/content/note/{locale}/`
- URL：`/{locale}/note/{slug}`

### 随笔（Jotting）

零碎想法和日常记录，适合短内容。

- 路径：`src/content/jotting/{locale}/`
- URL：`/{locale}/jotting/{slug}`

### 序章（Prologue）

首页展示的引言内容，每个语言一篇。

- 路径：`src/content/prologue/{locale}.md`

### 絮述（About）

关于页面内容，每个语言一篇。

- 路径：`src/content/about/{locale}.md`

## Frontmatter 配置

每篇文章都需要在文件顶部添加 YAML 格式的 Frontmatter：

```yaml
---
title: 文章标题
timestamp: 2025-01-26
description: 文章描述，用于 SEO 和预览
tags:
  - 标签1
  - 标签2
toc: true
draft: false
---
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 文章标题 |
| timestamp | date | 是 | 发布时间 |
| description | string | 否 | 文章描述 |
| tags | string[] | 否 | 标签列表 |
| toc | boolean | 否 | 是否显示目录，默认 false |
| draft | boolean | 否 | 是否为草稿，默认 false |

## 多语言内容

Zen Blog 支持中英双语。每种语言的内容存放在对应的子目录中：

```
src/content/note/
├── zh-cn/          # 中文内容
│   └── my-post.md
└── en/             # 英文内容
    └── my-post.md
```

文件名可以相同，系统会根据目录自动匹配语言。

## 标签系统

标签用于内容分类和导航。

### 添加标签

在 Frontmatter 中使用 `tags` 字段：

```yaml
tags:
  - Astro
  - 前端开发
  - 教程
```

### 标签页面

- **标签列表**：`/{locale}/tags` 显示所有标签及文章数量
- **单标签页**：`/{locale}/tags/{tag}` 显示该标签下的所有文章

标签云会根据文章数量自动调整字体大小，帮助读者发现热门话题。

## 归档功能

归档页面按时间线展示所有文章：

- URL：`/{locale}/archive`

文章按年份和月份分组，方便读者浏览历史内容。每篇文章显示发布日期、标题和类型（文记/随笔）。

## 目录功能

对于长文章，启用目录功能可以提升阅读体验。

### 启用目录

在 Frontmatter 中设置 `toc: true`：

```yaml
toc: true
```

### 目录展示方式

启用后，文章会有两种目录展示：

1. **文章开头目录**：可折叠的目录面板，展开查看全文结构
2. **右侧悬浮目录**：在宽屏设备上固定在右侧，随滚动高亮当前章节

目录会自动提取 Markdown 中的标题（h2-h4）生成。

## Markdown 增强

### 代码块

支持语法高亮和文件名显示：

````markdown
```typescript title="example.ts"
const greeting = "Hello, World!";
```
````

### 图片

推荐将图片放在 `public/` 目录下：

```markdown
![图片描述](/images/my-image.png)
```

### 链接

支持内部链接和外部链接：

```markdown
[内部链接](/note/another-post)
[外部链接](https://example.com)
```

## 草稿模式

在开发过程中，可以将未完成的文章标记为草稿：

```yaml
draft: true
```

草稿文章不会出现在生产构建中，但在开发模式下可以预览。

## 最佳实践

### 文件命名

- 使用小写字母和短横线
- 避免特殊字符和空格
- 保持简洁且有意义

```
✅ my-first-post.md
✅ astro-tutorial.md
❌ My First Post.md
❌ 我的文章.md
```

### 标签规范

- 使用一致的命名风格
- 避免过于细分的标签
- 定期清理无用标签

### 图片优化

- 使用适当的图片尺寸
- 压缩图片减少加载时间
- 为图片添加 alt 描述
