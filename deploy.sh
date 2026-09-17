#!/bin/bash
#
# 部署本地博客代码到新服务器 (blog.fantay.cc)
#
# 策略：代码本地、文章用后台
#   - 推送：src（主题/组件/布局/i18n/lib/pages 等）、public、各配置文件、package*.json
#   - 永不触碰服务器上的：src/content（后台/Obsidian 上传的文章）、data/（后台数据）、.env（密钥）
#
# 用法：
#   ./deploy.sh            正式部署（同步 -> 安装 -> 构建 -> 重启 PM2 -> 校验）
#   ./deploy.sh --dry-run  只预览会同步哪些文件，不做任何改动
#
set -euo pipefail

SERVER="root@120.27.133.123"
KEY="$HOME/.ssh/blog_deploy"
REMOTE_DIR="/root/sonnet-blog"
DOMAIN="https://blog.fantay.cc"
SSH_CMD="/usr/bin/ssh -i $KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"

# 受保护路径：服务器端为准，部署绝不覆盖/删除
EXCLUDES=(
  --exclude='.git/'
  --exclude='node_modules/'
  --exclude='dist/'
  --exclude='.astro/'
  --exclude='src/content/'   # 文章：后台/Obsidian 写入，服务器为准
  --exclude='/data/'         # 仅根目录 data/（后台数据），不影响 src/data/
  --exclude='.env'           # 生产密钥
  --exclude='.DS_Store'
  --exclude='*.log'
  --exclude='deploy.sh'        # 本地部署工具，不上服务器
  --exclude='本地开发说明.md'   # 本地说明文档
  --exclude='.serena/'
)

if [[ "${1:-}" == "--dry-run" ]]; then
  echo "==> [DRY-RUN] 预览将同步的文件（不改动服务器）"
  rsync -rlptzn --no-owner --no-group --delete --itemize-changes -e "$SSH_CMD" "${EXCLUDES[@]}" \
    "$LOCAL_DIR/" "$SERVER:$REMOTE_DIR/"
  echo "==> [DRY-RUN] 结束，未做任何改动"
  exit 0
fi

echo "==> 1/3 同步代码到 $SERVER:$REMOTE_DIR （排除文章/数据/密钥）"
rsync -rlptz --no-owner --no-group --delete -e "$SSH_CMD" "${EXCLUDES[@]}" \
  "$LOCAL_DIR/" "$SERVER:$REMOTE_DIR/"

echo "==> 2/3 服务器安装依赖 + 构建 + 重启（构建失败则保持旧版本运行）"
$SSH_CMD "$SERVER" 'set -e
  cd /root/sonnet-blog
  npm install --no-audit --no-fund
  # Astro 5 内容层缓存：remark/rehype 插件变更后必须清掉，
  # 否则旧文章直接复用缓存的渲染结果，插件改动看似无效
  rm -rf .astro
  npm run build
  pm2 restart blog --update-env
  pm2 save'

echo "==> 3/3 校验线上状态"
sleep 2
code=$(curl -sS -m20 -o /dev/null -w "%{http_code}" "$DOMAIN/")
icp=$(curl -sS -m20 "$DOMAIN/" | grep -o '湘ICP备2025111331号-2' | head -1 || true)
echo "    $DOMAIN -> HTTP $code"
echo "    页脚备案号: ${icp:-未检测到}"
echo "==> 部署完成 ✅"
