/**
 * 阶段 1 完整验证：会员创建战役 + 玩家加入战役
 * 依赖 scripts/create-test-users.ts 已创建 member@test.com / player@test.com
 * 需先启动：角色卡（3000）、DM 服务（3001）
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

const CS_BASE = process.env.CHARACTER_SHEET_URL || 'http://localhost:3000';
const DM_BASE = process.env.DM_SERVICE_URL || 'http://localhost:3001';

const MEMBER_EMAIL = 'member@test.com';
const MEMBER_PASSWORD = 'TestMember123!';
const PLAYER_EMAIL = 'player@test.com';
const PLAYER_PASSWORD = 'TestPlayer123!';

const results = { ok: [], fail: [] };
function pass(name) {
  results.ok.push(name);
  console.log('✔', name);
}
function fail(name, detail) {
  results.fail.push({ name, detail });
  console.log('✗', name, detail);
}

async function login(email, password) {
  const r = await fetch(`${CS_BASE.replace(/\/$/, '')}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json();
  if (!r.ok || !j.token) throw new Error(j.error || '登录失败');
  return j.token;
}

async function main() {
  console.log('--- 阶段 1 完整验证（会员创建 + 玩家加入）---\n');
  console.log('角色卡:', CS_BASE, '| DM:', DM_BASE, '\n');

  let memberToken;
  let playerToken;
  try {
    memberToken = await login(MEMBER_EMAIL, MEMBER_PASSWORD);
    pass('会员登录并取得 JWT');
  } catch (e) {
    fail('会员登录', e.message);
    printSummary();
    return;
  }
  try {
    playerToken = await login(PLAYER_EMAIL, PLAYER_PASSWORD);
    pass('玩家登录并取得 JWT');
  } catch (e) {
    fail('玩家登录', e.message);
    printSummary();
    return;
  }

  const memberBearer = { Authorization: `Bearer ${memberToken}` };
  const playerBearer = { Authorization: `Bearer ${playerToken}` };

  // 会员创建战役
  let campaignId;
  let inviteCode;
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...memberBearer },
      body: JSON.stringify({ name: '完整验证测试战役' }),
    });
    const j = await r.json();
    if (r.status !== 201 || !j.campaign?.inviteCode) {
      fail('会员创建战役', `${r.status} ${j.error || JSON.stringify(j).slice(0, 100)}`);
    } else {
      campaignId = j.campaign.id;
      inviteCode = j.campaign.inviteCode;
      pass('会员创建战役返回 201 且含 inviteCode');
    }
  } catch (e) {
    fail('会员创建战役', e.message);
  }

  if (!inviteCode) {
    printSummary();
    return;
  }

  // 玩家拉取角色列表，若无则创建最小角色
  let characterId;
  try {
    const csBase = CS_BASE.replace(/\/$/, '');
    let r = await fetch(`${csBase}/api/characters`, { headers: playerBearer });
    let j = await r.json();
    let list = j.characters || [];
    if (list.length === 0) {
      const minChar = {
        id: 'test-char-' + Date.now(),
        name: '测试角色',
        class: '战士',
        species: '人类',
        background: '士兵',
        level: 1,
        abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        alignment: '中立',
        hitPoints: 10,
        armorClass: 10,
        skills: [],
        proficiencies: [],
        equipment: [],
        spells: [],
        features: [],
        backstory: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      r = await fetch(`${csBase}/api/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...playerBearer },
        body: JSON.stringify(minChar),
      });
      j = await r.json();
      if (r.ok && j.serverId) {
        characterId = j.serverId;
        pass('玩家无角色时创建最小角色');
      } else {
        fail('玩家创建角色', `${r.status} ${j.error || ''}`);
      }
    } else {
      characterId = list[0].serverId || list[0].id;
      pass('玩家已有角色，使用第一个');
    }
  } catch (e) {
    fail('玩家角色列表/创建', e.message);
  }

  if (!characterId) {
    printSummary();
    return;
  }

  // 玩家加入战役
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...playerBearer },
      body: JSON.stringify({ inviteCode, characterId }),
    });
    const j = await r.json();
    if (r.status !== 200) {
      fail('玩家加入战役', `${r.status} ${j.error || ''}`);
    } else {
      pass('玩家加入战役返回 200');
    }
  } catch (e) {
    fail('玩家加入战役', e.message);
  }

  // 玩家 GET /api/campaigns 应包含该战役
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns`, { headers: playerBearer });
    const j = await r.json();
    const found = j.campaigns?.some((c) => c.id === campaignId);
    if (found) pass('玩家战役列表包含已加入的战役');
    else fail('玩家战役列表', '未包含刚加入的战役');
  } catch (e) {
    fail('玩家战役列表', e.message);
  }

  // 玩家 GET /api/campaigns/[id] 可访问战役详情
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns/${campaignId}`, { headers: playerBearer });
    const j = await r.json();
    if (r.ok && j.campaign?.id === campaignId) pass('玩家可访问战役详情');
    else fail('玩家访问战役详情', `${r.status}`);
  } catch (e) {
    fail('玩家访问战役详情', e.message);
  }

  // 非 DM 用户 PATCH 战役应 403
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...playerBearer },
      body: JSON.stringify({ name: '尝试篡改' }),
    });
    if (r.status === 403) pass('非 DM PATCH 战役返回 403');
    else fail('非 DM PATCH 战役', `期望 403，得到 ${r.status}`);
  } catch (e) {
    fail('非 DM PATCH 战役', e.message);
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
