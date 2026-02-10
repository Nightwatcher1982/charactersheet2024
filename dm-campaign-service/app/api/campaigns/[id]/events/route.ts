import { NextRequest, NextResponse } from 'next/server';
import { getCampaignAndAuth } from '@/lib/campaign-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * GET /api/campaigns/[id]/events?cursor=&limit=
 * 分页拉取战役事件历史（倒序，最新在前）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const result = await getCampaignAndAuth(request, campaignId);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') ?? '';
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
    );

    const events = await prisma.campaignEvent.findMany({
      where: {
        campaignId,
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    const hasMore = events.length > limit;
    const list = hasMore ? events.slice(0, limit) : events;
    const nextCursor = hasMore ? list[list.length - 1].id : null;

    return NextResponse.json({
      success: true,
      events: list.map((e) => ({
        id: e.id,
        campaignId: e.campaignId,
        type: e.type,
        payload: e.payload as object,
        createdAt: e.createdAt.toISOString(),
      })),
      nextCursor,
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
