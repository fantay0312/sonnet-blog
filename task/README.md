# Sonnet Blog - 任务管理

此目录包含项目迭代所需的任务追踪文件。

## 文件说明

| 文件 | 用途 |
|------|------|
| `task_plan.md` | 整体任务计划、阶段分解、技术决策 |
| `progress.md` | 会话日志、文件修改记录、待办队列 |
| `findings.md` | 研究发现、技术方案、API 设计 |

## 快速恢复上下文

新会话时，告诉 Claude Code：

```
继续 Sonnet 博客任务，先阅读 task/ 目录下的文件
```

或手动指定：

```
阅读以下文件恢复上下文：
- task/task_plan.md
- task/progress.md
- task/findings.md
```

## 当前状态

- **完成**: Phase 1-6 (品牌重塑、诗词组件、技能栈、API、管理后台、数据层)
- **待做**: Phase 7 (测试和安全优化)
- **进度**: 85%

## 关键入口

| 功能 | 路径 |
|------|------|
| 首页 | `/` |
| 管理后台 | `/fantay` |
| 管理登录 | `/fantay/login` |
| API 验证 | `GET /api/auth/verify` |
| 上传文记 | `POST /api/upload/note` |
| 上传随笔 | `POST /api/upload/jotting` |

## 开发命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览构建结果
```
