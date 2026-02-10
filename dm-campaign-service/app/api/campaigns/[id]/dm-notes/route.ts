import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/verify-jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/campaigns/[id]/dm-notes - DM 笔记列表（仅 DM 可访问）
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
      select: { createdById: true, dmNotes: { orderBy: { createdAt: 'asc' } } },
    });
    if (!campaign) {
      return NextResponse.json({ error: '战役不存在' }, { status: 404 });
    }
    if (campaign.createdById !== auth.userId) {
      return NextResponse.json({ error: '仅 DM 可查看 DM 笔记' }, { status: 403 });
    }
    return NextResponse.json({
      success: true,
      dmNotes: campaign.dmNotes.map((n) => ({
        id: n.id,
        content: n.content,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
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
 * POST /api/campaigns/[id]/dm-notes - 新增一条 DM 笔记（仅 DM，富文本 content）
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
      select: { createdById: true },
    });
    if (!campaign) {
      return NextResponse.json({ error: '战役不存在' }, { status: 404 });
    }
    if (campaign.createdById !== auth.userId) {
      return NextResponse.json({ error: '仅 DM 可添加 DM 笔记' }, { status: 403 });
    }
    const body = await request.json().catch(() => ({}));
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const note = await prisma.campaignDmNote.create({
      data: { campaignId: id, content: content || '' },
    });
    return NextResponse.json(
      {
        success: true,
        dmNote: {
          id: note.id,
          content: note.content,
          createdAt: note.createdAt.toISOString(),
          updatedAt: note.updatedAt.toISOString(),
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
    throw error;
  }
}
