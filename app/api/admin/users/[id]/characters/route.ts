import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { logAdminAction } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id: userId } = await params;

    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    await logAdminAction(session.adminId, 'view_user_characters', userId);

    const characters = await prisma.character.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        data: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const list = characters.map((c) => {
      const data = c.data as { name?: string; class?: string; level?: number };
      return {
        id: c.id,
        name: data?.name ?? '未命名',
        class: data?.class ?? '',
        level: data?.level ?? 1,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });

    return NextResponse.json({ characters: list });
  } catch (e) {
    if (e instanceof Error && e.message === 'AdminRequired') {
      return NextResponse.json({ error: '请先登录后台' }, { status: 401 });
    }
    console.error('GET admin user characters error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
