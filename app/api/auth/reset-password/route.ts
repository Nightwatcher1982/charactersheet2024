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
    const { email, code, newPassword } = body as {
      email?: string;
      code?: string;
      newPassword?: string;
    };

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: '请输入正确的邮箱地址' }, { status: 400 });
    }
    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: '请输入6位验证码' }, { status: 400 });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `新密码至少 ${MIN_PASSWORD_LENGTH} 位` }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const ok = await verifyEmailCode(normalizedEmail, code, 'reset_password');
    if (!ok) {
      return NextResponse.json({ error: '验证码错误或已过期，请重新获取' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail, deletedAt: null },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: '该邮箱未注册' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true, message: '密码已重置，请使用新密码登录' });
  } catch (e) {
    console.error('reset-password error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
