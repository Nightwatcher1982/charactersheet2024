import { NextRequest, NextResponse } from 'next/server';
import { getEncounterAndAuth } from '@/lib/initiative-utils';
import { prisma } from '@/lib/prisma';
import { appendEvent } from '@/lib/event-log';

export const dynamic = 'force-dynamic';

/**
 * POST /api/campaigns/[id]/encounters/[eid]/initiative/set-turn
 * body: { turnIndex: number } — DM 指定当前行动者（按先攻表顺序的索引）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eid: string }> }
) {
  try {
    const { id: campaignId, eid: encounterId } = await params;
    const result = await getEncounterAndAuth(request, campaignId, encounterId);
    if (result instanceof NextResponse) return result;
    if (!result.isDm) {
      return NextResponse.json({ error: '仅 DM 可设置当前行动者' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const turnIndex = typeof body.turnIndex === 'number' ? body.turnIndex : NaN;
    if (!Number.isInteger(turnIndex) || turnIndex < 0) {
      return NextResponse.json({ error: '无效的 turnIndex' }, { status: 400 });
    }

    const entries = await prisma.initiativeEntry.findMany({
      where: { encounterId },
      orderBy: { orderIndex: 'asc' },
    });
    const sorted = [...entries].sort((a, b) => {
      const ai = a.currentInitiative ?? -999;
      const bi = b.currentInitiative ?? -999;
      if (bi !== ai) return bi - ai;
      return a.orderIndex - b.orderIndex;
    });
    if (turnIndex >= sorted.length) {
      return NextResponse.json({ error: 'turnIndex 超出先攻列表范围' }, { status: 400 });
    }

    const encounter = result.encounter;
    await prisma.encounter.update({
      where: { id: encounterId },
      data: { currentTurnIndex: turnIndex },
    });

    const currentEntry = sorted[turnIndex];
    await appendEvent(campaignId, 'turn_advance', {
      encounterId,
      encounterName: encounter.name,
      currentRound: encounter.currentRound,
      currentTurnIndex: turnIndex,
      currentEntryId: currentEntry?.id ?? null,
      currentEntryName: currentEntry?.name ?? null,
    });

    return NextResponse.json({
      success: true,
      currentTurnIndex: turnIndex,
      currentEntryId: currentEntry?.id ?? null,
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
