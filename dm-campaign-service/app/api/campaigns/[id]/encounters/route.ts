import { NextRequest, NextResponse } from 'next/server';
import { getCampaignAndAuth } from '@/lib/campaign-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/campaigns/[id]/encounters - 战役下的遭遇列表（成员可读）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const result = await getCampaignAndAuth(request, campaignId);
    if (result instanceof NextResponse) return result;

    const encounters = await prisma.encounter.findMany({
      where: { campaignId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      encounters: encounters.map((e) => ({
        id: e.id,
        campaignId: e.campaignId,
        name: e.name,
        sortOrder: e.sortOrder,
        isActive: e.isActive,
        startedAt: e.startedAt?.toISOString() ?? null,
        currentRound: e.currentRound,
        currentTurnIndex: e.currentTurnIndex,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      })),
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
 * POST /api/campaigns/[id]/encounters - 创建遭遇（仅 DM）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const result = await getCampaignAndAuth(request, campaignId);
    if (result instanceof NextResponse) return result;
    if (!result.isDm) {
      return NextResponse.json({ error: '仅 DM 可创建遭遇' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : '新遭遇';
    const sortOrder = typeof body.sortOrder === 'number' ? body.sortOrder : 0;

    const maxOrder = await prisma.encounter
      .aggregate({
        where: { campaignId },
        _max: { sortOrder: true },
      })
      .then((r) => r._max.sortOrder ?? -1);
    const actualOrder = sortOrder <= maxOrder ? maxOrder + 1 : sortOrder;

    const encounter = await prisma.encounter.create({
      data: {
        campaignId,
        name,
        sortOrder: actualOrder,
        isActive: true,
      },
    });
    await prisma.encounter.updateMany({
      where: { campaignId, id: { not: encounter.id } },
      data: { isActive: false },
    });

    return NextResponse.json(
      {
        success: true,
        encounter: {
          id: encounter.id,
          campaignId: encounter.campaignId,
          name: encounter.name,
          sortOrder: encounter.sortOrder,
          isActive: encounter.isActive,
          startedAt: encounter.startedAt?.toISOString() ?? null,
          currentRound: encounter.currentRound,
          currentTurnIndex: encounter.currentTurnIndex,
          createdAt: encounter.createdAt.toISOString(),
          updatedAt: encounter.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '未登录或 Token 无效' },
        { status: 401 }
      );
    }
    console.error('POST /api/campaigns/[id]/encounters:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建遭遇失败' },
      { status: 500 }
    );
  }
}
