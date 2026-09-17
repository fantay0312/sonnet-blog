---
title: "AI 编程工具安装指南"
timestamp: 2026-01-26T12:18:33.420Z
draft: false
tags:
  - "vibe coding"
  - "ai"
  - "教程"
  - "工具"
---
# AI 编程工具安装指南

本文将介绍如何在 Windows 和 macOS 系统上安装当前主流的 AI 编程命令行工具，包括 `Claude Code`、`Codex CLI`、`Gemini CLI` 和 `Opencode`。

---

## 基础环境配置

在安装任何 AI 编程工具之前，你需要先配置好基础环境。

### Node.js 环境

Node.js 是这些工具运行的基础，必须首先安装。

**安装步骤：**

1. 打开浏览器访问 [https://nodejs.org/](https://nodejs.org/)
2. 点击 ==LTS 版本==进行下载（推荐长期支持版本）
3. 下载完成后双击下载文件
4. 按照安装向导完成安装，保持默认设置即可

> [!TIP]
> 
> - 建议使用 PowerShell 而不是 CMD
> - 如果遇到权限问题，尝试以管理员身份运行
> - 某些杀毒软件可能会误报，需要添加白名单

![](https://pic.fantay.me/i/af41da89-927f-45fd-9c7f-01063a311589.png)

点击进入，根据系统下载合适的安装文件。

不知道自己电脑 CPU 架构的，可以打开==任务管理器==查看 CPU 型号，网上搜索该 CPU 架构。

![](https://pic.fantay.me/i/4380a93d-8656-42f5-b355-8c3b4b9e330a.png)

下载完成后，打开安装文件，按照指示一路下一步进行安装。

**验证安装：**

Windows 系统安装完成后，打开 CMD 输入以下命令验证安装。

> CMD 打开方式：==Win + R==，在弹出的窗口输入 `cmd`，然后回车

```bash
node --version
npm --version
```

如果显示版本号，说明安装成功。

---

## Windows 系统安装教程

### 前置准备：Git Bash

> [!TIP]
> 
> Windows 环境下需要使用 ==Git Bash== 安装 Claude Code。安装完成后，环境变量设置和使用 Claude Code 仍然在普通的 PowerShell 或 CMD 中进行。

**安装步骤：**

1. 访问 [https://git-scm.com/downloads/win](https://git-scm.com/downloads/win)
2. 点击 "Download for Windows" 下载安装包
3. 运行下载的 `.exe` 安装文件
4. 在安装过程中保持默认设置，直接点击 "Next" 完成安装

![](https://pic.fantay.me/i/b5cb8206-300b-412e-b9bb-bd528e4e54aa.png)

**验证安装：**

安装完成后，打开 Git Bash，输入以下命令验证：

![](https://pic.fantay.me/i/ce337e1a-6e43-4194-b443-d493013ee2eb.png)

```bash
git --version
```

如果显示版本号，说明安装成功。

![](https://pic.fantay.me/i/3e95630d-efc2-438c-b1ee-48d6abe9a5f2.png)

---

### Claude Code

> [!IMPORTANT] 打开 ==Git Bash==（重要：不要使用 PowerShell）

**安装命令：**

```bash
npm install -g @anthropic-ai/claude-code
```

**验证安装：**

```bash
claude --version
```

如果显示版本号，恭喜你！Claude Code 已经成功安装了。

![](https://pic.fantay.me/i/537ec9fb-cb60-436c-898a-169ae5fdeace.png)

---

### Codex CLI

> [!IMPORTANT] 打开 ==Git Bash==（重要：不要使用 PowerShell）

**安装命令：**

```bash
npm install -g @openai/codex
```

这个命令会从 npm 官方仓库下载并安装最新版本的 Codex CLI。

**验证安装：**

```bash
codex --version
```

如果显示版本号，恭喜你！Codex CLI 已经成功安装了。

![](https://pic.fantay.me/i/6d01ca4f-cb38-4fa9-b396-eecb5190eef4.png)

---

### Gemini CLI

> [!IMPORTANT] 打开 ==Git Bash==（重要：不要使用 PowerShell）

**安装命令：**

```bash
npm install -g @google/gemini-cli
```

这个命令会从 npm 官方仓库下载并安装最新版本的 Gemini CLI。

**验证安装：**

```bash
gemini --version
```

如果显示版本号，恭喜你！Gemini CLI 已经成功安装了。

---

### Opencode

> [!IMPORTANT] 打开 ==Git Bash==（重要：不要使用 PowerShell）

**安装命令：**

```bash
npm i -g opencode-ai
```

这个命令会从 npm 官方仓库下载并安装最新版本的 Opencode。

**验证安装：**

```bash
opencode --version
```

如果显示版本号，恭喜你！Opencode 已经成功安装了。

---

## macOS 系统安装教程

打开==终端==，以下过程都在终端中进行。

觉得自带终端不美观、不好用的，可以安装一个 [Ghostty](https://ghostty.org/)。

---

### Claude Code

**安装命令：**

```bash
brew install --cask claude-code
```

**开始使用：**

```bash
cd your-project  
# 进入你的项目目录，your-project 要替换为你的具体项目路径

claude
# 启动 Claude Code
```

---

### Codex

**安装命令：**

```bash
brew install codex
```

**开始使用：**

```bash
cd your-project  
# 进入你的项目目录，your-project 要替换为你的具体项目路径

codex
# 启动 Codex
```

---

### Gemini CLI

**安装命令：**

```bash
brew install gemini-cli
```

**开始使用：**

```bash
cd your-project  
# 进入你的项目目录，your-project 要替换为你的具体项目路径

gemini
# 启动 Gemini
```

---

### Opencode

**安装命令：**

```bash
brew install anomalyco/tap/opencode
```

**开始使用：**

```bash
cd your-project  
# 进入你的项目目录，your-project 要替换为你的具体项目路径

opencode
# 启动 Opencode
```

---

## 代码编辑器推荐

安装好命令行工具后，你还需要一个顺手的代码编辑器来配合使用。

### VS Code

> Visual Studio Code (VS Code) 是==由微软开发的一款免费、轻量级、跨平台的开源代码编辑器==。它通过支持多种编程语言、内置 Git 版本控制、智能代码补全（IntelliSense）、调试功能及丰富的插件生态，成为现代开发的首选工具，适用于 Windows、macOS 和 Linux。

官方主页：[https://code.visualstudio.com/](https://code.visualstudio.com/)

---

### Cursor

> Cursor is a fork of VS Code. This allows us focus on making the best way to code with AI, while offering a familiar text editing experience.

Cursor 是 VS Code 的一个分支，这让我们能够专注于利用 AI 提升编码体验，同时提供熟悉的文本编辑界面。

- 官方主页：[https://www.cursor.com/](https://www.cursor.com/)
- 下载地址：[主页下载](https://www.cursor.com/)
- 使用指南：[https://docs.cursor.com/](https://docs.cursor.com/)

---

### Zed

> Zed ==是一款由 Atom 和 Tree-sitter 核心团队使用 Rust 语言打造的新一代高性能、多人实时协作代码编辑器==。它基于 GPU 加速的 GUI 引擎（gpui），主打"思维速度"的编辑体验，专注于极致的本地性能、智能化 AI 集成以及现代化的工作流，适用于追求极客体验的开发者。

官方主页：[https://zed.dev/](https://zed.dev/)

---

### Antigravity

> 这是谷歌于 2025 年底至 2026 年初推出的 AI 开发工具。

官方主页：[https://antigravity.google/](https://antigravity.google/)