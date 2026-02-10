import { NextRequest, NextResponse } from 'next/server';
import { getEncounterAndAuth } from '@/lib/initiative-utils';
import { appendEvent } from '@/lib/event-log';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/campaigns/[id]/encounters/[eid]/start
 * 开始遭遇：设置 startedAt，之后 GET initiative 会自动填充玩家并允许添加 NPC（仅 DM）
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
      return NextResponse.json({ error: '仅 DM 可开始遭遇' }, { status: 403 });
    }

    let encounter;
    try {
      encounter = await prisma.encounter.update({
        where: { id: encounterId },
        data: { startedAt: new Date(), isActive: true },
      });
    } catch (e) {
      console.error('[encounters/start] prisma.encounter.update failed', e);
      throw e;
    }
    try {
      await prisma.encounter.updateMany({
        where: { campaignId, id: { not: encounterId } },
        data: { isActive: false },
      });
    } catch (e) {
      console.error('[encounters/start] prisma.encounter.updateMany failed', e);
      throw e;
    }

    try {
      await appendEvent(campaignId, 'encounter_started', {
        encounterId: encounter.id,
        encounterName: encounter.name,
      });
    } catch (eventErr) {
      console.error('[encounters/start] appendEvent failed', eventErr);
    }

    return NextResponse.json({
      success: true,
      encounter: {
        id: encounter.id,
        name: encounter.name,
        startedAt: encounter.startedAt?.toISOString() ?? null,
        isActive: encounter.isActive,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '未登录或 Token 无效' },
        { status: 401 }
      );
    }
    console.error('[encounters/start]', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: '开始遭遇失败', details: message },
      { status: 500 }
    );
  }
}
