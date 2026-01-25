#!/usr/bin/env bash
set -euo pipefail

# 一键同步 GitHub 代码到阿里云服务器并重启服务
# 用法：
#   bash scripts/deploy-aliyun.sh
#
# 可选环境变量：
#   SERVER=root@47.238.5.63
#   APP_DIR=/opt/charactersheet2024/current
#   SERVICE=charactersheet2024
#   BRANCH=main
#   BASE_PATH=/charactersheet2024

SERVER="${SERVER:-root@47.238.5.63}"
APP_DIR="${APP_DIR:-/opt/charactersheet2024/current}"
SERVICE="${SERVICE:-charactersheet2024}"
BRANCH="${BRANCH:-main}"
BASE_PATH="${BASE_PATH:-/charactersheet2024}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR/.." rev-parse --show-toplevel)"

echo "==> 本地推送到 GitHub：origin/${BRANCH}"
git -C "$REPO_ROOT" status --porcelain
git -C "$REPO_ROOT" push origin "$BRANCH"

echo "==> 远端部署：${SERVER}"
ssh "$SERVER" 'bash -s' <<REMOTE
set -euo pipefail

APP_DIR="${APP_DIR}"
BRANCH="${BRANCH}"
SERVICE="${SERVICE}"
BASE_PATH="${BASE_PATH}"

if [ ! -d "\$APP_DIR" ]; then
  echo "ERROR: 远端目录不存在：\$APP_DIR"
  echo "请先在服务器上 clone 仓库到该目录。"
  exit 1
fi

cd "\$APP_DIR"

echo "==> 拉取最新代码（origin/\$BRANCH）"
git fetch origin "\$BRANCH"
git checkout "\$BRANCH"
git reset --hard "origin/\$BRANCH"

echo "==> 安装依赖"
npm ci

echo "==> 构建（确保 basePath 一致）"
export NEXT_PUBLIC_BASE_PATH="\$BASE_PATH"
export NEXT_TELEMETRY_DISABLED=1
npm run build

echo "==> 重启服务：\$SERVICE"
systemctl restart "\$SERVICE"

echo "==> 服务状态（最近 50 行）"
systemctl status "\$SERVICE" --no-pager -l | sed -n '1,50p'
REMOTE

echo "✅ 部署完成"

