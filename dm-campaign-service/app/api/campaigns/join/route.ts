import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/verify-jwt';
import { verifyCharacterBelongsToUser } from '@/lib/character-sheet';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/campaigns/join - 用邀请码加入战役，绑定一个角色
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    const body = await request.json().catch(() => ({}));
    const inviteCode =
      typeof body.inviteCode === 'string' ? body.inviteCode.trim().toUpperCase() : '';
    const characterId = typeof body.characterId === 'string' ? body.characterId.trim() : '';
    if (!inviteCode || !characterId) {
      return NextResponse.json(
        { error: '请提供邀请码和角色 ID（characterId）' },
        { status: 400 }
      );
    }
    const campaign = await prisma.campaign.findUnique({
      where: { inviteCode },
      include: { members: true },
    });
    if (!campaign) {
      return NextResponse.json(
        { error: '邀请码无效或战役不存在' },
        { status: 404 }
      );
    }
    if (campaign.createdById === auth.userId) {
      return NextResponse.json(
        { error: 'DM 无需加入自己的战役' },
        { status: 400 }
      );
    }
    const alreadyJoined = campaign.members.some((m) => m.userId === auth.userId);
    if (alreadyJoined) {
      return NextResponse.json(
        { error: '您已加入该战役，每个战役只能绑定一个角色' },
        { status: 400 }
      );
    }
    const authHeader = request.headers.get('authorization') || '';
    const ok = await verifyCharacterBelongsToUser(characterId, authHeader);
    if (!ok) {
      return NextResponse.json(
        { error: '该角色不属于您或角色卡服务不可用' },
        { status: 400 }
      );
    }
    await prisma.campaignMember.create({
      data: {
        campaignId: campaign.id,
        userId: auth.userId,
        characterId,
      },
    });
    return NextResponse.json({
      success: true,
      message: '已加入战役',
      campaignId: campaign.id,
      campaignName: campaign.name,
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
