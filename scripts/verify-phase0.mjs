/**
 * 阶段 0 Sub-Agent 验证脚本
 * 需先启动：角色卡 npm run dev（3000）、DM 服务 npm run dev -- -p 3001
 * 可选 .env：E2E_TEST_EMAIL, E2E_TEST_PASSWORD 用于登录拿 JWT
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

const CS_BASE = process.env.CHARACTER_SHEET_URL || 'http://localhost:3000';
const DM_BASE = process.env.DM_SERVICE_URL || 'http://localhost:3001';
const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

const results = { ok: [], fail: [] };

function pass(name) {
  results.ok.push(name);
  console.log('✔', name);
}
function fail(name, detail) {
  results.fail.push({ name, detail });
  console.log('✗', name, detail);
}

async function main() {
  console.log('--- 阶段 0 验证 ---\n');
  console.log('角色卡:', CS_BASE, '| DM 服务:', DM_BASE, '\n');

  // 1. DM 健康检查
  try {
    const r = await fetch(`${DM_BASE}/api/health`);
    const j = await r.json();
    if (r.ok && j.ok) pass('DM GET /api/health 返回 200 且 ok: true');
    else fail('DM GET /api/health', `${r.status} ${JSON.stringify(j)}`);
  } catch (e) {
    fail('DM GET /api/health', e.message);
  }

  // 2. DM /api/campaigns 无 token 应 401
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns`);
    if (r.status === 401) pass('DM GET /api/campaigns 无 token 返回 401');
    else fail('DM GET /api/campaigns 无 token', `期望 401，得到 ${r.status}`);
  } catch (e) {
    fail('DM GET /api/campaigns 无 token', e.message);
  }

  if (!email || !password) {
    console.log('\n未配置 E2E_TEST_EMAIL / E2E_TEST_PASSWORD，跳过 Bearer 登录验证。');
    printSummary();
    return;
  }

  // 3. 登录拿 token
  let token;
  try {
    const r = await fetch(`${CS_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json();
    if (!r.ok) {
      fail('角色卡 POST /api/auth/login', `${r.status} ${j.error || JSON.stringify(j)}`);
      printSummary();
      return;
    }
    token = j.token;
    if (token) pass('角色卡登录成功且返回 token');
    else fail('角色卡登录', '响应无 token（请确认已配置 JWT_SECRET）');
  } catch (e) {
    fail('角色卡 POST /api/auth/login', e.message);
    printSummary();
    return;
  }

  if (!token) {
    printSummary();
    return;
  }

  const bearer = { Authorization: `Bearer ${token}` };

  // 4. GET /api/auth/me 带 Bearer
  try {
    const r = await fetch(`${CS_BASE}/api/auth/me`, { headers: bearer });
    const j = await r.json();
    if (r.ok && j.isLoggedIn && j.user) pass('GET /api/auth/me 带 Bearer 返回 200 且含 user');
    else fail('GET /api/auth/me Bearer', `${r.status} ${JSON.stringify(j).slice(0, 80)}`);
  } catch (e) {
    fail('GET /api/auth/me Bearer', e.message);
  }

  // 5. GET /api/characters 带 Bearer
  try {
    const r = await fetch(`${CS_BASE}/api/characters`, { headers: bearer });
    const j = await r.json();
    if (r.ok && Array.isArray(j.characters)) pass('GET /api/characters 带 Bearer 返回 200 且含 characters 数组');
    else fail('GET /api/characters Bearer', `${r.status}`);
  } catch (e) {
    fail('GET /api/characters Bearer', e.message);
  }

  // 6. DM GET /api/campaigns 带 Bearer
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns`, { headers: bearer });
    const j = await r.json();
    if (r.ok && j.success && Array.isArray(j.campaigns)) pass('DM GET /api/campaigns 带 Bearer 返回 200 且 campaigns 数组');
    else fail('DM GET /api/campaigns Bearer', `${r.status} ${JSON.stringify(j).slice(0, 80)}`);
  } catch (e) {
    fail('DM GET /api/campaigns Bearer', e.message);
  }

  printSummary();
}

function printSummary() {
  console.log('\n--- 汇总 ---');
  console.log('通过:', results.ok.length);
  console.log('失败:', results.fail.length);
  if (results.fail.length) {
    results.fail.forEach(({ name, detail }) => console.log('  -', name, detail));
  }
  process.exit(results.fail.length > 0 ? 1 : 0);
}

main();
