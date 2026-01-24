# Sonnet Blog - 研究发现

## 项目结构分析

### 核心技术栈
- **框架**: Astro 5.16.0
- **前端**: React 19, Tailwind CSS 4.1
- **构建**: TypeScript, Vite
- **内容**: MDX, YAML 配置
- **动效**: Framer Motion

### 目录结构
```
zen-blog/
├── src/
│   ├── components/
│   │   ├── base/          # 基础组件 (ThemeToggle, LanguageSwitch)
│   │   ├── home/          # 首页组件 (SkillsShowcase, LatestContent)
│   │   └── posts/         # 文章组件 (TOC)
│   ├── content/           # 内容目录
│   │   ├── note/          # 文记
│   │   ├── jotting/       # 随笔
│   │   ├── preface/       # 前言
│   │   ├── information/   # 关于信息
│   │   └── projects/      # 项目 (YAML)
│   ├── i18n/              # 国际化
│   ├── layouts/           # 布局组件
│   ├── lib/               # 工具函数
│   ├── pages/             # 路由页面
│   ├── stores/            # 状态管理 (nanostores)
│   └── styles/            # 样式文件
├── public/                # 静态资源
├── site.config.ts         # 站点配置
└── astro.config.ts        # Astro 配置
```

### 关键配置文件

#### site.config.ts
- `title`: "禅意博客" → 需改为 "Sonnet"
- `prologue`: 当前是"行到水穷处\n坐看云起时"
- `skills`: 技能栈配置，支持分组和方向

#### astro.config.ts
- 当前模式: 未指定 (默认 static)
- 需要改为 `output: 'hybrid'` 支持 API

### 现有组件分析

#### SkillsShowcase.astro
- 使用无限滚动动画
- 技能项带图标和链接
- 支持左右方向
- 悬停暂停动画

---

## 设计研究

### 诗词展示方案

#### 字体选择
1. **霞鹜文楷** - 免费开源，楷书风格
2. **仓耳今楷** - 现代楷书，清晰易读
3. **方正清刻本悦宋** - 古籍风格
4. **思源宋体** - 通用方案

#### 展示效果参考
- 竖排文字 (writing-mode: vertical-rl)
- 水墨渐变背景
- 云雾浮动动效
- 毛笔笔触装饰

### 科技感 + 仙气融合

#### 视觉元素
- 粒子光点漂浮
- 发光边框/描边
- 渐变背景 (青绿/墨色)
- 模糊光晕效果
- 网格线条

#### CSS 技术
- `backdrop-filter: blur()`
- `box-shadow` 发光效果
- CSS 动画关键帧
- `mix-blend-mode` 混合
- SVG 滤镜

---

## API 设计

### 上传接口

```typescript
// POST /api/upload/note
interface UploadNoteRequest {
  title: string;
  content: string;        // Markdown 内容
  tags?: string[];
  draft?: boolean;
  locale?: 'zh-cn' | 'en';
}

// POST /api/upload/jotting
interface UploadJottingRequest {
  content: string;
  mood?: string;
  draft?: boolean;
  locale?: 'zh-cn' | 'en';
}

// Response
interface UploadResponse {
  success: boolean;
  id?: string;
  error?: string;
}
```

### 认证方案

```typescript
// API Key 格式: sonnet_sk_xxxxxxxxxxxx
// 存储在 data/api-keys.json

interface ApiKey {
  id: string;
  key: string;           // 哈希后存储
  name: string;          // 用户标注
  createdAt: string;
  lastUsed?: string;
  permissions: string[]; // ['upload:note', 'upload:jotting']
}
```

---

## 管理后台设计

### 路由结构
```
/fantay                    # 主页/仪表盘
/fantay/login              # 登录页
/fantay/api-keys           # API 密钥管理
/fantay/skills             # 技能栈编辑
/fantay/projects           # 项目管理
/fantay/photos             # 相册管理
```

### 认证流程
1. 访问 /fantay → 检查登录状态
2. 未登录 → 跳转 /fantay/login
3. 输入账号密码 → 验证
4. 验证成功 → 生成 JWT → 存储 localStorage
5. 后续请求携带 JWT

### 管理员账号
- 存储在 `data/admin.json` (密码 bcrypt 哈希)
- 初次访问时创建

---

## 待解决问题

1. **字体加载**: 如何优雅加载中文书法字体？考虑字体子集化
2. **API 部署**: Astro hybrid 模式在 Vercel/Netlify 的支持情况
3. **数据存储**: JSON 文件是否足够？是否需要考虑并发写入
4. **安全性**: API Key 如何安全传输和存储

---

## 参考资料

- [Astro API Routes](https://docs.astro.build/en/guides/endpoints/)
- [Astro Hybrid Rendering](https://docs.astro.build/en/guides/server-side-rendering/)
- [霞鹜文楷字体](https://github.com/lxgw/LxgwWenKai)
