import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireAuth();
    const user = await prisma.user.findFirst({
      where: { id: session.userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        displayName: true,
        contactInfo: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    return NextResponse.json({
      user: {
        ...user,
        email: user.email ?? undefined,
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    console.error('GET profile error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { displayName, contactInfo } = body as { displayName?: string; contactInfo?: string };

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(typeof displayName === 'string' && { displayName: displayName.trim() || null }),
        ...(typeof contactInfo === 'string' && { contactInfo: contactInfo.trim() || null }),
      },
      select: { id: true, email: true, displayName: true, contactInfo: true, role: true },
    });
    return NextResponse.json({ user });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    console.error('PUT profile error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
