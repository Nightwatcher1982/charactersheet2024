/**
 * 阶段 2 e2e 验证：遭遇与先攻
 * 验证项（见 docs/DM工具分阶段任务与验证计划.md 4.2）：
 * - 非 DM 请求先攻列表时 NPC 条目无 notes、ac、hp
 * - 玩家 PATCH 他人 HP → 403；DM PATCH 任意 HP → 200
 * - next-turn 后 currentTurnIndex 递增，列表顺序与高亮一致
 *
 * 依赖：
 * - scripts/create-test-users.ts 已创建 member@test.com / player@test.com
 * - 角色卡(3000)、DM(3001) 已启动。若 DM 端口不同，设 DM_SERVICE_URL=http://localhost:PORT
 * - DM 服务需在「执行过 prisma migrate + prisma generate」后启动，否则创建遭遇会 500
 *
 * 运行：node scripts/verify-phase2.mjs
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

async function ensurePlayerCharacter(playerBearer, csBase) {
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
    if (r.ok && j.serverId) return j.serverId;
    throw new Error(j.error || '创建角色失败');
  }
  return list[0].serverId || list[0].id;
}

async function main() {
  console.log('--- 阶段 2 e2e 验证（遭遇与先攻）---\n');
  console.log('角色卡:', CS_BASE, '| DM:', DM_BASE, '\n');

  let memberToken, playerToken;
  try {
    memberToken = await login(MEMBER_EMAIL, MEMBER_PASSWORD);
    pass('会员登录');
  } catch (e) {
    fail('会员登录', e.message);
    printSummary();
    return;
  }
  try {
    playerToken = await login(PLAYER_EMAIL, PLAYER_PASSWORD);
    pass('玩家登录');
  } catch (e) {
    fail('玩家登录', e.message);
    printSummary();
    return;
  }

  const memberBearer = { Authorization: `Bearer ${memberToken}` };
  const playerBearer = { Authorization: `Bearer ${playerToken}` };
  const csBase = CS_BASE.replace(/\/$/, '');

  let campaignId, inviteCode;
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...memberBearer },
      body: JSON.stringify({ name: '阶段2验证战役' }),
    });
    const j = await r.json();
    if (r.status !== 201 || !j.campaign?.inviteCode) {
      fail('创建战役', `${r.status} ${j.error || ''}`);
      printSummary();
      return;
    }
    campaignId = j.campaign.id;
    inviteCode = j.campaign.inviteCode;
    pass('创建战役');
  } catch (e) {
    fail('创建战役', e.message);
    printSummary();
    return;
  }

  let characterId;
  try {
    characterId = await ensurePlayerCharacter(playerBearer, csBase);
    pass('玩家角色就绪');
  } catch (e) {
    fail('玩家角色', e.message);
    printSummary();
    return;
  }

  try {
    const r = await fetch(`${DM_BASE}/api/campaigns/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...playerBearer },
      body: JSON.stringify({ inviteCode, characterId }),
    });
    if (r.status !== 200) {
      const j = await r.json();
      fail('玩家加入战役', `${r.status} ${j.error || ''}`);
    } else pass('玩家加入战役');
  } catch (e) {
    fail('玩家加入战役', e.message);
  }

  let encounterId;
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns/${campaignId}/encounters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...memberBearer },
      body: JSON.stringify({ name: '验证遭遇' }),
    });
    const text = await r.text();
    let j;
    try {
      j = text ? JSON.parse(text) : {};
    } catch (_) {
      fail('创建遭遇', `${r.status} 响应非 JSON: ${text.slice(0, 80)}`);
      printSummary();
      return;
    }
    if (r.status !== 201 || !j.encounter?.id) {
      const msg = j.error || j.message || text?.slice(0, 200) || '';
      fail('创建遭遇', `${r.status} ${msg}`);
      if (r.status >= 500) console.log('  响应体:', text?.slice(0, 500));
      printSummary();
      return;
    }
    encounterId = j.encounter.id;
    pass('创建遭遇');
  } catch (e) {
    fail('创建遭遇', e.message);
    printSummary();
    return;
  }

  try {
    await fetch(`${DM_BASE}/api/campaigns/${campaignId}/encounters/${encounterId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...memberBearer },
      body: JSON.stringify({ isActive: true }),
    });
    pass('设置当前遭遇');
  } catch (e) {
    fail('设置当前遭遇', e.message);
  }

  let npcEntryId, playerEntryId;
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns/${campaignId}/encounters/${encounterId}/initiative`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...memberBearer },
      body: JSON.stringify({
        type: 'npc',
        name: '验证用NPC',
        initiativeBonus: 2,
        hp: 30,
        maxHp: 30,
        ac: 14,
        notes: '仅DM可见',
      }),
    });
    const j = await r.json();
    if (r.status !== 201 || !j.entry?.id) {
      fail('添加 NPC 条目', `${r.status} ${j.error || ''}`);
      printSummary();
      return;
    }
    npcEntryId = j.entry.id;
    pass('添加 NPC 条目');
  } catch (e) {
    fail('添加 NPC 条目', e.message);
    printSummary();
    return;
  }

  let playerUserId;
  try {
    const meRes = await fetch(`${DM_BASE}/api/auth/me`, { headers: playerBearer });
    const meData = await meRes.json();
    playerUserId = meData?.user?.userId;
    if (playerUserId) pass('获取玩家 userId');
  } catch (e) {
    fail('获取玩家 userId', e.message);
  }

  if (playerUserId) {
    try {
      const r = await fetch(`${DM_BASE}/api/campaigns/${campaignId}/encounters/${encounterId}/initiative`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...memberBearer },
        body: JSON.stringify({ type: 'player', userId: playerUserId, characterId }),
      });
      const j = await r.json();
      if (r.status !== 201 || !j.entry?.id) {
        fail('添加玩家条目', `${r.status} ${j.error || ''}`);
      } else {
        playerEntryId = j.entry.id;
        pass('添加玩家条目');
      }
    } catch (e) {
      fail('添加玩家条目', e.message);
    }
  }

  const initiativeUrl = `${DM_BASE}/api/campaigns/${campaignId}/encounters/${encounterId}/initiative`;

  const getInitiativeAsDm = await fetch(initiativeUrl, { headers: memberBearer }).then((r) => r.json());
  const getInitiativeAsPlayer = await fetch(initiativeUrl, { headers: playerBearer }).then((r) => r.json());

  const npcAsDm = getInitiativeAsDm?.entries?.find((e) => e.id === npcEntryId);
  const npcAsPlayer = getInitiativeAsPlayer?.entries?.find((e) => e.id === npcEntryId);

  if (npcAsDm && (npcAsDm.ac !== undefined && npcAsDm.ac !== null || npcAsDm.notes != null)) {
    pass('DM 请求先攻列表时 NPC 含 ac/notes');
  } else {
    fail('DM 请求先攻列表时 NPC 含 ac/notes', npcAsDm ? 'NPC 条目缺少 ac 或 notes' : '未找到 NPC 条目');
  }

  if (npcAsPlayer && npcAsPlayer.ac === null && npcAsPlayer.notes === null && (npcAsPlayer.hp === null || npcAsPlayer.hp === undefined)) {
    pass('非 DM 请求先攻列表时 NPC 无 notes、ac、hp');
  } else {
    fail('非 DM 请求先攻列表时 NPC 无 notes/ac/hp', npcAsPlayer ? `得到 ac=${npcAsPlayer.ac} notes=${npcAsPlayer.notes} hp=${npcAsPlayer.hp}` : '未找到 NPC 条目');
  }

  const patchHp = (token, entryId, hp) =>
    fetch(`${DM_BASE}/api/campaigns/${campaignId}/encounters/${encounterId}/initiative/${entryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ hp }),
    });

  if (playerEntryId) {
    const playerPatchOwn = await patchHp(playerToken, playerEntryId, 8);
    if (playerPatchOwn.status === 200) pass('玩家 PATCH 自己 HP → 200');
    else fail('玩家 PATCH 自己 HP', `期望 200，得到 ${playerPatchOwn.status}`);
  } else {
    fail('玩家 PATCH 自己 HP', '缺少 playerEntryId，跳过');
  }

  const playerPatchOther = await patchHp(playerToken, npcEntryId, 25);
  if (playerPatchOther.status === 403) pass('玩家 PATCH 他人 HP → 403');
  else fail('玩家 PATCH 他人 HP', `期望 403，得到 ${playerPatchOther.status}`);

  const dmPatchAny = await patchHp(memberToken, npcEntryId, 28);
  if (dmPatchAny.status === 200) pass('DM PATCH 任意 HP → 200');
  else fail('DM PATCH 任意 HP', `期望 200，得到 ${dmPatchAny.status}`);

  const beforeTurn = await fetch(initiativeUrl, { headers: memberBearer }).then((r) => r.json());
  const turnIndexBefore = beforeTurn?.encounter?.currentTurnIndex ?? 0;

  const nextRes = await fetch(`${DM_BASE}/api/campaigns/${campaignId}/encounters/${encounterId}/initiative/next-turn`, {
    method: 'POST',
    headers: { ...memberBearer },
  });
  if (nextRes.status !== 200) {
    fail('POST next-turn', `${nextRes.status}`);
  } else pass('POST next-turn 返回 200');

  const afterTurn = await fetch(initiativeUrl, { headers: memberBearer }).then((r) => r.json());
  const turnIndexAfter = afterTurn?.encounter?.currentTurnIndex ?? -1;
  const count = afterTurn?.entries?.length ?? 0;
  const expectedIndex = count > 0 ? (turnIndexBefore + 1 >= count ? 0 : turnIndexBefore + 1) : 0;
  if (nextRes.status === 200 && (turnIndexAfter === expectedIndex || (turnIndexBefore + 1 >= count && turnIndexAfter === 0))) {
    pass('next-turn 后 currentTurnIndex 正确');
  } else {
    fail('next-turn 后 currentTurnIndex', `before=${turnIndexBefore} after=${turnIndexAfter} count=${count}`);
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
