import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { verifyEmailCode } from '@/lib/verification';

export const dynamic = 'force-dynamic';

const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { code, newPassword } = body as { code?: string; newPassword?: string };

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: '请输入6位验证码' }, { status: 400 });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `新密码至少 ${MIN_PASSWORD_LENGTH} 位` }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { id: session.userId, deletedAt: null },
      select: { id: true, email: true },
    });
    if (!user || !user.email) {
      return NextResponse.json({ error: '用户不存在或未绑定邮箱' }, { status: 400 });
    }

    const ok = await verifyEmailCode(user.email, code, 'change_password');
    if (!ok) {
      return NextResponse.json({ error: '验证码错误或已过期，请重新获取' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true, message: '密码已修改' });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    console.error('PUT password error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
