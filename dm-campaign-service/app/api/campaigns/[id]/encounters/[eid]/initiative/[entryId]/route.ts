import { NextRequest, NextResponse } from 'next/server';
import { getEncounterAndAuth } from '@/lib/initiative-utils';
import { prisma } from '@/lib/prisma';
import { appendEvent } from '@/lib/event-log';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/campaigns/[id]/encounters/[eid]/initiative/[entryId]
 * 玩家只能改自己的条目的 HP；DM 可改任意条目的 hp/maxHp/ac/notes 等
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eid: string; entryId: string }> }
) {
  try {
    const { id: campaignId, eid: encounterId, entryId } = await params;
    const result = await getEncounterAndAuth(request, campaignId, encounterId);
    if (result instanceof NextResponse) return result;
    const { isDm, auth } = result;

    const entry = await prisma.initiativeEntry.findFirst({
      where: { id: entryId, encounterId },
    });
    if (!entry) {
      return NextResponse.json({ error: '先攻条目不存在' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const updates: {
      name?: string;
      avatarUrl?: string | null;
      initiativeBonus?: number;
      hp?: number | null;
      maxHp?: number | null;
      ac?: number | null;
      notes?: string | null;
      currentInitiative?: number | null;
      orderIndex?: number;
    } = {};

    if (isDm && body.currentInitiative !== undefined) {
      updates.currentInitiative = typeof body.currentInitiative === 'number' ? body.currentInitiative : null;
    }
    if (isDm && typeof body.orderIndex === 'number') {
      updates.orderIndex = body.orderIndex;
    }

    if (entry.type === 'npc') {
      if (!isDm) {
        return NextResponse.json({ error: '仅 DM 可修改 NPC 条目' }, { status: 403 });
      }
      if (typeof body.name === 'string') updates.name = body.name.trim();
      if (body.avatarUrl !== undefined) updates.avatarUrl = body.avatarUrl ?? null;
      if (typeof body.initiativeBonus === 'number') updates.initiativeBonus = body.initiativeBonus;
      if (body.hp !== undefined) updates.hp = typeof body.hp === 'number' ? body.hp : null;
      if (body.maxHp !== undefined) updates.maxHp = typeof body.maxHp === 'number' ? body.maxHp : null;
      if (body.ac !== undefined) updates.ac = typeof body.ac === 'number' ? body.ac : null;
      if (body.notes !== undefined) updates.notes = typeof body.notes === 'string' ? body.notes : null;
    } else {
      // player entry
      const isOwn = entry.userId === auth.userId;
      if (typeof body.name === 'string') updates.name = body.name.trim();
      if (body.avatarUrl !== undefined) updates.avatarUrl = body.avatarUrl ?? null;
      if (typeof body.initiativeBonus === 'number') updates.initiativeBonus = body.initiativeBonus;
      if (body.hp !== undefined || body.maxHp !== undefined) {
        if (!isDm && !isOwn) {
          return NextResponse.json({ error: '只能修改自己的 HP' }, { status: 403 });
        }
        if (body.hp !== undefined) updates.hp = typeof body.hp === 'number' ? body.hp : null;
        if (body.maxHp !== undefined) updates.maxHp = typeof body.maxHp === 'number' ? body.maxHp : null;
      }
      if (body.ac !== undefined || body.notes !== undefined) {
        if (!isDm) {
          return NextResponse.json({ error: '仅 DM 可修改 ac/notes' }, { status: 403 });
        }
        if (body.ac !== undefined) updates.ac = typeof body.ac === 'number' ? body.ac : null;
        if (body.notes !== undefined) updates.notes = typeof body.notes === 'string' ? body.notes : null;
      }
    }

    const updated = await prisma.initiativeEntry.update({
      where: { id: entryId },
      data: updates,
    });

    if (updates.hp !== undefined || updates.maxHp !== undefined) {
      await appendEvent(campaignId, 'hp_change', {
        encounterId: updated.encounterId,
        entryId: updated.id,
        entryName: updated.name,
        hp: updated.hp,
        maxHp: updated.maxHp,
        previousHp: entry.hp,
      });
    }

    return NextResponse.json({
      success: true,
      entry: {
        id: updated.id,
        encounterId: updated.encounterId,
        type: updated.type,
        characterId: updated.characterId,
        userId: updated.userId,
        name: updated.name,
        avatarUrl: updated.avatarUrl,
        initiativeBonus: updated.initiativeBonus,
        currentInitiative: updated.currentInitiative,
        hp: updated.hp,
        maxHp: updated.maxHp,
        ac: updated.ac,
        notes: updated.notes,
        orderIndex: updated.orderIndex,
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

/**
 * DELETE /api/campaigns/[id]/encounters/[eid]/initiative/[entryId]
 * DM 可删任意；玩家不可删（或仅可删自己的？规划说 DM 管理，这里约定仅 DM 可删）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eid: string; entryId: string }> }
) {
  try {
    const { id: campaignId, eid: encounterId, entryId } = await params;
    const result = await getEncounterAndAuth(request, campaignId, encounterId);
    if (result instanceof NextResponse) return result;
    if (!result.isDm) {
      return NextResponse.json({ error: '仅 DM 可删除先攻条目' }, { status: 403 });
    }

    const entry = await prisma.initiativeEntry.findFirst({
      where: { id: entryId, encounterId },
    });
    if (!entry) {
      return NextResponse.json({ error: '先攻条目不存在' }, { status: 404 });
    }

    await prisma.initiativeEntry.delete({ where: { id: entryId } });
    return NextResponse.json({ success: true, message: '已移除' });
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
