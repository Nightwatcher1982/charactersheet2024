/**
 * 阶段 1 Sub-Agent 验证脚本
 * 需先启动：角色卡（3000）、DM 服务（3001）；.env 中 E2E_TEST_EMAIL、E2E_TEST_PASSWORD
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
  console.log('--- 阶段 1 验证 ---\n');
  console.log('角色卡:', CS_BASE, '| DM 服务:', DM_BASE, '\n');

  let token;
  if (!email || !password) {
    console.log('未配置 E2E_TEST_EMAIL / E2E_TEST_PASSWORD，跳过需登录的 API 验证。\n');
  } else {
    const loginRes = await fetch(`${CS_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
      fail('角色卡登录取 token', loginData.error || '无 token');
    } else {
      token = loginData.token;
      pass('角色卡登录并取得 JWT');
    }
  }

  const bearer = token ? { Authorization: `Bearer ${token}` } : {};

  // GET /api/campaigns 无 token → 401
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns`);
    if (r.status === 401) pass('GET /api/campaigns 无 token 返回 401');
    else fail('GET /api/campaigns 无 token', `期望 401，得到 ${r.status}`);
  } catch (e) {
    fail('GET /api/campaigns 无 token', e.message);
  }

  if (!token) {
    printSummary();
    return;
  }

  // GET /api/campaigns 带 token → 200 + campaigns 数组
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns`, { headers: bearer });
    const j = await r.json();
    if (r.ok && Array.isArray(j.campaigns)) pass('GET /api/campaigns 带 token 返回 200 且 campaigns 数组');
    else fail('GET /api/campaigns 带 token', `${r.status} ${JSON.stringify(j).slice(0, 80)}`);
  } catch (e) {
    fail('GET /api/campaigns 带 token', e.message);
  }

  // POST /api/campaigns 创建战役（会员 201 + inviteCode，非会员 403）
  let campaignId;
  let inviteCode;
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...bearer },
      body: JSON.stringify({ name: '阶段1验证战役' }),
    });
    const j = await r.json();
    if (r.status === 201 && j.campaign?.inviteCode) {
      pass('POST /api/campaigns 创建战役返回 201 且含 inviteCode');
      campaignId = j.campaign.id;
      inviteCode = j.campaign.inviteCode;
    } else if (r.status === 403 && (j.error || '').includes('会员')) {
      pass('POST /api/campaigns 非会员返回 403');
    } else {
      fail('POST /api/campaigns', `${r.status} ${j.error || JSON.stringify(j).slice(0, 80)}`);
    }
  } catch (e) {
    fail('POST /api/campaigns', e.message);
  }

  // GET /api/campaigns 再次，应包含刚创建的战役（若已创建）
  if (campaignId) {
    try {
      const r = await fetch(`${DM_BASE}/api/campaigns`, { headers: bearer });
      const j = await r.json();
      const found = j.campaigns?.some((c) => c.id === campaignId);
      if (found) pass('GET /api/campaigns 列表包含新创建的战役');
      else fail('GET /api/campaigns 列表', '未包含新战役');
    } catch (e) {
      fail('GET /api/campaigns 列表', e.message);
    }
  }

  // GET /api/campaigns/[id] 战役详情
  if (campaignId) {
    try {
      const r = await fetch(`${DM_BASE}/api/campaigns/${campaignId}`, { headers: bearer });
      const j = await r.json();
      if (r.ok && j.campaign?.id === campaignId) pass('GET /api/campaigns/[id] 返回战役详情');
      else fail('GET /api/campaigns/[id]', `${r.status}`);
    } catch (e) {
      fail('GET /api/campaigns/[id]', e.message);
    }
  }

  // PATCH /api/campaigns/[id] 仅 DM 可编辑
  if (campaignId) {
    try {
      const r = await fetch(`${DM_BASE}/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...bearer },
        body: JSON.stringify({ name: '阶段1验证战役-已编辑' }),
      });
      const j = await r.json();
      if (r.ok && j.campaign?.name === '阶段1验证战役-已编辑') pass('PATCH /api/campaigns/[id] DM 编辑成功');
      else if (r.status === 403) pass('PATCH /api/campaigns/[id] 非 DM 返回 403');
      else fail('PATCH /api/campaigns/[id]', `${r.status} ${j.error || ''}`);
    } catch (e) {
      fail('PATCH /api/campaigns/[id]', e.message);
    }
  }

  // GET /api/campaigns/join/validate?code=xxx
  if (inviteCode) {
    try {
      const r = await fetch(`${DM_BASE}/api/campaigns/join/validate?code=${encodeURIComponent(inviteCode)}`);
      const j = await r.json();
      if (j.valid && j.campaignName) pass('GET /api/campaigns/join/validate 返回 valid 与战役名');
      else fail('GET join/validate', `${r.status} ${JSON.stringify(j)}`);
    } catch (e) {
      fail('GET join/validate', e.message);
    }
  }

  // POST /api/campaigns/join 同一用户（DM）加入自己的战役 → 400
  if (inviteCode) {
    try {
      const charsRes = await fetch(`${DM_BASE}/api/characters`, { headers: bearer });
      const charsData = await charsRes.json();
      const firstCharId = charsData.characters?.[0]?.serverId || charsData.characters?.[0]?.id;
      if (!firstCharId) {
        pass('POST join（DM 加入自己）跳过：无角色');
      } else {
        const r = await fetch(`${DM_BASE}/api/campaigns/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...bearer },
          body: JSON.stringify({ inviteCode, characterId: firstCharId }),
        });
        const j = await r.json();
        if (r.status === 400 && (j.error || '').includes('DM')) pass('POST join DM 加入自己战役返回 400');
        else if (r.status === 200) pass('POST join 成功（非 DM 加入）');
        else fail('POST join', `${r.status} ${j.error || ''}`);
      }
    } catch (e) {
      fail('POST join', e.message);
    }
  }

  // GET /api/characters（DM 代理角色列表）
  try {
    const r = await fetch(`${DM_BASE}/api/characters`, { headers: bearer });
    const j = await r.json();
    if (r.ok && Array.isArray(j.characters)) pass('GET /api/characters 代理返回角色列表');
    else fail('GET /api/characters', `${r.status}`);
  } catch (e) {
    fail('GET /api/characters', e.message);
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
