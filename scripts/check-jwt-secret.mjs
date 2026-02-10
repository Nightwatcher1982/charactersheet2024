#!/usr/bin/env node
/**
 * 检查角色卡与 DM 服务的 JWT_SECRET 是否一致（用于排查「暂无角色」）。
 * 在项目根目录执行：node scripts/check-jwt-secret.mjs
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

function getJwtSecretFromEnvFile(envPath) {
  try {
    const content = readFileSync(envPath, 'utf8');
    const line = content.split('\n').find((l) => /^\s*JWT_SECRET\s*=/.test(l));
    if (!line) return null;
    const raw = line.replace(/^\s*JWT_SECRET\s*=\s*/, '').trim();
    return raw.replace(/^["']|["']$/g, '').trim();
  } catch {
    return null;
  }
}

const root = resolve(process.cwd());
const rootEnv = resolve(root, '.env');
const dmEnv = resolve(root, 'dm-campaign-service', '.env');

const rootSecret = getJwtSecretFromEnvFile(rootEnv);
const dmSecret = getJwtSecretFromEnvFile(dmEnv);

console.log('角色卡 .env:     ', rootSecret ? `已配置（长度 ${rootSecret.length}）` : '未找到 JWT_SECRET');
console.log('DM 服务 .env:    ', dmSecret ? `已配置（长度 ${dmSecret.length}）` : '未找到 JWT_SECRET');

if (!rootSecret || !dmSecret) {
  console.log('\n请确保两边 .env 中都有 JWT_SECRET=...（至少 32 字符）');
  process.exit(1);
}

if (rootSecret !== dmSecret) {
  console.log('\n❌ JWT_SECRET 不一致，会导致登录后仍显示「暂无角色」。');
  console.log('请将角色卡 .env 中的 JWT_SECRET 整行复制到 dm-campaign-service/.env，并重启 DM 服务。');
  process.exit(1);
}

console.log('\n✔ 两边 JWT_SECRET 一致。');
process.exit(0);
