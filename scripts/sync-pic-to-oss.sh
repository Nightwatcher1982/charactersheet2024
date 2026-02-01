#!/usr/bin/env bash
# 将 public/pic 同步到阿里云 OSS（需先配置 ossutil）
# 使用：OSS_BUCKET=dndcharacter2024 ./scripts/sync-pic-to-oss.sh
# 华东2(上海) 已内置；其他地域可设置 OSS_ENDPOINT=oss-cn-xxx.aliyuncs.com

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE="$ROOT/public/pic"
PREFIX="${OSS_PREFIX:-charactersheet2024/pic}"
# 华东2（上海）region（ossutil 2.x 使用 v4 签名时必须指定；endpoint/密钥从 ossutil config 读取）
OSS_REGION="${OSS_REGION:-cn-shanghai}"

if ! command -v ossutil &>/dev/null; then
  echo "请先安装 ossutil：https://help.aliyun.com/document_detail/120075.html"
  exit 1
fi

if [ ! -d "$SOURCE" ]; then
  echo "目录不存在: $SOURCE"
  exit 1
fi

# 仅传 --region 和 --sign-version，endpoint 与 AccessKey 从 ~/.ossutilconfig 读取，避免 Credentials is null
echo "同步 $SOURCE -> oss://${OSS_BUCKET:-请设置 OSS_BUCKET}/$PREFIX (region: $OSS_REGION，密钥从 ossutil config 读取)"
ossutil cp -r "$SOURCE/" "oss://${OSS_BUCKET:?请设置 OSS_BUCKET}/$PREFIX/" --update --region "$OSS_REGION" --sign-version v4
