#!/usr/bin/env bash
set -euo pipefail

# 战役大厅一键部署到阿里云（与角色卡同仓，部署到独立目录与端口）
# 用法：bash scripts/deploy-aliyun-campaign.sh
#
# 前提：服务器上已按 docs/战役大厅部署说明.md 完成：
#   - 在 /opt/dm-campaign-service/current 克隆本仓库（或该目录为仓库根，且内含 dm-campaign-service 子目录）
#   - 已创建 dm_campaigns 库、.env、systemd 服务 dm-campaign、Nginx 与证书
#
# 可选环境变量：
#   SERVER=root@47.238.5.63
#   REPO_DIR=/opt/dm-campaign-service/current   # 仓库根目录（内含 dm-campaign-service 子目录）
#   SERVICE=dm-campaign
#   BRANCH=main

SERVER="${SERVER:-root@47.238.5.63}"
REPO_DIR="${REPO_DIR:-/opt/dm-campaign-service/current}"
SERVICE="${SERVICE:-dm-campaign}"
BRANCH="${BRANCH:-main}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR/.." rev-parse --show-toplevel)"

echo "==> 本地推送到 GitHub：origin/${BRANCH}"
git -C "$REPO_ROOT" status --porcelain
git -C "$REPO_ROOT" push origin "$BRANCH"

echo "==> 远端部署战役大厅：${SERVER}"
ssh "$SERVER" "bash -s" -- "$REPO_DIR" "$BRANCH" "$SERVICE" <<'REMOTE'
set -euo pipefail
REPO_DIR="$1"
BRANCH="$2"
SERVICE="$3"
APP_DIR="${REPO_DIR}/dm-campaign-service"

if [ ! -d "$REPO_DIR" ]; then
  echo "ERROR: 远端目录不存在：$REPO_DIR"
  echo "请先在服务器上 clone 仓库到该目录，见 docs/战役大厅部署说明.md"
  exit 1
fi
if [ ! -d "$APP_DIR" ]; then
  echo "ERROR: 未找到战役大厅子目录：$APP_DIR"
  exit 1
fi

cd "$REPO_DIR"
echo "==> 拉取最新代码（origin/$BRANCH）"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

cd "$APP_DIR"
echo "==> 安装依赖"
npm ci
echo "==> Prisma generate"
npx prisma generate
echo "==> 构建"
export NEXT_TELEMETRY_DISABLED=1
npm run build
echo "==> 数据库迁移（若有新迁移）"
npx prisma migrate deploy || true

echo "==> 重启服务：$SERVICE"
systemctl restart "$SERVICE" || true
echo "==> 服务状态"
systemctl status "$SERVICE" --no-pager -l | sed -n '1,30p'
REMOTE

echo "✅ 战役大厅部署完成"
