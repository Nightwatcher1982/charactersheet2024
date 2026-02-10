import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/verify-jwt';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me - 返回当前 JWT 对应用户 id（供前端判断「我的」先攻条目等）
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    return NextResponse.json({
      success: true,
      user: { userId: auth.userId, email: auth.email },
    });
  } catch {
    return NextResponse.json(
      { error: '未登录或 Token 无效' },
      { status: 401 }
    );
  }
}
