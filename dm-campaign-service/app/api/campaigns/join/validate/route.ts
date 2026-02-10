import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/campaigns/join/validate?code=xxx - 校验邀请码，返回战役名等（加入页预填时用）
 */
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const inviteCode =
      typeof code === 'string' ? code.trim().toUpperCase() : '';
    if (!inviteCode) {
      return NextResponse.json(
        { valid: false, error: '请提供邀请码' },
        { status: 400 }
      );
    }
    const campaign = await prisma.campaign.findUnique({
      where: { inviteCode },
    });
    if (!campaign) {
      return NextResponse.json({
        valid: false,
        error: '邀请码无效或战役不存在',
      });
    }
    return NextResponse.json({
      valid: true,
      campaignName: campaign.name,
      campaignId: campaign.id,
    });
  } catch (error) {
    console.error('join/validate error:', error);
    return NextResponse.json(
      { valid: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}
