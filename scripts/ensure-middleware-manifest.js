#!/usr/bin/env node
/**
 * 在 next dev 启动前预创建 .next/server/middleware-manifest.json，
 * 避免 Next 在首次编译前读取该文件时报 ENOENT。
 * 运行：在 dev 脚本中于 rm -rf .next 之后、next dev 之前执行。
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const serverDir = path.join(root, '.next', 'server');
const manifestPath = path.join(serverDir, 'middleware-manifest.json');

const manifest = {
  middleware: {},
  functions: {},
};

try {
  fs.mkdirSync(serverDir, { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Created', manifestPath);
} catch (e) {
  console.error('ensure-middleware-manifest:', e.message);
  process.exit(1);
}
