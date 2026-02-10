import { NextRequest, NextResponse } from 'next/server';
import { getEncounterAndAuth } from '@/lib/initiative-utils';
import { prisma } from '@/lib/prisma';
import { appendEvent } from '@/lib/event-log';

export const dynamic = 'force-dynamic';

/**
 * POST /api/campaigns/[id]/encounters/[eid]/start-new
 * DM 开始新战斗：清空该遭遇下所有先攻条目，回合归 1、当前行动归 0，并写入「开始新战斗」日志
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
      return NextResponse.json({ error: '仅 DM 可开始新战斗' }, { status: 403 });
    }

    const encounter = result.encounter;

    await prisma.initiativeEntry.deleteMany({
      where: { encounterId },
    });
    await prisma.encounter.update({
      where: { id: encounterId },
      data: { currentRound: 1, currentTurnIndex: 0 },
    });

    await appendEvent(campaignId, 'encounter_new_battle', {
      encounterId: encounter.id,
      encounterName: encounter.name,
    });

    return NextResponse.json({
      success: true,
      message: '已开始新战斗，先攻列表已清空',
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
