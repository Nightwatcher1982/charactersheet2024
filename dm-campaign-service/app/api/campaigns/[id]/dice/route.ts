import { NextRequest, NextResponse } from 'next/server';
import { getCampaignAndAuth } from '@/lib/campaign-auth';
import { fetchCharacterById } from '@/lib/character-sheet';
import { parseAndRoll } from '@/lib/dice';
import { appendEvent } from '@/lib/event-log';

export const dynamic = 'force-dynamic';

/**
 * POST /api/campaigns/[id]/dice - 掷骰，写 dice_roll 事件并推送
 * body: { formula: string } 如 "d20"、"2d6+3"、"1d4-1"
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const result = await getCampaignAndAuth(request, campaignId);
    if (result instanceof NextResponse) return result;

    const body = await request.json().catch(() => ({}));
    const formula = typeof body.formula === 'string' ? body.formula.trim() : '';
    const bodyActorName = typeof body.actorName === 'string' ? body.actorName.trim() : undefined;
    let actorName = bodyActorName;
    if (!actorName) {
      if (result.isDm) {
        actorName = 'DM';
      } else {
        const member = result.campaign.members.find((m) => m.userId === result.auth.userId);
        if (member?.characterId) {
          const authHeader = request.headers.get('authorization') || '';
          const character = await fetchCharacterById(member.characterId, authHeader);
          actorName = (character?.name?.trim()) || result.auth.email || '某玩家';
        } else {
          actorName = result.auth.email || '某玩家';
        }
      }
    }
    if (!formula) {
      return NextResponse.json(
        { error: '请提供 formula，如 d20、2d6+3' },
        { status: 400 }
      );
    }

    let rolls: number[];
    let total: number;
    let normalizedFormula: string;
    let parts: { formula: string; rolls: number[] }[] | undefined;
    try {
      const out = parseAndRoll(formula);
      rolls = out.rolls;
      total = out.total;
      normalizedFormula = out.formula;
      parts = out.parts;
    } catch {
      return NextResponse.json(
        { error: '公式无效，支持格式：AdB±C 或复合如 2d6+2d10+3' },
        { status: 400 }
      );
    }

    await appendEvent(campaignId, 'dice_roll', {
      formula: normalizedFormula,
      rolls,
      total,
      userId: result.auth.userId,
      userEmail: result.auth.email ?? undefined,
      actorName,
    });

    return NextResponse.json({
      success: true,
      result: total,
      rolls,
      formula: normalizedFormula,
      ...(parts && parts.length > 0 ? { parts } : {}),
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
