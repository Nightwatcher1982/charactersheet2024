import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    const [totalUsers, totalCharacters] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.character.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalCharacters,
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'AdminRequired') {
      return NextResponse.json({ error: '请先登录后台' }, { status: 401 });
    }
    console.error('GET admin stats error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
