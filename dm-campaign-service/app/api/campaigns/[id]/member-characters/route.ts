import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/verify-jwt';
import { prisma } from '@/lib/prisma';
import {
  fetchPublicCharacter,
  fetchMyCharacters,
  fetchCharacterById,
  getAvatarFromCharacter,
} from '@/lib/character-sheet';

export const dynamic = 'force-dynamic';

/**
 * GET /api/campaigns/[id]/member-characters
 * 返回战役成员的角色卡列表。仅战役成员可访问。
 * - 公开角色：所有成员可见
 * - 未公开角色：仅本人可见（通过 JWT 鉴权拉取）
 * - DM 不在 members 表，故额外拉取 DM 自己的角色加入列表。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthFromRequest(request);
    const { id: campaignId } = await params;

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

    const members = campaign.members;
    const authHeader = request.headers.get('Authorization');
    const characterIdSet = new Set<string>(members.map((m) => m.characterId).filter(Boolean));

    // DM 不在 members 表，需单独拉取 DM 自己的公开角色
    const isDm = campaign.createdById === auth.userId;
    if (isDm && authHeader) {
      const result = await fetchMyCharacters(authHeader);
      if (result.ok) {
        for (const c of result.characters) {
          if ((c as { isPublic?: boolean }).isPublic && c.serverId) {
            characterIdSet.add(c.serverId);
          }
        }
      }
    }

    const characterIds = [...characterIdSet];

    const publicCharacters: {
      characterId: string;
      name?: string;
      level?: number;
      class?: string;
      avatar?: string | null;
    }[] = [];

    for (const characterId of characterIds) {
      // 先尝试无鉴权拉取（公开角色）
      let char = await fetchPublicCharacter(characterId);
      // 若未公开，再用当前用户 JWT 拉取（本人可见自己的角色）
      if (!char && authHeader) {
        char = await fetchCharacterById(characterId, authHeader);
      }
      if (char) {
        const data = char as { name?: string; level?: number; class?: string };
        publicCharacters.push({
          characterId,
          name: data.name,
          level: data.level,
          class: data.class,
          avatar: getAvatarFromCharacter(char),
        });
      }
    }

    return NextResponse.json({
      success: true,
      characters: publicCharacters,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '未登录或 Token 无效' },
        { status: 401 }
      );
    }
    console.error('GET /api/campaigns/[id]/member-characters error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    );
  }
}
