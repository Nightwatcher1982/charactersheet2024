/**
 * 验证「测试用户选择已创建角色并加入战役」完整场景
 *
 * 前置条件：
 * - 角色卡服务已启动（默认 3000）
 * - DM 战役服务已启动（默认 3001）
 * - 已执行 npx tsx scripts/create-test-users.ts 创建 member@test.com / player@test.com
 * - 玩家账号（player@test.com）在角色卡中至少有一个角色（可先登录角色卡创建）
 *
 * 运行：在项目根目录执行 node scripts/verify-join-campaign-flow.mjs
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

const CS_BASE = (process.env.CHARACTER_SHEET_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
const DM_BASE = (process.env.DM_SERVICE_URL || 'http://localhost:3001').replace(/\/$/, '');

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

async function loginCS(email, password) {
  const r = await fetch(`${CS_BASE}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json();
  if (!r.ok || !j.token) throw new Error(j.error || '登录失败');
  return j.token;
}

async function main() {
  console.log('--- 加入战役场景验证：测试用户选择已创建角色并加入 ---\n');
  console.log('角色卡:', CS_BASE, '| DM 服务:', DM_BASE, '\n');

  let memberToken;
  let playerToken;
  try {
    memberToken = await loginCS(MEMBER_EMAIL, MEMBER_PASSWORD);
    pass('会员登录角色卡并取得 JWT');
  } catch (e) {
    fail('会员登录', e.message);
    printSummary();
    return;
  }
  try {
    playerToken = await loginCS(PLAYER_EMAIL, PLAYER_PASSWORD);
    pass('玩家登录角色卡并取得 JWT');
  } catch (e) {
    fail('玩家登录', e.message);
    printSummary();
    return;
  }

  const memberBearer = { Authorization: `Bearer ${memberToken}` };
  const playerBearer = { Authorization: `Bearer ${playerToken}` };

  // 1. 会员在 DM 创建战役，拿到邀请码
  let campaignId;
  let inviteCode;
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...memberBearer },
      body: JSON.stringify({ name: '加入战役验证测试' }),
    });
    const j = await r.json();
    if (r.status !== 201 || !j.campaign?.inviteCode) {
      fail('会员创建战役', `${r.status} ${j.error || JSON.stringify(j).slice(0, 120)}`);
    } else {
      campaignId = j.campaign.id;
      inviteCode = j.campaign.inviteCode;
      pass('会员创建战役，获得邀请码 ' + inviteCode);
    }
  } catch (e) {
    fail('会员创建战役', e.message);
  }

  if (!inviteCode) {
    printSummary();
    return;
  }

  // 2. 玩家从角色卡拉取「我的角色」列表（直接调角色卡）
  let characterIdFromCS;
  try {
    const r = await fetch(`${CS_BASE}/api/characters/`, {
      headers: playerBearer,
    });
    const j = await r.json();
    const list = j.characters || [];
    if (list.length === 0) {
      fail('玩家角色列表', '玩家在角色卡中暂无角色，请先用 player@test.com 登录角色卡并创建至少一个角色');
    } else {
      characterIdFromCS = list[0].serverId ?? list[0].id;
      pass(`玩家在角色卡中已有 ${list.length} 个角色，使用第一个 (id=${characterIdFromCS})`);
    }
  } catch (e) {
    fail('玩家从角色卡拉取角色列表', e.message);
  }

  if (!characterIdFromCS) {
    printSummary();
    return;
  }

  // 3. 玩家通过 DM 服务拉取角色列表（DM 代理到角色卡）—— 关键：加入页用的就是这个接口
  try {
    const r = await fetch(`${DM_BASE}/api/characters`, {
      headers: playerBearer,
    });
    const j = await r.json();
    if (r.status === 503) {
      fail('DM 拉取角色列表', j.error || '503，请检查 DM 服务 .env 中 CHARACTER_SHEET_API_URL');
    } else if (r.status !== 200) {
      fail('DM 拉取角色列表', `${r.status} ${j.error || ''}`);
    } else {
      const list = j.characters || [];
      const found = list.some(
        (c) => (c.serverId || c.id) === characterIdFromCS
      );
      if (list.length === 0) {
        fail('DM 拉取角色列表', '返回 200 但 characters 为空，请检查 DM 是否配置 CHARACTER_SHEET_API_URL 并指向角色卡');
      } else if (!found) {
        fail('DM 拉取角色列表', `返回 ${list.length} 个角色，但不包含玩家在角色卡中的角色 id=${characterIdFromCS}`);
      } else {
        pass('DM GET /api/characters 能正确返回玩家已创建的角色（可支撑加入页选择角色）');
      }
    }
  } catch (e) {
    fail('DM 拉取角色列表', e.message);
  }

  // 4. 玩家用邀请码 + 角色 ID 调用 DM 加入战役
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...playerBearer },
      body: JSON.stringify({
        inviteCode,
        characterId: characterIdFromCS,
      }),
    });
    const j = await r.json();
    if (r.status !== 200) {
      fail('玩家加入战役', `${r.status} ${j.error || ''}`);
    } else {
      pass('玩家加入战役成功');
    }
  } catch (e) {
    fail('玩家加入战役', e.message);
  }

  // 5. 玩家战役列表应包含刚加入的战役
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns`, { headers: playerBearer });
    const j = await r.json();
    const found = j.campaigns?.some((c) => c.id === campaignId);
    if (found) pass('玩家战役列表包含已加入的战役');
    else fail('玩家战役列表', '未包含刚加入的战役');
  } catch (e) {
    fail('玩家战役列表', e.message);
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
