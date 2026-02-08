import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { validateEmail, verifyEmailCode } from '@/lib/verification';

export const dynamic = 'force-dynamic';

const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, code, agreementVersion } = body as {
      email?: string;
      password?: string;
      code?: string;
      agreementVersion?: string;
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
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `密码至少 ${MIN_PASSWORD_LENGTH} 位` },
        { status: 400 }
      );
    }
    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: '请输入6位验证码' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    const ok = await verifyEmailCode(normalizedEmail, code, 'register');
    if (!ok) {
      return NextResponse.json(
        { error: '验证码错误或已过期，请重新获取' },
        { status: 400 }
      );
    }

    const existingActive = await prisma.user.findFirst({
      where: { email: normalizedEmail, deletedAt: null },
    });
    if (existingActive) {
      return NextResponse.json(
        { error: '该邮箱已注册，请直接登录' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const now = new Date();

    // 若该邮箱曾被软删除，则恢复该用户并更新密码，避免唯一约束冲突导致 500
    const existingAny = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    let user: { id: string; email: string | null };
    if (existingAny?.deletedAt) {
      user = await prisma.user.update({
        where: { id: existingAny.id },
        data: {
          deletedAt: null,
          passwordHash,
          emailVerifiedAt: now,
          agreementAcceptedAt: agreementVersion ? now : undefined,
          agreementVersion: agreementVersion || undefined,
          updatedAt: now,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: 'normal',
          emailVerifiedAt: now,
          agreementAcceptedAt: agreementVersion ? now : undefined,
          agreementVersion: agreementVersion || undefined,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    const prismaError = err as { code?: string };
    if (prismaError?.code === 'P2002') {
      return NextResponse.json(
        { error: '该邮箱已被使用，请直接登录或联系管理员' },
        { status: 400 }
      );
    }
    console.error('register error:', err);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
