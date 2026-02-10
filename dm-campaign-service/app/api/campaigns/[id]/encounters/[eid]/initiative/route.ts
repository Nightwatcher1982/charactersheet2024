import { NextRequest, NextResponse } from 'next/server';
import { getEncounterAndAuth } from '@/lib/initiative-utils';
import {
  fetchCharacterById,
  computeInitiativeBonusFromCharacter,
  getAvatarFromCharacter,
} from '@/lib/character-sheet';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function sortEntries<T extends { currentInitiative: number | null; orderIndex: number }>(
  entries: T[]
): T[] {
  return [...entries].sort((a, b) => {
    const ai = a.currentInitiative ?? -999;
    const bi = b.currentInitiative ?? -999;
    if (bi !== ai) return bi - ai;
    return a.orderIndex - b.orderIndex;
  });
}

/**
 * GET /api/campaigns/[id]/encounters/[eid]/initiative - 先攻列表
 * 已加入战役的成员会自动出现在先攻中（无条目则创建占位），玩家可自行掷先攻；DM 可添加 NPC。
 * 非 DM 时 NPC 条目不返回 notes、ac、hp
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eid: string }> }
) {
  try {
    const { id: campaignId, eid: encounterId } = await params;
    const result = await getEncounterAndAuth(request, campaignId, encounterId);
    if (result instanceof NextResponse) return result;
    const { encounter, isDm, campaign } = result;

    const existingEntries = encounter.entries;
    const authHeader = request.headers.get('authorization') ?? '';
    const started = !!encounter.startedAt;

    if (started) {
      const maxOrder = existingEntries.length
        ? Math.max(...existingEntries.map((e) => e.orderIndex), -1)
        : -1;
      let nextOrder = maxOrder + 1;

      for (const member of campaign.members) {
        const hasEntry = existingEntries.some(
          (e) => e.type === 'player' && e.userId === member.userId && e.characterId === member.characterId
        );
        if (!hasEntry) {
          let name = '玩家';
          let initiativeBonus = 0;
          let avatarUrl: string | null = null;
          let hp: number | null = null;
          let maxHp: number | null = null;
          let ac: number | null = null;
          if (member.userId === result.auth.userId && member.characterId) {
            const character = await fetchCharacterById(member.characterId, authHeader);
            if (character) {
              name = character.name ?? name;
              initiativeBonus = computeInitiativeBonusFromCharacter(character);
              avatarUrl = getAvatarFromCharacter(character);
              const ch = character as { currentHitPoints?: number; hitPoints?: number; maxHp?: number; armorClass?: number };
              hp = typeof ch.currentHitPoints === 'number' ? ch.currentHitPoints : typeof ch.hitPoints === 'number' ? ch.hitPoints : null;
              if (typeof ch.maxHp === 'number') maxHp = ch.maxHp;
              if (typeof ch.armorClass === 'number') ac = ch.armorClass;
            }
          }
          const created = await prisma.initiativeEntry.create({
            data: {
              encounterId,
              type: 'player',
              userId: member.userId,
              characterId: member.characterId,
              name,
              avatarUrl,
              initiativeBonus,
              hp,
              maxHp,
              ac,
              orderIndex: nextOrder++,
            },
          });
          existingEntries.push(created);
        }
      }
    }

    const entries = await prisma.initiativeEntry.findMany({
      where: { encounterId },
      orderBy: { orderIndex: 'asc' },
    });

    if (started) {
      for (const e of entries) {
        if (e.type === 'player' && e.userId === result.auth.userId && e.characterId) {
          const character = await fetchCharacterById(e.characterId, authHeader);
          if (character) {
            const ch = character as { maxHp?: number; armorClass?: number };
            const acVal = typeof ch.armorClass === 'number' ? ch.armorClass : null;
            const avatarUrl = getAvatarFromCharacter(character) ?? e.avatarUrl;
            const updateData: { name?: string; initiativeBonus?: number; avatarUrl?: string | null; ac?: number } = {
              name: character.name ?? e.name,
              initiativeBonus: computeInitiativeBonusFromCharacter(character),
              avatarUrl,
              ...(acVal !== null ? { ac: acVal } : {}),
            };
            const updated = await prisma.initiativeEntry.update({
              where: { id: e.id },
              data: updateData,
            });
            e.name = updated.name;
            e.initiativeBonus = updated.initiativeBonus;
            e.avatarUrl = updated.avatarUrl;
            e.ac = updated.ac;
          }
        }
      }
    }
    const sorted = sortEntries(entries);

    const list = sorted.map((e) => {
      const isCurrentUser = e.type === 'player' && e.userId === result.auth.userId;
      const base = {
        id: e.id,
        encounterId: e.encounterId,
        type: e.type,
        characterId: e.characterId,
        userId: e.userId,
        name: e.name,
        avatarUrl: e.avatarUrl ?? null,
        initiativeBonus: e.initiativeBonus,
        currentInitiative: e.currentInitiative ?? null,
        orderIndex: e.orderIndex,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        isCurrentUser: isCurrentUser || undefined,
      };
      if (e.type === 'npc' && !isDm) {
        return { ...base, hp: null, maxHp: null, ac: null, notes: null };
      }
      return {
        ...base,
        hp: e.hp ?? null,
        maxHp: e.maxHp ?? null,
        ac: e.ac ?? null,
        notes: e.notes ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      encounter: {
        id: encounter.id,
        name: encounter.name,
        startedAt: encounter.startedAt?.toISOString() ?? null,
        currentRound: encounter.currentRound,
        currentTurnIndex: encounter.currentTurnIndex,
      },
      entries: list,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '未登录或 Token 无效' },
        { status: 401 }
      );
    }
    throw error;
  }
}

/**
 * POST /api/campaigns/[id]/encounters/[eid]/initiative - 添加先攻条目
 * body: { type: 'npc' | 'player', name?, avatarUrl?, initiativeBonus?, hp?, maxHp?, ac?, notes? }  // NPC
 *    或 { type: 'player', userId, characterId }  // 从成员填充，name/avatar/initiativeBonus 可后续由玩家 refresh 补全
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eid: string }> }
) {
  try {
    const { id: campaignId, eid: encounterId } = await params;
    const result = await getEncounterAndAuth(request, campaignId, encounterId);
    if (result instanceof NextResponse) return result;

    const body = await request.json().catch(() => ({}));

    // 刷新当前用户先攻条目（玩家用，不要求 DM）
    if (body?.action === 'refresh-entry') {
      const auth = result.auth;
      let entry = null as Awaited<ReturnType<typeof prisma.initiativeEntry.findFirst>>;
      if (typeof body.entryId === 'string' && body.entryId.trim()) {
        entry = await prisma.initiativeEntry.findFirst({
          where: {
            id: body.entryId.trim(),
            encounterId,
            type: 'player',
            userId: auth.userId,
          },
        });
      } else {
        entry = await prisma.initiativeEntry.findFirst({
          where: {
            encounterId,
            type: 'player',
            userId: auth.userId,
          },
        });
      }
      if (!entry || !entry.characterId) {
        return NextResponse.json(
          { error: '未找到可刷新的先攻条目（需为当前用户的玩家条目）' },
          { status: 404 }
        );
      }
      const authHeader = request.headers.get('authorization') ?? '';
      const character = await fetchCharacterById(entry.characterId, authHeader);
      if (!character) {
        return NextResponse.json(
          { error: '无法从角色卡获取角色数据' },
          { status: 400 }
        );
      }
      const name = character.name ?? entry.name;
      const initiativeBonus = computeInitiativeBonusFromCharacter(character);
      const hp = (character as { hp?: number }).hp ?? entry.hp;
      const maxHp = (character as { maxHp?: number }).maxHp ?? entry.maxHp;
      const avatarUrl = getAvatarFromCharacter(character) ?? entry.avatarUrl;
      const updated = await prisma.initiativeEntry.update({
        where: { id: entry.id },
        data: {
          name,
          initiativeBonus,
          hp: typeof hp === 'number' ? hp : null,
          maxHp: typeof maxHp === 'number' ? maxHp : null,
          avatarUrl: avatarUrl ?? null,
        },
      });
      return NextResponse.json({
        success: true,
        entry: {
          id: updated.id,
          name: updated.name,
          avatarUrl: updated.avatarUrl,
          initiativeBonus: updated.initiativeBonus,
          hp: updated.hp,
          maxHp: updated.maxHp,
          updatedAt: updated.updatedAt.toISOString(),
        },
      });
    }

    if (!result.isDm) {
      return NextResponse.json({ error: '仅 DM 可添加先攻条目' }, { status: 403 });
    }
    if (!result.encounter.startedAt) {
      return NextResponse.json({ error: '请先开始遭遇' }, { status: 400 });
    }

    const type = body.type === 'npc' || body.type === 'player' ? body.type : 'npc';

    if (type === 'npc') {
      const name = typeof body.name === 'string' ? body.name.trim() : 'NPC';
      const maxOrder = await prisma.initiativeEntry
        .aggregate({
          where: { encounterId },
          _max: { orderIndex: true },
        })
        .then((r) => r._max.orderIndex ?? -1);

      const entry = await prisma.initiativeEntry.create({
        data: {
          encounterId,
          type: 'npc',
          name,
          avatarUrl: typeof body.avatarUrl === 'string' ? body.avatarUrl : null,
          initiativeBonus: typeof body.initiativeBonus === 'number' ? body.initiativeBonus : 0,
          hp: typeof body.hp === 'number' ? body.hp : null,
          maxHp: typeof body.maxHp === 'number' ? body.maxHp : null,
          ac: typeof body.ac === 'number' ? body.ac : null,
          notes: typeof body.notes === 'string' ? body.notes : null,
          orderIndex: maxOrder + 1,
        },
      });
      return NextResponse.json(
        {
          success: true,
          entry: {
            id: entry.id,
            encounterId: entry.encounterId,
            type: entry.type,
            characterId: entry.characterId,
            userId: entry.userId,
            name: entry.name,
            avatarUrl: entry.avatarUrl,
            initiativeBonus: entry.initiativeBonus,
            currentInitiative: entry.currentInitiative,
            hp: entry.hp,
            maxHp: entry.maxHp,
            ac: entry.ac,
            notes: entry.notes,
            orderIndex: entry.orderIndex,
            createdAt: entry.createdAt.toISOString(),
            updatedAt: entry.updatedAt.toISOString(),
          },
        },
        { status: 201 }
      );
    }

    // type === 'player': 从成员填充
    const userId = typeof body.userId === 'string' ? body.userId.trim() : null;
    const characterId = typeof body.characterId === 'string' ? body.characterId.trim() : null;
    if (!userId || !characterId) {
      return NextResponse.json(
        { error: '玩家条目需提供 userId 与 characterId' },
        { status: 400 }
      );
    }
    const isMember = result.campaign.members.some(
      (m) => m.userId === userId && m.characterId === characterId
    );
    if (!isMember) {
      return NextResponse.json(
        { error: '该用户/角色不是本战役成员' },
        { status: 400 }
      );
    }
    const existing = await prisma.initiativeEntry.findFirst({
      where: { encounterId, type: 'player', userId, characterId },
    });
    if (existing) {
      return NextResponse.json(
        { error: '该成员已在先攻列表中' },
        { status: 400 }
      );
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '玩家';
    const maxOrder = await prisma.initiativeEntry
      .aggregate({
        where: { encounterId },
        _max: { orderIndex: true },
      })
      .then((r) => r._max.orderIndex ?? -1);

    const entry = await prisma.initiativeEntry.create({
      data: {
        encounterId,
        type: 'player',
        characterId,
        userId,
        name,
        avatarUrl: typeof body.avatarUrl === 'string' ? body.avatarUrl : null,
        initiativeBonus: typeof body.initiativeBonus === 'number' ? body.initiativeBonus : 0,
        hp: typeof body.hp === 'number' ? body.hp : null,
        maxHp: typeof body.maxHp === 'number' ? body.maxHp : null,
        orderIndex: maxOrder + 1,
      },
    });
    return NextResponse.json(
      {
        success: true,
        entry: {
          id: entry.id,
          encounterId: entry.encounterId,
          type: entry.type,
          characterId: entry.characterId,
          userId: entry.userId,
          name: entry.name,
          avatarUrl: entry.avatarUrl,
          initiativeBonus: entry.initiativeBonus,
          currentInitiative: entry.currentInitiative,
          hp: entry.hp,
          maxHp: entry.maxHp,
          ac: entry.ac,
          notes: entry.notes,
          orderIndex: entry.orderIndex,
          createdAt: entry.createdAt.toISOString(),
          updatedAt: entry.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '未登录或 Token 无效' },
        { status: 401 }
      );
    }
    throw error;
  }
}
