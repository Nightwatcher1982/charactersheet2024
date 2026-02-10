import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { createToken, verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

function safeMemberExpiresAt(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let userId: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token) {
        try {
          const payload = await verifyToken(token);
          userId = payload.userId;
        } catch {
          return NextResponse.json(
            { isLoggedIn: false, error: 'Token 无效或已过期' },
            { status: 401 }
          );
        }
      }
    }

    if (!userId) {
      const session = await getSession();
      if (!session.isLoggedIn || !session.userId) {
        return NextResponse.json(
          { isLoggedIn: false },
          { status: 401 }
        );
      }
      userId = session.userId;
    }

    let user: {
      id: string;
      email: string | null;
      displayName: string | null;
      role: string;
      afdianUserId?: string | null;
      memberExpiresAt?: Date | null;
    } | null = null;

    try {
      user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          afdianUserId: true,
          memberExpiresAt: true,
        },
      });
    } catch (queryError) {
      console.warn('auth/me 完整查询失败，回退为仅基础字段:', queryError);
      const fallback = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        select: { id: true, email: true, displayName: true, role: true },
      });
      user = fallback
        ? { ...fallback, afdianUserId: null, memberExpiresAt: null }
        : null;
    }

    if (!user) {
      return NextResponse.json(
        { isLoggedIn: false },
        { status: 401 }
      );
    }

    let token: string | undefined;
    try {
      token = await createToken({
        id: user.id,
        email: user.email,
        role: user.role,
        memberExpiresAt: user.memberExpiresAt ?? null,
      });
    } catch {
      // JWT_SECRET 未配置时不返回 token
    }

    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        afdianUserId: user.afdianUserId ?? null,
        memberExpiresAt: safeMemberExpiresAt(user.memberExpiresAt),
      },
      ...(token && { token }),
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
