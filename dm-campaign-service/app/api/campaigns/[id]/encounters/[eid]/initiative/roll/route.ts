import { NextRequest, NextResponse } from 'next/server';
import { getEncounterAndAuth } from '@/lib/initiative-utils';
import { prisma } from '@/lib/prisma';
import { appendEvent } from '@/lib/event-log';

export const dynamic = 'force-dynamic';

function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/**
 * POST /api/campaigns/[id]/encounters/[eid]/initiative/roll
 * body: { entryId?: string } — 若省略则对所有条目掷先攻并重排
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
    const entryId = typeof body.entryId === 'string' ? body.entryId.trim() : null;

    if (entryId) {
      const entry = await prisma.initiativeEntry.findFirst({
        where: { id: entryId, encounterId },
      });
      if (!entry) {
        return NextResponse.json({ error: '先攻条目不存在' }, { status: 404 });
      }
      const isOwnPlayer = entry.type === 'player' && entry.userId === result.auth.userId;
      if (!result.isDm && !isOwnPlayer) {
        return NextResponse.json({ error: '只能掷自己的先攻' }, { status: 403 });
      }
      const roll = rollD20();
      const currentInitiative = roll + entry.initiativeBonus;
      await prisma.initiativeEntry.update({
        where: { id: entryId },
        data: { currentInitiative },
      });
      await appendEvent(campaignId, 'initiative_roll', {
        encounterId,
        entryName: entry.name,
        roll,
        bonus: entry.initiativeBonus,
        currentInitiative,
      });
      return NextResponse.json({
        success: true,
        entryId,
        roll,
        bonus: entry.initiativeBonus,
        currentInitiative,
      });
    }

    // 全体掷先攻（仅 DM）
    if (!result.isDm) {
      return NextResponse.json({ error: '仅 DM 可为全体掷先攻' }, { status: 403 });
    }
    const entries = await prisma.initiativeEntry.findMany({
      where: { encounterId },
      orderBy: { orderIndex: 'asc' },
    });
    const results: { name: string; roll: number; bonus: number; currentInitiative: number }[] = [];
    for (const e of entries) {
      const roll = rollD20();
      const currentInitiative = roll + e.initiativeBonus;
      await prisma.initiativeEntry.update({
        where: { id: e.id },
        data: { currentInitiative },
      });
      results.push({ name: e.name, roll, bonus: e.initiativeBonus, currentInitiative });
    }
    await appendEvent(campaignId, 'initiative_roll_batch', {
      encounterId,
      summary: '全体掷先攻',
      count: results.length,
      entries: results,
    });
    return NextResponse.json({
      success: true,
      message: '已为所有条目掷先攻',
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
