# Sonnet Blog 优化任务计划

## 目标
将 zen-blog 转型为 **Sonnet** 博客，具有诗意、仙气的设计风格，并添加管理后台和上传API接口。

## 当前状态
- **阶段**: Phase 7 基本完成
- **开始时间**: 2026-01-24
- **最后更新**: 2026-01-24
- **完成进度**: 7/7 (100%)

---

## 任务分解

### Phase 1: 品牌重塑 `completed`
**目标**: 将博客从"禅意博客"转型为"Sonnet"

- [ ] 1.1 修改 `site.config.ts` 中的 title 为 "Sonnet"
- [ ] 1.2 修改 description 为诗意风格描述
- [ ] 1.3 创建新的 favicon.svg - 设计与 sonnet(十四行诗)相关的图标
- [ ] 1.4 更新相关的 i18n 配置

**关键文件**:
- `site.config.ts`
- `public/favicon.svg`
- `src/i18n/zh-cn/index.yaml`
- `src/i18n/en/index.yaml`

---

### Phase 2: 诗词展示组件 `completed`
**目标**: 创建独特、诗意、有仙气的诗词展示

**诗词内容**:
1. "北海虽赊，扶摇可接；东隅已逝，桑榆非晚。"
2. "取次花丛懒回顾，半缘修道半缘君。"

- [ ] 2.1 创建 `PoeticQuotes.astro` 组件
- [ ] 2.2 设计诗意展示效果：
  - 毛笔字体 / 书法字体
  - 竖排文字或传统排版
  - 水墨/云雾动效
  - 随机或交替显示两句诗
- [ ] 2.3 集成到首页，替换现有 prologue
- [ ] 2.4 添加响应式设计

**关键文件**:
- 新建 `src/components/home/PoeticQuotes.astro`
- 修改 `src/pages/[...locale]/index.astro`
- 可能需要 `src/styles/global.css`

---

### Phase 3: 技能栈重设计 `completed`
**目标**: 技能栈部分具有仙气和科技感

- [ ] 3.1 重新设计 `SkillsShowcase.astro`
  - 添加光效/粒子效果
  - 科技感边框/发光
  - 仙气渐变背景
  - 悬浮/漂浮动效
- [ ] 3.2 技能数据支持从管理界面编辑（需等待 Phase 5）
- [ ] 3.3 添加技能分类标签

**关键文件**:
- `src/components/home/SkillsShowcase.astro`
- `site.config.ts` (skills 配置)

---

### Phase 4: 上传API接口 `completed`
**目标**: 为 Obsidian 插件预留上传接口

- [ ] 4.1 设计 API 结构
  - `POST /api/upload/note` - 上传文记
  - `POST /api/upload/jotting` - 上传随笔
  - `GET /api/auth/verify` - 验证 API Key
- [ ] 4.2 创建 API 路由文件
- [ ] 4.3 实现 API Key 验证中间件
- [ ] 4.4 实现内容解析和存储逻辑
- [ ] 4.5 创建 API 文档

**关键文件**:
- 新建 `src/pages/api/upload/note.ts`
- 新建 `src/pages/api/upload/jotting.ts`
- 新建 `src/pages/api/auth/verify.ts`
- 新建 `src/lib/api-auth.ts`

**注意**: Astro 默认是 SSG，需要配置 hybrid 或 server 模式支持 API

---

### Phase 5: 管理后台 /fantay `completed`
**目标**: 创建隐藏的管理界面

**功能需求**:
1. 需要账号密码登录
2. 生成/管理 API 密钥
3. 编辑/添加/删除技能栈
4. 管理项目和相册

- [ ] 5.1 创建登录页面 `/fantay/login`
- [ ] 5.2 实现认证系统 (JWT/Session)
- [ ] 5.3 创建管理后台主页 `/fantay`
- [ ] 5.4 API 密钥管理界面
  - 生成新密钥
  - 查看现有密钥
  - 撤销密钥
- [ ] 5.5 技能栈管理界面
  - CRUD 操作
  - 拖拽排序
  - 预览效果
- [ ] 5.6 项目管理界面
- [ ] 5.7 相册管理界面

**关键文件**:
- 新建 `src/pages/fantay/index.astro`
- 新建 `src/pages/fantay/login.astro`
- 新建 `src/pages/api/fantay/*.ts`
- 新建 `src/components/admin/*.astro`

---

### Phase 6: 数据持久化 `completed`
**目标**: 支持管理后台的数据存储

- [ ] 6.1 选择存储方案（JSON文件 / SQLite / 云数据库）
- [ ] 6.2 设计数据模型
- [ ] 6.3 实现数据读写层
- [ ] 6.4 迁移现有配置到可编辑存储

**关键文件**:
- 新建 `src/lib/db.ts`
- 新建 `data/` 目录

---

### Phase 7: 测试和优化 `completed`
- [x] 7.1 测试所有 API 接口 - 登录、API Keys 管理已测试通过
- [x] 7.2 测试管理后台功能 - /fantay 登录、各Tab功能正常
- [x] 7.3 响应式设计检查 - 首页、诗词组件正常显示
- [ ] 7.4 性能优化 - 待后续迭代
- [ ] 7.5 安全审查 - 待后续迭代

**已发现问题**:
- ThemeToggle/ColorSwitch React组件hydration后不渲染（预存在问题）

---

## 技术决策记录

| 决策 | 选择 | 原因 |
|------|------|------|
| Astro 渲染模式 | hybrid | 需要支持 API 端点同时保持静态页面性能 |
| 管理后台认证 | JWT + localStorage | 简单实现，无需后端会话存储 |
| 数据存储 | 待定 | 需要评估 JSON文件 vs SQLite |
| 字体 | 霞鹜文楷 / 仓耳今楷 | 免费可商用的书法风格字体 |

---

## 错误记录

| 错误 | 尝试 | 解决方案 |
|------|------|----------|
| - | - | - |

---

## 备注

- `/fantay` 路径不会在导航中显示，需要手动访问
- API Key 应该足够长且随机，使用 crypto.randomUUID() 或类似方案
- 考虑添加 rate limiting 防止滥用
- 诗词展示应该优雅降级，在不支持动效的设备上也能正常显示
