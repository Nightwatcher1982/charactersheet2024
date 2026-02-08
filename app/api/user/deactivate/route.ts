import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, requireAuth } from '@/lib/session';
import { verifyEmailCode } from '@/lib/verification';

export const dynamic = 'force-dynamic';

/**
 * 账号注销（软删除）：需邮箱验证码确认
 * body: { code } 当前邮箱收到的验证码（须先发 type=change_password 或单独 type 如 deactivate）
 * 为简化复用 change_password 验证码：用户先在安全设置发「修改密码」验证码，再在注销时输入该验证码确认
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { code } = body as { code?: string };

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: '请输入6位验证码以确认注销' }, { status: 400 });
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
      return NextResponse.json({ error: '验证码错误或已过期，请先在安全设置中向当前邮箱发送验证码后再试' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: new Date() },
    });

    const s = await getSession();
    s.destroy();

    return NextResponse.json({ success: true, message: '账号已注销' });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    console.error('PUT deactivate error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
