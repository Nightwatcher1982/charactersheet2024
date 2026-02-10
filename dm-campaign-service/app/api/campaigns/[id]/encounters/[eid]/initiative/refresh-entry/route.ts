import { NextRequest, NextResponse } from 'next/server';
import { getEncounterAndAuth } from '@/lib/initiative-utils';
import {
  fetchCharacterById,
  computeInitiativeBonusFromCharacter,
  getAvatarFromCharacter,
} from '@/lib/character-sheet';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/campaigns/[id]/encounters/[eid]/initiative/refresh-entry
 * 玩家用自己 JWT 刷新自己在当前遭遇下的先攻条目（从角色卡拉 name/avatar/initiativeBonus/hp/maxHp）
 * body: { entryId?: string } — 可选，不传则用当前用户的唯一玩家条目
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eid: string }> }
) {
  try {
    const { id: campaignId, eid: encounterId } = await params;
    const result = await getEncounterAndAuth(request, campaignId, encounterId);
    if (result instanceof NextResponse) return result;
    const { auth } = result;

    const body = await request.json().catch(() => ({}));
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
    const ch = character as { currentHitPoints?: number; hitPoints?: number; maxHp?: number; armorClass?: number };
    const hp = typeof ch.currentHitPoints === 'number' ? ch.currentHitPoints : typeof ch.hitPoints === 'number' ? ch.hitPoints : entry.hp;
    const maxHp = typeof ch.maxHp === 'number' ? ch.maxHp : entry.maxHp;
    const ac = typeof ch.armorClass === 'number' ? ch.armorClass : null;
    const avatarUrl = getAvatarFromCharacter(character) ?? entry.avatarUrl;

    const updated = await prisma.initiativeEntry.update({
      where: { id: entry.id },
      data: {
        name,
        initiativeBonus,
        hp: typeof hp === 'number' ? hp : null,
        maxHp: typeof maxHp === 'number' ? maxHp : null,
        ...(ac !== null ? { ac } : {}),
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
