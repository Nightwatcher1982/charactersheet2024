import { NextRequest, NextResponse } from 'next/server';
import { getEncounterAndAuth } from '@/lib/initiative-utils';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/campaigns/[id]/encounters/[eid]/initiative/reorder
 * DM 拖拽排序：body { orderedEntryIds: string[] }，按该顺序重设 currentInitiative 使列表按此顺序显示
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
      return NextResponse.json({ error: '仅 DM 可调整先攻顺序' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const orderedEntryIds = Array.isArray(body.orderedEntryIds)
      ? (body.orderedEntryIds as string[]).filter((id) => typeof id === 'string')
      : [];
    if (orderedEntryIds.length === 0) {
      return NextResponse.json({ error: '请提供 orderedEntryIds 数组' }, { status: 400 });
    }

    const encounter = await prisma.encounter.findFirst({
      where: { id: encounterId, campaignId },
      include: { entries: true },
    });
    if (!encounter) {
      return NextResponse.json({ error: '遭遇不存在' }, { status: 404 });
    }

    const currentEntryId =
      encounter.entries[encounter.currentTurnIndex]?.id ?? null;

    for (let i = 0; i < orderedEntryIds.length; i++) {
      await prisma.initiativeEntry.updateMany({
        where: { id: orderedEntryIds[i], encounterId },
        data: { currentInitiative: 1000 - i, orderIndex: i },
      });
    }

    const entries = await prisma.initiativeEntry.findMany({
      where: { encounterId },
      orderBy: { orderIndex: 'asc' },
    });
    const newTurnIndex = currentEntryId
      ? entries.findIndex((e) => e.id === currentEntryId)
      : 0;
    const safeTurnIndex =
      newTurnIndex >= 0 ? newTurnIndex : Math.min(encounter.currentTurnIndex, entries.length - 1);

    if (safeTurnIndex !== encounter.currentTurnIndex) {
      await prisma.encounter.update({
        where: { id: encounterId },
        data: { currentTurnIndex: Math.max(0, safeTurnIndex) },
      });
    }

    return NextResponse.json({
      success: true,
      message: '顺序已更新',
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
