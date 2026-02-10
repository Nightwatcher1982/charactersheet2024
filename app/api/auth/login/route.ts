import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createToken } from '@/lib/jwt';
import { sessionOptions, REMEMBER_ME_MAX_AGE, type SessionData } from '@/lib/session';
import { validateEmail } from '@/lib/verification';
import {
  checkLoginFailRateLimit,
  recordLoginFail,
  clearLoginFail,
  getClientIp,
} from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body as {
      email?: string;
      password?: string;
      rememberMe?: boolean;
    };

    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: '请输入正确的邮箱地址' },
        { status: 400 }
      );
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: '请输入密码' },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    if (!checkLoginFailRateLimit(ip).ok) {
      return NextResponse.json(
        { error: '登录尝试次数过多，请稍后再试' },
        { status: 429 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail, deletedAt: null },
    });

    if (!user || !user.passwordHash) {
      recordLoginFail(ip);
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      recordLoginFail(ip);
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    clearLoginFail(ip);

    const userAgent = request.headers.get('user-agent') ?? undefined;
    await prisma.loginLog.create({
      data: {
        userId: user.id,
        ip,
        userAgent: userAgent?.slice(0, 500),
      },
    });

    const opts = rememberMe
      ? {
          ...sessionOptions,
          cookieOptions: {
            ...sessionOptions.cookieOptions,
            maxAge: REMEMBER_ME_MAX_AGE,
          },
        }
      : sessionOptions;
    const session = await getIronSession<SessionData>(await cookies(), opts);
    session.userId = user.id;
    session.email = user.email ?? undefined;
    session.tokenVersion = user.tokenVersion;
    session.isLoggedIn = true;
    await session.save();

    let token: string | undefined;
    try {
      token = await createToken({
        id: user.id,
        email: user.email,
        role: user.role,
        memberExpiresAt: user.memberExpiresAt ?? null,
      });
    } catch (e) {
      console.warn('JWT 签发跳过（请配置 JWT_SECRET）:', e);
    }

    return NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
      ...(token && { token }),
    });
  } catch (err) {
    console.error('login error:', err);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
