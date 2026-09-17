---
title: "Claude Code终端美化优化"
timestamp: 2026-01-31T17:18:38.944Z
draft: false
tags:
  - "终端"
  - "美化"
  - "ai"
  - "claude code"
---
# Claude Code 终端美化优化

> **说明**：部分软件包存在个人偏好。如你明白其作用和意义，按需选择；如不明白，请悉数按序执行安装。目的是正确、方便、快乐地使用。

---


# Windows 安装

## 准备工作

从魔法软件中获得其提供的 Proxy 端口，在 PowerShell 中执行以下命令后被魔法软件正确代理，以保证诸多软件包的安装拉取正常进行：

> **注**：将 `Port` 修改为你实际的代理端口

```powershell
$env:HTTP_PROXY="http://127.0.0.1:Port"; $env:HTTPS_PROXY="http://127.0.0.1:Port"
```

---

## Windows 环境安装

### 1. Windows Terminal

下载地址：[Windows Terminal](https://apps.microsoft.com/detail/9n0dx20hk701?hl=zh-cn&gl=CN&ocid=pdpshare)

下载程序，完成安装：

![](https://pic.fantay.me/i/e5f03a5e-2b2a-46d6-8467-a7654c0c1529.png)

安装好后，设定默认打开系统内置 PowerShell 并且给予默认管理员权限：

![](https://pic.fantay.me/i/a34d0cf8-fd19-4800-866b-c4c451cdd982.png) ![](https://pic.fantay.me/i/7703039d-7ee9-4c0a-88f0-a2034d0e9fae.png)

后续右键能够直接在所处文件夹内打开对应的终端 Shell：

![](https://pic.fantay.me/i/687ccd3e-8321-4efd-95c4-27a87ba98534.png)

---

### 2. WinGet

```powershell
$progressPreference = 'silentlyContinue'
Install-PackageProvider -Name NuGet -Force | Out-Null
Install-Module -Name Microsoft.WinGet.Client -Force -Repository PSGallery | Out-Null
Write-Host "Using Repair-WinGetPackageManager cmdlet to bootstrap WinGet..."
Repair-WinGetPackageManager -AllUsers
```

![](https://pic.fantay.me/i/1abea3ed-0089-4600-9773-34b7e7438e88.png)

---

### 3. PowerShell 7

```powershell
winget install Microsoft.PowerShell
```

![](https://pic.fantay.me/i/93381989-0443-469b-9b10-16bcf2819486.png)

切换默认为我们刚安装的 PowerShell：

![](https://pic.fantay.me/i/acf71dee-bc87-4084-8d03-4fa57d6f0744.png)

同样修改其默认配置为管理员启动。

> **重要**：全部关闭后打开新终端窗口，继续安装其他内容。

---

### 4. Notepad4

```powershell
winget install zufuliu.notepad4
```

![](https://pic.fantay.me/i/a0cc8a0f-a502-46bc-97b1-b7b037bbebd7.png)

使用命令 `Notepad4` 打开，使用系统集成设置替换系统记事本和快捷打开方式：

![](https://pic.fantay.me/i/5601c485-2c76-43d8-9fc1-9a3214b6ecb3.png) ![](https://pic.fantay.me/i/5e69672c-2f47-4b14-8450-2ec3e1a54820.png) ![](https://pic.fantay.me/i/2af931f7-6b6a-4b1f-81ba-06004d3b2577.png)

---

### 5. Git for Windows

```powershell
winget install --id Git.Git -e --source winget
```

![](https://pic.fantay.me/i/76a20042-0cc4-4504-a0a9-8c90619afa33.png)

---

### 6. fnm (Node 版本管理器)

```powershell
winget install Schniz.fnm
```

![](https://pic.fantay.me/i/00576612-b9d0-4c7c-a93b-6244ce3f25a6.png)

安装成功后同样关闭全部窗口，重新打开一个终端 Shell，继续安装 Node：

```powershell
fnm install lts/krypton
fnm use lts/krypton
```

![](https://pic.fantay.me/i/2213d8f3-818a-409a-bb58-d5699bc2ff74.png)

#### 配置 FNM 环境启动

```powershell
notepad $profile
```

没有已有 PROFILE 的情况下会提示不存在，需要新建：

```powershell
New-Item –Path $Profile –Type File –Force
```

完成后再次使用命令 `notepad $profile` 打开，添加以下内容后保存：

```powershell
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
```

![](https://pic.fantay.me/i/6b28055a-c8c3-475f-9db2-ab35b2e6f875.png)

> **重要**：同样关闭全部窗口，重新打开一个终端 Shell。

#### 使用刚才安装的版本

```powershell
fnm use lts/krypton
```

![](https://pic.fantay.me/i/b892f0cd-7a01-44d6-9760-e594a08f9da2.png)

成功应用默认 Node 版本。

---

### 7. 安装 Claude Code

#### 设定 npm 镜像源（国内环境推荐）

```powershell
npm config set registry https://registry.npmmirror.com
```

#### 全局安装 Claude Code

```powershell
npm install -g @anthropic-ai/claude-code
```

---

## 可选设定：美化相关

### 包含中文的等宽字体

推荐：[Maple Mono v7.0 正式版](https://github.com/subframe7536/maple-font/releases/tag/v7.9)

下载：**MapleMonoNormal-NF-CN.zip**

打开 PowerShell 修改默认字体为 `Maple Mono Normal NF CN`：

1. 点击顶部下拉箭头 → 设置
2. 配置文件项中的 PowerShell → 其他设置中的外观项 → 字体选择

![](https://pic.fantay.me/i/2f03b21c-3f82-4320-a9eb-34c931785a04.png)

---

### Oh My Posh

```powershell
winget install JanDeDobbeleer.OhMyPosh --source winget --scope user --force
```

![](https://pic.fantay.me/i/825f90cd-52f2-4ad6-92ef-44c6a427d8b3.png)

同样打开 PROFILE 新增激活 OhMyPosh：

```powershell
notepad $profile
```

添加以下内容：

```powershell
oh-my-posh init pwsh --eval | Invoke-Expression
```

![](https://pic.fantay.me/i/956baf1b-03af-421d-b9bf-49953c443e77.png)

主题样式很多，任君挑选：[Themes | Oh My Posh](https://ohmyposh.dev/docs/themes)

---

# macOS 安装

## 终端选择

> **说明**：iTerm2 和 Ghostty 选一个安装即可

### 方案一：iTerm2

官网：[https://iterm2.com/](https://iterm2.com/)

下载解压安装即可：

![](https://pic.fantay.me/i/58fbc5f8-53ba-4bfe-a1b6-2eb6a515f975.png)

下载的压缩包解压完是这样的：

![](https://pic.fantay.me/i/66a1bbdf-d2ed-4653-80b6-b62e1c52a6ce.png)

把这个文件拷贝粘贴或者拖动到应用程序文件夹中：

![](https://pic.fantay.me/i/821f25fe-d7b0-4577-a068-a35beaac3757.png)

双击打开即可使用：

![](https://pic.fantay.me/i/a430d5e5-a5f7-492a-8851-d5496ea75b5d.png)

---

### 方案二：Ghostty

官网：[https://ghostty.org/](https://ghostty.org/)

点击下载：

![](https://pic.fantay.me/i/c74e747e-f562-4ea3-ab57-a3281904adf8.png)

选择打包的安装包，按照提示安装，一路下一步：

![](https://pic.fantay.me/i/a3af8ff4-fe49-48d9-83d9-897ff2ce4ec4.png)

打开 Ghostty：

![](https://pic.fantay.me/i/640d91b7-0e7f-4e10-a0ee-268e24e92d51.png)

---

# CCometixLine 安装

项目地址：[https://github.com/Haleclipse/CCometixLine](https://github.com/Haleclipse/CCometixLine)

CCometixLine 是基于 Rust 的高性能 Claude Code 状态栏工具，集成 Git 信息、使用量跟踪、交互式 TUI 配置和 Claude Code 补丁工具。

---

## 安装

```bash
# 全局安装（推荐）
npm install -g @cometix/ccline

# 使用镜像源加速下载（国内环境）
npm install -g @cometix/ccline --registry https://registry.npmmirror.com

# 或使用 yarn
yarn global add @cometix/ccline

# 或使用 pnpm
pnpm add -g @cometix/ccline
```

---

## Claude Code 配置

添加到 Claude Code `settings.json`：

**Linux / macOS：**

```json
{
  "statusLine": {
    "type": "command", 
    "command": "~/.claude/ccline/ccline",
    "padding": 0
  }
}
```

![](https://pic.fantay.me/i/df25a2b5-927c-427a-abd4-09932a9476fb.png)

**Windows：**

```json
{
  "statusLine": {
    "type": "command", 
    "command": "~/.claude/ccline/ccline",
    "padding": 0
  }
}
```

**后备方案（npm 安装）：**

```json
{
  "statusLine": {
    "type": "command", 
    "command": "ccline",
    "padding": 0
  }
}
```

---

## 更新

```bash
npm update -g @cometix/ccline
```

---

## 使用

### 配置管理

```bash
# 初始化配置文件
ccline --init

# 检查配置有效性  
ccline --check

# 打印当前配置
ccline --print

# 进入 TUI 配置模式
ccline --config
```

### 主题覆盖

```bash
# 临时使用指定主题（覆盖配置文件设置）
ccline --theme cometix
ccline --theme minimal
ccline --theme gruvbox
ccline --theme nord
ccline --theme powerline-dark

# 或使用 ~/.claude/ccline/themes/ 目录下的自定义主题
ccline --theme my-custom-theme
```

### Claude Code 增强

```bash
# 禁用上下文警告并启用详细模式
ccline --patch /path/to/claude-code/cli.js

# 常见安装路径示例
ccline --patch ~/.local/share/fnm/node-versions/v24.4.1/installation/lib/node_modules/@anthropic-ai/claude-code/cli.js
```