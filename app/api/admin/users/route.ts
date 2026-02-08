import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || DEFAULT_PAGE);
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE));
    const email = searchParams.get('email')?.trim();
    const displayName = searchParams.get('displayName')?.trim();
    const role = searchParams.get('role')?.trim();

    const where: { email?: { contains: string; mode: 'insensitive' }; displayName?: { contains: string; mode: 'insensitive' }; role?: string; deletedAt: null } = {
      deletedAt: null,
    };
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (displayName) where.displayName = { contains: displayName, mode: 'insensitive' };
    if (role && (role === 'normal' || role === 'member')) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          emailVerifiedAt: true,
          createdAt: true,
          _count: { select: { characters: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        emailVerifiedAt: u.emailVerifiedAt,
        createdAt: u.createdAt,
        characterCount: u._count.characters,
      })),
      total,
      page,
      pageSize,
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'AdminRequired') {
      return NextResponse.json({ error: '请先登录后台' }, { status: 401 });
    }
    console.error('GET admin users error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
