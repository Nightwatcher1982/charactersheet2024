import { NextRequest, NextResponse } from 'next/server';
import { getCampaignAndAuth } from '@/lib/campaign-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getEncounterAndAuth(
  request: NextRequest,
  campaignId: string,
  encounterId: string
) {
  const result = await getCampaignAndAuth(request, campaignId);
  if (result instanceof NextResponse) return result;

  const encounter = await prisma.encounter.findFirst({
    where: { id: encounterId, campaignId },
  });
  if (!encounter) {
    return NextResponse.json({ error: '遭遇不存在' }, { status: 404 });
  }
  return { ...result, encounter };
}

/**
 * PATCH /api/campaigns/[id]/encounters/[eid] - 更新遭遇（仅 DM）；可设 isActive 切换当前遭遇
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eid: string }> }
) {
  try {
    const { id: campaignId, eid: encounterId } = await params;
    const result = await getEncounterAndAuth(request, campaignId, encounterId);
    if (result instanceof NextResponse) return result;
    if (!result.isDm) {
      return NextResponse.json({ error: '仅 DM 可编辑遭遇' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const data: { name?: string; sortOrder?: number; isActive?: boolean } = {};
    if (typeof body.name === 'string') data.name = body.name.trim();
    if (typeof body.sortOrder === 'number') data.sortOrder = body.sortOrder;
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive;

    if (data.isActive === true) {
      await prisma.encounter.updateMany({
        where: { campaignId },
        data: { isActive: false },
      });
    }

    const encounter = await prisma.encounter.update({
      where: { id: encounterId },
      data,
    });

    return NextResponse.json({
      success: true,
      encounter: {
        id: encounter.id,
        campaignId: encounter.campaignId,
        name: encounter.name,
        sortOrder: encounter.sortOrder,
        isActive: encounter.isActive,
        currentRound: encounter.currentRound,
        currentTurnIndex: encounter.currentTurnIndex,
        updatedAt: encounter.updatedAt.toISOString(),
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
 * DELETE /api/campaigns/[id]/encounters/[eid] - 删除遭遇（仅 DM）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eid: string }> }
) {
  try {
    const { id: campaignId, eid: encounterId } = await params;
    const result = await getEncounterAndAuth(request, campaignId, encounterId);
    if (result instanceof NextResponse) return result;
    if (!result.isDm) {
      return NextResponse.json({ error: '仅 DM 可删除遭遇' }, { status: 403 });
    }

    await prisma.encounter.delete({ where: { id: encounterId } });
    return NextResponse.json({ success: true, message: '遭遇已删除' });
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
