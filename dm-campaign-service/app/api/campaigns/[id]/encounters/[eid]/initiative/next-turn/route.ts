import { NextRequest, NextResponse } from 'next/server';
import { getEncounterAndAuth } from '@/lib/initiative-utils';
import { prisma } from '@/lib/prisma';
import { appendEvent } from '@/lib/event-log';

export const dynamic = 'force-dynamic';

/**
 * POST /api/campaigns/[id]/encounters/[eid]/initiative/next-turn
 * 推进到下一个行动；若当前已是最后一人则 currentRound+1，currentTurnIndex 归 0
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
      return NextResponse.json({ error: '仅 DM 可推进回合' }, { status: 403 });
    }

    const encounter = result.encounter;
    const rawEntries = await prisma.initiativeEntry.findMany({
      where: { encounterId },
      orderBy: { orderIndex: 'asc' },
    });
    const entries = [...rawEntries].sort((a, b) => {
      const ai = a.currentInitiative ?? -999;
      const bi = b.currentInitiative ?? -999;
      if (bi !== ai) return bi - ai;
      return a.orderIndex - b.orderIndex;
    });
    const count = entries.length;
    if (count === 0) {
      return NextResponse.json(
        { error: '先攻列表为空，无法推进回合' },
        { status: 400 }
      );
    }

    let nextRound = encounter.currentRound;
    let nextTurnIndex = encounter.currentTurnIndex + 1;
    if (nextTurnIndex >= count) {
      nextTurnIndex = 0;
      nextRound += 1;
    }

    await prisma.encounter.update({
      where: { id: encounterId },
      data: { currentRound: nextRound, currentTurnIndex: nextTurnIndex },
    });

    const currentEntry = entries[nextTurnIndex];
    await appendEvent(campaignId, 'turn_advance', {
      encounterId,
      encounterName: encounter.name,
      currentRound: nextRound,
      currentTurnIndex: nextTurnIndex,
      currentEntryId: currentEntry?.id ?? null,
      currentEntryName: currentEntry?.name ?? null,
    });

    return NextResponse.json({
      success: true,
      currentRound: nextRound,
      currentTurnIndex: nextTurnIndex,
      currentEntryId: entries[nextTurnIndex]?.id ?? null,
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
