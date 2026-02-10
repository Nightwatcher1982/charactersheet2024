import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, isMember } from '@/lib/verify-jwt';
import { prisma } from '@/lib/prisma';
import { generateInviteCode } from '@/lib/invite-code';
import { fetchCharacterById, getAvatarFromCharacter } from '@/lib/character-sheet';

export const dynamic = 'force-dynamic';

const UNAUTH_JSON = () =>
  NextResponse.json({ error: '未登录或 Token 无效' }, { status: 401 });

const INTRO_MAX_LENGTH = 80; // 列表卡片展示截取长度

/**
 * GET /api/campaigns - 战役大厅：返回所有已创建战役，每项带 role(dm|player|null)；未参与的不返回 inviteCode
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return UNAUTH_JSON();
  }
  try {
    const auth = await getAuthFromRequest(request);
    const list = await prisma.campaign.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { members: true },
    });

    const campaigns = await Promise.all(
      list.map(async (c) => {
        const isDm = c.createdById === auth.userId;
        const isPlayer = c.members.some((m) => m.userId === auth.userId);
        const role: 'dm' | 'player' | null = isDm ? 'dm' : isPlayer ? 'player' : null;
        const memberAvatars: (string | null)[] = [];
        for (const m of c.members) {
          if (m.characterId) {
            try {
              const char = await fetchCharacterById(m.characterId, authHeader);
              memberAvatars.push(getAvatarFromCharacter(char));
            } catch {
              memberAvatars.push(null);
            }
          } else {
            memberAvatars.push(null);
          }
        }
        const intro = c.backgroundIntro?.trim() || '';
        const introExcerpt =
          intro.length > INTRO_MAX_LENGTH
            ? intro.slice(0, INTRO_MAX_LENGTH).replace(/\s+$/, '') + '…'
            : intro;
        return {
          id: c.id,
          name: c.name,
          status: c.status,
          ...(role !== null ? { inviteCode: c.inviteCode } : {}),
          nextSessionAt: c.nextSessionAt?.toISOString() ?? null,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          role,
          memberCount: c.members.length,
          backgroundIntro: introExcerpt || null,
          backgroundImageUrl: c.backgroundImageUrl ?? null,
          members: c.members.map((m) => ({ userId: m.userId, characterId: m.characterId })),
          memberAvatars,
        };
      })
    );

    const canCreate = isMember(auth);
    return NextResponse.json({
      success: true,
      canCreate,
      campaigns,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return UNAUTH_JSON();
    }
    console.error('GET /api/campaigns error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

/**
 * POST /api/campaigns - 创建战役（仅会员）
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!isMember(auth)) {
      return NextResponse.json(
        { error: '仅会员可创建战役' },
        { status: 403 }
      );
    }
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json(
        { error: '请填写战役名称' },
        { status: 400 }
      );
    }
    const backgroundIntro =
      typeof body.backgroundIntro === 'string' ? body.backgroundIntro.trim() || null : null;
    const backgroundImageUrl =
      typeof body.backgroundImageUrl === 'string' ? body.backgroundImageUrl.trim() || null : null;
    let inviteCode = generateInviteCode();
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.campaign.findUnique({
        where: { inviteCode },
      });
      if (!exists) break;
      inviteCode = generateInviteCode();
    }
    const campaign = await prisma.campaign.create({
      data: {
        name,
        createdById: auth.userId,
        inviteCode,
        backgroundIntro,
        backgroundImageUrl,
      },
    });
    return NextResponse.json(
      {
        success: true,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          inviteCode: campaign.inviteCode,
          nextSessionAt: campaign.nextSessionAt?.toISOString() ?? null,
          backgroundIntro: campaign.backgroundIntro ?? null,
          backgroundImageUrl: campaign.backgroundImageUrl ?? null,
          createdAt: campaign.createdAt.toISOString(),
          updatedAt: campaign.updatedAt.toISOString(),
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
