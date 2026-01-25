#!/usr/bin/env bash
set -euo pipefail

# 首次部署/初始化用：如果服务器还没有 clone 仓库，则自动 clone；
# 然后安装依赖、构建，并尝试重启 charactersheet2024 服务。
#
# 用法：
#   bash scripts/bootstrap-aliyun.sh
#
# 可选环境变量：
#   SERVER=root@47.238.5.63
#   APP_DIR=/opt/charactersheet2024/current
#   REPO=https://github.com/Nightwatcher1982/charactersheet2024.git
#   SERVICE=charactersheet2024
#   BRANCH=main
#   BASE_PATH=/charactersheet2024

SERVER="${SERVER:-root@47.238.5.63}"
APP_DIR="${APP_DIR:-/opt/charactersheet2024/current}"
REPO="${REPO:-https://github.com/Nightwatcher1982/charactersheet2024.git}"
SERVICE="${SERVICE:-charactersheet2024}"
BRANCH="${BRANCH:-main}"
BASE_PATH="${BASE_PATH:-/charactersheet2024}"

echo "==> 远端初始化：${SERVER}"
ssh "$SERVER" 'bash -s' <<REMOTE
set -euo pipefail

APP_DIR="${APP_DIR}"
REPO="${REPO}"
BRANCH="${BRANCH}"
SERVICE="${SERVICE}"
BASE_PATH="${BASE_PATH}"

mkdir -p "\$(dirname "\$APP_DIR")"

if [ ! -d "\$APP_DIR/.git" ]; then
  if [ -e "\$APP_DIR" ] && [ ! -d "\$APP_DIR" ]; then
    echo "ERROR: \$APP_DIR 存在但不是目录：\$APP_DIR"
    exit 1
  fi
  if [ -d "\$APP_DIR" ] && [ -n "\$(ls -A "\$APP_DIR" 2>/dev/null || true)" ]; then
    echo "ERROR: \$APP_DIR 目录非空且不是 git 仓库：\$APP_DIR"
    exit 1
  fi
  echo "==> clone 仓库到：\$APP_DIR"
  rm -rf "\$APP_DIR"
  git clone "\$REPO" "\$APP_DIR"
fi

cd "\$APP_DIR"
git fetch origin "\$BRANCH"
git checkout "\$BRANCH"
git reset --hard "origin/\$BRANCH"

echo "==> 安装依赖"
npm ci

echo "==> 构建（确保 basePath 一致）"
export NEXT_PUBLIC_BASE_PATH="\$BASE_PATH"
export NEXT_TELEMETRY_DISABLED=1
npm run build

if systemctl list-unit-files | grep -q "^\\\$SERVICE\\.service"; then
  echo "==> 重启服务：\$SERVICE"
  systemctl restart "\$SERVICE"
  systemctl status "\$SERVICE" --no-pager -l | sed -n '1,50p'
else
  echo "WARN: 未检测到 systemd 服务：\$SERVICE（跳过重启）"
  echo "你可以手动创建/启用 service 后再运行 scripts/deploy-aliyun.sh 做日常更新。"
fi
REMOTE

echo "✅ 初始化完成"

