import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, requireAuth } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * 登出所有设备：递增用户 tokenVersion，当前 session 随后会因版本不一致而失效
 */
export async function POST() {
  try {
    const session = await requireAuth();

    await prisma.user.update({
      where: { id: session.userId },
      data: { tokenVersion: { increment: 1 } },
    });

    const s = await getSession();
    s.destroy();

    return NextResponse.json({ success: true, message: '已登出所有设备' });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    console.error('logout-all error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
