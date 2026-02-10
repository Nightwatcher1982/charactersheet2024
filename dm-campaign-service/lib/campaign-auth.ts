/**
 * 战役鉴权：校验用户为战役成员并返回是否 DM。
 * 供 encounters、initiative 等子路由复用。
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, getAuthFromToken } from '@/lib/verify-jwt';
import { prisma } from '@/lib/prisma';

export type CampaignAuthResult = {
  campaign: {
    id: string;
    createdById: string;
    name: string;
    status: string;
    inviteCode: string;
    nextSessionAt: Date | null;
    sessionLog: string | null;
    createdAt: Date;
    updatedAt: Date;
    members: { id: string; userId: string; characterId: string; joinedAt: Date }[];
  };
  auth: { userId: string; email?: string | null };
  isDm: boolean;
};

export async function getCampaignAndAuth(
  request: NextRequest,
  campaignId: string
): Promise<CampaignAuthResult | NextResponse> {
  const auth = await getAuthFromRequest(request);
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { members: true },
  });
  if (!campaign) {
    return NextResponse.json(
      { error: '战役不存在', code: 'campaign_not_found' },
      { status: 404 }
    );
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
 * 用 token 字符串做战役鉴权（供 SSE 等从 query 传 token 的场景）。
 */
export async function getCampaignAndAuthWithToken(
  campaignId: string,
  token: string
): Promise<CampaignAuthResult | NextResponse> {
  try {
    const auth = await getAuthFromToken(token);
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { members: true },
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
  } catch {
    return NextResponse.json(
      { error: '未登录或 Token 无效' },
      { status: 401 }
    );
  }
}
