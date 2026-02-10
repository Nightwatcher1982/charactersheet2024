import { NextRequest, NextResponse } from 'next/server';
import { getEncounterAndAuth } from '@/lib/initiative-utils';
import { appendEvent } from '@/lib/event-log';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/campaigns/[id]/encounters/[eid]/end
 * 结束遭遇：清空先攻列表，取消激活；确认由前端弹窗完成（仅 DM）
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
      return NextResponse.json({ error: '仅 DM 可结束遭遇' }, { status: 403 });
    }

    const encounter = result.encounter;

    await prisma.initiativeEntry.deleteMany({ where: { encounterId } });
    await prisma.encounter.update({
      where: { id: encounterId },
      data: { isActive: false, currentRound: 1, currentTurnIndex: 0 },
    });

    await appendEvent(campaignId, 'encounter_ended', {
      encounterId: encounter.id,
      encounterName: encounter.name,
    });

    return NextResponse.json({
      success: true,
      message: '遭遇已结束，先攻已清空',
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
