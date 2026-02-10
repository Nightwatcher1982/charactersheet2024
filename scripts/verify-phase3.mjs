/**
 * 阶段 3 e2e 验证：事件流与日志框（SSE + 写事件）
 * 验证项（见 docs/DM工具分阶段任务与验证计划.md 5.2）：
 * - SSE：打开 events/stream，在另一请求中触发 next-turn 或 hp_change，SSE 端应收到对应 event
 * - GET events 分页能拉取到刚写入的事件
 *
 * 依赖：同阶段 2（create-test-users、角色卡 3000、DM 服务已启动且 migrate+generate）。
 * 若 DM 端口非 3001，设 DM_SERVICE_URL=http://localhost:PORT
 * 运行：node scripts/verify-phase3.mjs
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

/**
 * 在 Node 里用 fetch 订阅 SSE，收集事件；返回 { received: [], close: () => void }
 */
function subscribeSSE(dmBase, campaignId, token) {
  const received = [];
  const url = `${dmBase}/api/campaigns/${campaignId}/events/stream?token=${encodeURIComponent(token)}`;
  const ac = new AbortController();
  let buffer = '';

  const pump = async () => {
    const r = await fetch(url, { signal: ac.signal });
    if (!r.ok || !r.body) return;
    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';
        for (const part of parts) {
          const line = part.split('\n').find((l) => l.startsWith('data: '));
          if (line) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type) received.push(data);
            } catch (_) {}
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') received.push({ _error: String(err) });
    }
  };

  const p = pump();
  return {
    received,
    close: () => {
      ac.abort();
    },
    done: () => p,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('--- 阶段 3 e2e 验证（事件流与 SSE）---\n');
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
      body: JSON.stringify({ name: '阶段3验证战役' }),
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
    if (r.status !== 200) fail('玩家加入战役', `${r.status}`);
    else pass('玩家加入战役');
  } catch (e) {
    fail('玩家加入战役', e.message);
  }

  let encounterId, npcEntryId, playerEntryId;
  try {
    let r = await fetch(`${DM_BASE}/api/campaigns/${campaignId}/encounters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...memberBearer },
      body: JSON.stringify({ name: '阶段3遭遇' }),
    });
    let j = await r.json();
    if (r.status !== 201 || !j.encounter?.id) {
      fail('创建遭遇', `${r.status} ${j.error || ''}`);
      printSummary();
      return;
    }
    encounterId = j.encounter.id;
    pass('创建遭遇');

    await fetch(`${DM_BASE}/api/campaigns/${campaignId}/encounters/${encounterId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...memberBearer },
      body: JSON.stringify({ isActive: true }),
    });

    r = await fetch(`${DM_BASE}/api/campaigns/${campaignId}/encounters/${encounterId}/initiative`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...memberBearer },
      body: JSON.stringify({ type: 'npc', name: '阶段3NPC', hp: 20, maxHp: 20 }),
    });
    j = await r.json();
    if (r.status !== 201 || !j.entry?.id) {
      fail('添加 NPC', `${r.status}`);
      printSummary();
      return;
    }
    npcEntryId = j.entry.id;

    const meRes = await fetch(`${DM_BASE}/api/auth/me`, { headers: playerBearer });
    const meData = await meRes.json();
    const playerUserId = meData?.user?.userId;
    if (playerUserId) {
      r = await fetch(`${DM_BASE}/api/campaigns/${campaignId}/encounters/${encounterId}/initiative`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...memberBearer },
        body: JSON.stringify({ type: 'player', userId: playerUserId, characterId }),
      });
      j = await r.json();
      if (r.ok && j.entry?.id) playerEntryId = j.entry.id;
    }
    pass('遭遇与先攻就绪');
  } catch (e) {
    fail('遭遇与先攻', e.message);
    printSummary();
    return;
  }

  const initiativeUrl = `${DM_BASE}/api/campaigns/${campaignId}/encounters/${encounterId}/initiative`;
  const nextTurnUrl = `${initiativeUrl}/next-turn`;

  // 1) 先拉一次历史，确认 GET events 可用
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns/${campaignId}/events?limit=10`, { headers: memberBearer });
    const j = await r.json();
    if (!r.ok) fail('GET events 分页', `${r.status}`);
    else if (!Array.isArray(j.events)) fail('GET events 分页', '无 events 数组');
    else pass('GET events 分页');
  } catch (e) {
    fail('GET events 分页', e.message);
  }

  // 2) 订阅 SSE，触发 next-turn，断言收到 turn_advance
  const sse = subscribeSSE(DM_BASE, campaignId, memberToken);
  await sleep(500);

  const nextRes = await fetch(nextTurnUrl, { method: 'POST', headers: memberBearer });
  if (nextRes.status !== 200) {
    fail('POST next-turn 触发', `${nextRes.status}`);
  } else {
    pass('POST next-turn 触发');
  }

  for (let i = 0; i < 10; i++) {
    await sleep(400);
    if (sse.received.some((e) => e.type === 'turn_advance')) break;
  }
  const turnAdvance = sse.received.find((e) => e.type === 'turn_advance');
  if (turnAdvance) {
    pass('SSE 收到 turn_advance 事件');
  } else {
    fail('SSE 收到 turn_advance', `收到事件数: ${sse.received.length}, 类型: ${sse.received.map((e) => e.type).join(', ') || '无'}`);
  }
  sse.close();

  // 3) 再次订阅，触发 PATCH hp，断言收到 hp_change
  const sse2 = subscribeSSE(DM_BASE, campaignId, memberToken);
  await sleep(500);

  const patchRes = await fetch(`${initiativeUrl}/${npcEntryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...memberBearer },
    body: JSON.stringify({ hp: 15 }),
  });
  if (patchRes.status !== 200) {
    fail('PATCH HP 触发', `${patchRes.status}`);
  } else {
    pass('PATCH HP 触发');
  }

  for (let i = 0; i < 10; i++) {
    await sleep(400);
    if (sse2.received.some((e) => e.type === 'hp_change')) break;
  }
  const hpChange = sse2.received.find((e) => e.type === 'hp_change');
  if (hpChange) {
    pass('SSE 收到 hp_change 事件');
  } else {
    fail('SSE 收到 hp_change', `收到事件数: ${sse2.received.length}, 类型: ${sse2.received.map((e) => e.type).join(', ') || '无'}`);
  }
  sse2.close();

  // 4) GET events 应包含 turn_advance 与 hp_change
  try {
    const r = await fetch(`${DM_BASE}/api/campaigns/${campaignId}/events?limit=20`, { headers: memberBearer });
    const j = await r.json();
    const events = j.events || [];
    const hasTurn = events.some((e) => e.type === 'turn_advance');
    const hasHp = events.some((e) => e.type === 'hp_change');
    if (hasTurn && hasHp) pass('GET events 含 turn_advance 与 hp_change');
    else fail('GET events 含写入事件', `turn_advance: ${hasTurn}, hp_change: ${hasHp}`);
  } catch (e) {
    fail('GET events 含写入事件', e.message);
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
