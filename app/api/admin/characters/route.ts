import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

/** 后台：分页获取全部角色卡，含创建者信息 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || DEFAULT_PAGE);
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE));
    const email = searchParams.get('email')?.trim();

    const where: {
      user: { deletedAt: null; email?: { contains: string; mode: 'insensitive' } };
    } = {
      user: { deletedAt: null },
    };
    if (email) {
      where.user.email = { contains: email, mode: 'insensitive' };
    }

    const [rows, total] = await Promise.all([
      prisma.character.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, email: true, displayName: true },
          },
        },
      }),
      prisma.character.count({ where }),
    ]);

    type DataShape = { name?: string; class?: string; level?: number };
    const list = rows.map((c) => {
      const data = (c.data as DataShape) ?? {};
      return {
        id: c.id,
        name: data.name ?? '未命名',
        class: data.class ?? '',
        level: data.level ?? 1,
        isPublic: c.isPublic,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        user: c.user
          ? {
              id: c.user.id,
              email: c.user.email,
              displayName: c.user.displayName,
            }
          : null,
      };
    });

    return NextResponse.json({
      characters: list,
      total,
      page,
      pageSize,
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'AdminRequired') {
      return NextResponse.json({ error: '请先登录后台' }, { status: 401 });
    }
    console.error('GET admin characters error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
