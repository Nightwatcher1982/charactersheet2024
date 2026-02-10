import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/verify-jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/campaigns/[id]/logs - 战役日志列表（成员可见，按时间正序）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthFromRequest(request);
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { members: true },
    });
    if (!campaign) {
      return NextResponse.json({ error: '战役不存在' }, { status: 404 });
    }
    const isMember =
      campaign.createdById === auth.userId ||
      campaign.members.some((m) => m.userId === auth.userId);
    if (!isMember) {
      return NextResponse.json({ error: '仅成员可查看战役日志' }, { status: 403 });
    }
    const logs = await prisma.campaignLogEntry.findMany({
      where: { campaignId: id },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({
      success: true,
      logs: logs.map((l) => ({
        id: l.id,
        userId: l.userId,
        content: l.content,
        createdAt: l.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '未登录或 Token 无效' },
        { status: 401 }
      );
    }
    console.error('[GET /api/campaigns/[id]/logs]', error);
    return NextResponse.json(
      { error: '获取战役日志失败，请确认数据库已执行迁移' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/campaigns/[id]/logs - 添加一条战役日志（DM 或玩家均可）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthFromRequest(request);
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { members: true },
    });
    if (!campaign) {
      return NextResponse.json({ error: '战役不存在' }, { status: 404 });
    }
    const isMember =
      campaign.createdById === auth.userId ||
      campaign.members.some((m) => m.userId === auth.userId);
    if (!isMember) {
      return NextResponse.json({ error: '仅成员可添加战役日志' }, { status: 403 });
    }
    const body = await request.json().catch(() => ({}));
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    if (!content) {
      return NextResponse.json({ error: '请填写内容' }, { status: 400 });
    }
    const log = await prisma.campaignLogEntry.create({
      data: { campaignId: id, userId: auth.userId, content },
    });
    return NextResponse.json(
      {
        success: true,
        log: {
          id: log.id,
          userId: log.userId,
          content: log.content,
          createdAt: log.createdAt.toISOString(),
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
    console.error('[POST /api/campaigns/[id]/logs]', error);
    return NextResponse.json(
      { error: '添加战役日志失败，请确认数据库已执行迁移' },
      { status: 500 }
    );
  }
}
