/**
 * 调用角色卡服务：校验角色归属、拉取角色列表等。
 */

const BASE = process.env.CHARACTER_SHEET_API_URL || '';

/**
 * 用用户 JWT 请求角色卡「我的角色列表」，并校验 characterId 是否属于该用户。
 * authorizationHeader 为 "Bearer <token>" 或仅 "<token>"。
 */
export async function verifyCharacterBelongsToUser(
  characterId: string,
  authorizationHeader: string
): Promise<boolean> {
  if (!BASE) return false;
  const auth =
    authorizationHeader.startsWith('Bearer ') ? authorizationHeader : `Bearer ${authorizationHeader}`;
  const base = BASE.replace(/\/$/, '');
  const res = await fetch(`${base}/api/characters/`, {
    headers: { Authorization: auth },
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { characters?: { serverId?: string; id?: string }[] };
  const list = data.characters || [];
  return list.some(
    (c) => (c as { serverId?: string }).serverId === characterId || (c as { id?: string }).id === characterId
  );
}

export type FetchMyCharactersResult =
  | { ok: true; characters: { serverId: string; name?: string; [k: string]: unknown }[] }
  | { ok: false; status: number; characters: never[] };

/**
 * 用用户 JWT 拉取角色列表（供加入战役选角色等）。
 * authorizationHeader 为 "Bearer <token>"。
 * 返回 ok:false 且 status===401 表示角色卡拒绝了 token（常见为 JWT_SECRET 不一致）。
 */
export async function fetchMyCharacters(authorizationHeader: string): Promise<FetchMyCharactersResult> {
  if (!BASE) return { ok: false, status: 0, characters: [] };
  const base = BASE.replace(/\/$/, '');
  const url = `${base}/api/characters/`;
  const res = await fetch(url, {
    headers: { Authorization: authorizationHeader },
  });
  if (!res.ok) {
    console.warn('[DM→角色卡] GET', url, '→', res.status, '(若为 401 多为 JWT_SECRET 不一致)');
    return { ok: false, status: res.status, characters: [] };
  }
  const data = (await res.json()) as { characters?: { serverId?: string; name?: string; [k: string]: unknown }[] };
  const list = data.characters || [];
  const characters = list.map((c) => ({
    ...c,
    serverId: (c as { serverId?: string }).serverId ?? (c as { id?: string }).id ?? '',
  }));
  if (characters.length === 0) {
    console.warn('[DM→角色卡] GET', url, '→ 200 但角色数为 0，请确认当前登录账号与在 3000 看到角色的账号一致');
  }
  return { ok: true, characters };
}

/** 角色卡返回的单个角色数据结构（用于先攻等） */
export interface CharacterDataFromSheet {
  name?: string;
  level?: number;
  abilities?: { dexterity?: number; [k: string]: unknown };
  /** 背景属性加值，与角色卡一致，如 { "敏捷": 2 } */
  backgroundAbilityBonuses?: Record<string, number>;
  feats?: string[];
  /** 头像/立绘：角色卡存的是 avatar，可为 data URL 或图片 URL */
  avatar?: string;
  [k: string]: unknown;
}

/**
 * 从角色卡返回的角色数据中取头像 URL（角色卡字段为 avatar，可为 data URL 或外链）
 */
export function getAvatarFromCharacter(char: CharacterDataFromSheet | null): string | null {
  if (!char) return null;
  const c = char as { avatar?: string; avatarUrl?: string };
  if (typeof c.avatar === 'string' && c.avatar.trim()) return c.avatar;
  if (typeof c.avatarUrl === 'string' && c.avatarUrl.trim()) return c.avatarUrl;
  return null;
}

/**
 * 用用户 JWT 拉取单个角色详情（GET /api/characters/[id]）。
 * 仅当该角色属于该用户时角色卡才返回 200。
 */
export async function fetchCharacterById(
  characterId: string,
  authorizationHeader: string
): Promise<CharacterDataFromSheet | null> {
  if (!BASE) return null;
  const auth =
    authorizationHeader.startsWith('Bearer ') ? authorizationHeader : `Bearer ${authorizationHeader}`;
  const base = BASE.replace(/\/$/, '');
  const res = await fetch(`${base}/api/characters/${characterId}`, {
    headers: { Authorization: auth },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { character?: CharacterDataFromSheet };
  return data.character ?? null;
}

/** 敏捷调整值 */
function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** 熟练加值（与角色卡 dnd-data 一致） */
function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

/**
 * 根据角色卡数据计算先攻调整值：与角色卡展示一致。
 * 敏捷（含背景加值）的调整值 + 警觉专长时加熟练加值。
 */
export function computeInitiativeBonusFromCharacter(char: CharacterDataFromSheet): number {
  const rawDex = char.abilities?.dexterity;
  const dexBase = typeof rawDex === 'number' ? rawDex : typeof rawDex === 'string' ? parseInt(String(rawDex), 10) : 10;
  const dexBonus = typeof char.backgroundAbilityBonuses?.['敏捷'] === 'number'
    ? char.backgroundAbilityBonuses['敏捷']
    : 0;
  const dex = Number.isNaN(dexBase) ? 10 : dexBase + dexBonus;
  const level = typeof char.level === 'number' ? char.level : 1;
  let bonus = getAbilityModifier(dex);
  if (char.feats?.includes('alert')) {
    bonus += getProficiencyBonus(level);
  }
  return bonus;
}
