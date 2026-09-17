---
title: "AI Coding Tools Installation Guide"
timestamp: 2026-01-26T12:17:59.597Z
draft: false
tags:
  - "vibe coding"
  - "ai"
  - "program"
---
# AI Coding Tools Installation Guide

This guide will walk you through installing the mainstream AI coding CLI tools on Windows and macOS, including `Claude Code`, `Codex CLI`, `Gemini CLI`, and `Opencode`.

---

## Prerequisites

Before installing any AI coding tools, you need to set up the basic environment first.

### Node.js

Node.js is the foundation for running these tools and must be installed first.

**Installation Steps:**

1. Open your browser and visit [https://nodejs.org/](https://nodejs.org/)
2. Click the ==LTS version== to download (Long Term Support version recommended)
3. Double-click the downloaded file after the download completes
4. Follow the installation wizard and keep the default settings

> [!TIP]
> 
> - PowerShell is recommended over CMD
> - If you encounter permission issues, try running as administrator
> - Some antivirus software may flag false positives — add to whitelist if needed

![](https://pic.fantay.me/i/af41da89-927f-45fd-9c7f-01063a311589.png)

Click to enter, and download the appropriate installer for your system.

If you don't know your CPU architecture, open ==Task Manager== to check your CPU model and search online for its architecture.

![](https://pic.fantay.me/i/4380a93d-8656-42f5-b355-8c3b4b9e330a.png)

Once downloaded, open the installer and follow the prompts to complete the installation.

**Verify Installation:**

After installation on Windows, open CMD and run the following commands to verify:

> How to open CMD: Press ==Win + R==, type `cmd` in the dialog box, then press Enter

```bash
node --version
npm --version
```

If version numbers are displayed, the installation was successful.

---

## Windows Installation

### Prerequisite: Git Bash

> [!TIP]
> 
> On Windows, you need to use ==Git Bash== to install Claude Code. After installation, environment variable setup and using Claude Code can still be done in regular PowerShell or CMD.

**Installation Steps:**

1. Visit [https://git-scm.com/downloads/win](https://git-scm.com/downloads/win)
2. Click "Download for Windows" to download the installer
3. Run the downloaded `.exe` file
4. Keep the default settings during installation and click "Next" to complete

![](https://pic.fantay.me/i/b5cb8206-300b-412e-b9bb-bd528e4e54aa.png)

**Verify Installation:**

After installation, open Git Bash and run the following command:

![](https://pic.fantay.me/i/ce337e1a-6e43-4194-b443-d493013ee2eb.png)

```bash
git --version
```

If a version number is displayed, the installation was successful.

![](https://pic.fantay.me/i/3e95630d-efc2-438c-b1ee-48d6abe9a5f2.png)

---

### Claude Code

> [!IMPORTANT] Open ==Git Bash== (Important: Do NOT use PowerShell)

**Install:**

```bash
npm install -g @anthropic-ai/claude-code
```

**Verify:**

```bash
claude --version
```

If a version number is displayed, congratulations! Claude Code has been successfully installed.

![](https://pic.fantay.me/i/537ec9fb-cb60-436c-898a-169ae5fdeace.png)

---

### Codex CLI

> [!IMPORTANT] Open ==Git Bash== (Important: Do NOT use PowerShell)

**Install:**

```bash
npm install -g @openai/codex
```

This command will download and install the latest version of Codex CLI from the official npm registry.

**Verify:**

```bash
codex --version
```

If a version number is displayed, congratulations! Codex CLI has been successfully installed.

![](https://pic.fantay.me/i/6d01ca4f-cb38-4fa9-b396-eecb5190eef4.png)

---

### Gemini CLI

> [!IMPORTANT] Open ==Git Bash== (Important: Do NOT use PowerShell)

**Install:**

```bash
npm install -g @google/gemini-cli
```

This command will download and install the latest version of Gemini CLI from the official npm registry.

**Verify:**

```bash
gemini --version
```

If a version number is displayed, congratulations! Gemini CLI has been successfully installed.

---

### Opencode

> [!IMPORTANT] Open ==Git Bash== (Important: Do NOT use PowerShell)

**Install:**

```bash
npm i -g opencode-ai
```

This command will download and install the latest version of Opencode from the official npm registry.

**Verify:**

```bash
opencode --version
```

If a version number is displayed, congratulations! Opencode has been successfully installed.

---

## macOS Installation

Open ==Terminal==. All the following steps will be performed in Terminal.

If you find the built-in Terminal unappealing or lacking features, consider installing [Ghostty](https://ghostty.org/).

---

### Claude Code

**Install:**

```bash
brew install --cask claude-code
```

**Getting Started:**

```bash
cd your-project  
# Navigate to your project directory, replace your-project with your actual project path

claude
# Launch Claude Code
```

---

### Codex

**Install:**

```bash
brew install codex
```

**Getting Started:**

```bash
cd your-project  
# Navigate to your project directory, replace your-project with your actual project path

codex
# Launch Codex
```

---

### Gemini CLI

**Install:**

```bash
brew install gemini-cli
```

**Getting Started:**

```bash
cd your-project  
# Navigate to your project directory, replace your-project with your actual project path

gemini
# Launch Gemini
```

---

### Opencode

**Install:**

```bash
brew install anomalyco/tap/opencode
```

**Getting Started:**

```bash
cd your-project  
# Navigate to your project directory, replace your-project with your actual project path

opencode
# Launch Opencode
```

---

## Code Editor Recommendations

After installing the CLI tools, you'll need a code editor to work with them.

### VS Code

> Visual Studio Code (VS Code) is a ==free, lightweight, cross-platform open-source code editor developed by Microsoft==. With support for multiple programming languages, built-in Git version control, intelligent code completion (IntelliSense), debugging capabilities, and a rich plugin ecosystem, it has become the go-to tool for modern development, available on Windows, macOS, and Linux.

Official Website: [https://code.visualstudio.com/](https://code.visualstudio.com/)

---

### Cursor

> Cursor is a fork of VS Code. This allows us focus on making the best way to code with AI, while offering a familiar text editing experience.

Cursor is a fork of VS Code that focuses on enhancing the coding experience with AI while providing a familiar text editing interface.

- Official Website: [https://www.cursor.com/](https://www.cursor.com/)
- Download: [Homepage](https://www.cursor.com/)
- Documentation: [https://docs.cursor.com/](https://docs.cursor.com/)

---

### Zed

> Zed is a ==next-generation high-performance, real-time collaborative code editor built with Rust by the core teams behind Atom and Tree-sitter==. Powered by a GPU-accelerated GUI engine (gpui), it delivers an editing experience at "the speed of thought," focusing on extreme local performance, intelligent AI integration, and modern workflows — perfect for developers who crave a cutting-edge experience.

Official Website: [https://zed.dev/](https://zed.dev/)

---

### Antigravity

> This is an AI development tool launched by Google in late 2025 to early 2026.

Official Website: [https://antigravity.google/](https://antigravity.google/)