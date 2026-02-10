import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/verify-jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getCampaignAndAuth(
  request: NextRequest,
  id: string
): Promise<{ campaign: { id: string; createdById: string; name: string; status: string; inviteCode: string; nextSessionAt: Date | null; sessionLog: string | null; createdAt: Date; updatedAt: Date; members: { id: string; userId: string; characterId: string; joinedAt: Date }[] }; auth: { userId: string }; isDm: boolean } | NextResponse> {
  const auth = await getAuthFromRequest(request);
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { members: true, dmNotes: { orderBy: { createdAt: 'asc' } } },
  });
  if (!campaign) {
    return NextResponse.json({ error: '战役不存在' }, { status: 404 });
  }
  const isMember =
    campaign.createdById === auth.userId ||
    campaign.members.some((m) => m.userId === auth.userId);
  if (!isMember) {
    return NextResponse.json({ error: '无权访问该战役' }, { status: 403 });
  }
  const isDm = campaign.createdById === auth.userId;
  return { campaign, auth, isDm };
}

/**
 * GET /api/campaigns/[id] - 战役详情；成员返回完整数据，非成员返回简介 + isMember:false（可在此页输入邀请码加入）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { members: true, dmNotes: { orderBy: { createdAt: 'asc' } } },
    });
    if (!campaign) {
      return NextResponse.json({ error: '战役不存在' }, { status: 404 });
    }
    let auth: { userId: string } | null = null;
    try {
      auth = await getAuthFromRequest(request);
    } catch {
      // 未登录仍可查看战役简介
    }
    const isDm = auth !== null && campaign.createdById === auth.userId;
    const isMember =
      isDm || (auth !== null && campaign.members.some((m) => m.userId === auth!.userId));
    if (!isMember) {
      return NextResponse.json({
        success: true,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          backgroundIntro: campaign.backgroundIntro ?? null,
          backgroundImageUrl: campaign.backgroundImageUrl ?? null,
          nextSessionAt:
            campaign.nextSessionAt != null && campaign.nextSessionAt instanceof Date
              ? campaign.nextSessionAt.toISOString()
              : null,
          isMember: false,
          isDm: false,
        },
      });
    }
    const members = Array.isArray(campaign.members) ? campaign.members : [];
    const dmNotesRaw = (campaign as { dmNotes?: { id: string; content: string; createdAt: Date; updatedAt: Date }[] }).dmNotes;
    const dmNotes = Array.isArray(dmNotesRaw) ? dmNotesRaw : [];
    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        inviteCode: campaign.inviteCode,
        nextSessionAt:
          campaign.nextSessionAt != null && campaign.nextSessionAt instanceof Date
            ? campaign.nextSessionAt.toISOString()
            : null,
        backgroundIntro: campaign.backgroundIntro ?? null,
        backgroundImageUrl: campaign.backgroundImageUrl ?? null,
        createdAt:
          campaign.createdAt instanceof Date
            ? campaign.createdAt.toISOString()
            : new Date().toISOString(),
        updatedAt:
          campaign.updatedAt instanceof Date
            ? campaign.updatedAt.toISOString()
            : new Date().toISOString(),
        createdById: campaign.createdById,
        isDm,
        isMember: true,
        members: members.map((m) => ({
          id: m.id,
          userId: m.userId,
          characterId: m.characterId,
          joinedAt:
            m.joinedAt instanceof Date ? m.joinedAt.toISOString() : new Date(m.joinedAt).toISOString(),
        })),
        dmNotes: dmNotes.map((n) => ({
          id: n.id,
          content: n.content,
          createdAt:
            n.createdAt instanceof Date ? n.createdAt.toISOString() : new Date(n.createdAt).toISOString(),
          updatedAt:
            n.updatedAt instanceof Date ? n.updatedAt.toISOString() : new Date(n.updatedAt).toISOString(),
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '未登录或 Token 无效' },
        { status: 401 }
      );
    }
    console.error('GET /api/campaigns/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/campaigns/[id] - 编辑战役（仅 DM）
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getCampaignAndAuth(request, id);
    if (result instanceof NextResponse) return result;
    if (!result.isDm) {
      return NextResponse.json({ error: '仅 DM 可编辑战役' }, { status: 403 });
    }
    const body = await request.json().catch(() => ({}));
    const data: {
      name?: string;
      status?: string;
      nextSessionAt?: Date | null;
      backgroundIntro?: string | null;
      backgroundImageUrl?: string | null;
    } = {};
    if (typeof body.name === 'string') data.name = body.name.trim();
    if (body.status === 'active' || body.status === 'ended') data.status = body.status;
    if (body.nextSessionAt !== undefined) {
      data.nextSessionAt = body.nextSessionAt ? new Date(body.nextSessionAt) : null;
    }
    if (body.backgroundIntro !== undefined) {
      data.backgroundIntro =
        typeof body.backgroundIntro === 'string' ? body.backgroundIntro.trim() || null : null;
    }
    if (body.backgroundImageUrl !== undefined) {
      data.backgroundImageUrl =
        typeof body.backgroundImageUrl === 'string'
          ? body.backgroundImageUrl.trim() || null
          : null;
    }
    const campaign = await prisma.campaign.update({
      where: { id },
      data,
    });
    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        inviteCode: campaign.inviteCode,
        nextSessionAt: campaign.nextSessionAt?.toISOString() ?? null,
        backgroundIntro: campaign.backgroundIntro ?? null,
        backgroundImageUrl: campaign.backgroundImageUrl ?? null,
        updatedAt: campaign.updatedAt.toISOString(),
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
 * DELETE /api/campaigns/[id] - 删除战役（仅 DM）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getCampaignAndAuth(request, id);
    if (result instanceof NextResponse) return result;
    if (!result.isDm) {
      return NextResponse.json({ error: '仅 DM 可删除战役' }, { status: 403 });
    }
    await prisma.campaign.delete({ where: { id } });
    return NextResponse.json({ success: true, message: '战役已删除' });
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
