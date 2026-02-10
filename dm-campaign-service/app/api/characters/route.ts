import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/verify-jwt';
import { fetchMyCharacters } from '@/lib/character-sheet';

export const dynamic = 'force-dynamic';

/**
 * GET /api/characters - 代理到角色卡服务，返回当前用户的角色列表（供加入战役选角色等）
 */
export async function GET(request: NextRequest) {
  console.log('[DM] GET /api/characters 被调用');
  try {
    await getAuthFromRequest(request);
    if (!process.env.CHARACTER_SHEET_API_URL?.trim()) {
      return NextResponse.json(
        { error: '角色卡服务地址未配置（CHARACTER_SHEET_API_URL）', characters: [] },
        { status: 503 }
      );
    }
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      console.warn('[DM /api/characters] 未携带 Authorization: Bearer，请通过加入页「去登录」从角色卡登录后跳回');
    }
    const result = await fetchMyCharacters(authHeader);
    const list = result.ok ? result.characters : result.characters;
    const mapped = list.map((c) => ({
      serverId: c.serverId,
      id: c.serverId,
      name: c.name ?? '未命名',
      ...c,
    }));
    if (!result.ok && result.status === 401) {
      return NextResponse.json({
        success: false,
        characters: [],
        sheetRejectedToken: true,
        error: '角色卡拒绝了当前登录凭证（通常为两边 JWT_SECRET 不一致或 token 已过期，请从角色卡 .env 复制 JWT_SECRET 到 dm-campaign-service 的 .env 并重启 DM 服务）',
      });
    }
    return NextResponse.json({
      success: true,
      characters: mapped,
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
