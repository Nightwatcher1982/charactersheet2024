import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

const DEFAULT_LIMIT = 20;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || DEFAULT_LIMIT, 50);

    const logs = await prisma.loginLog.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        ip: true,
        userAgent: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ logs });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    console.error('GET login-history error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
