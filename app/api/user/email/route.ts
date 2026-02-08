import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { validateEmail, verifyEmailCode } from '@/lib/verification';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { currentEmailCode, newEmail, newEmailCode } = body as {
      currentEmailCode?: string;
      newEmail?: string;
      newEmailCode?: string;
    };

    if (!currentEmailCode || !/^\d{6}$/.test(currentEmailCode)) {
      return NextResponse.json({ error: '请输入当前邮箱收到的6位验证码' }, { status: 400 });
    }
    if (!newEmail || !validateEmail(newEmail)) {
      return NextResponse.json({ error: '请输入正确的新邮箱地址' }, { status: 400 });
    }
    if (!newEmailCode || !/^\d{6}$/.test(newEmailCode)) {
      return NextResponse.json({ error: '请输入新邮箱收到的6位验证码' }, { status: 400 });
    }

    const newEmailNorm = newEmail.toLowerCase();
    const user = await prisma.user.findFirst({
      where: { id: session.userId, deletedAt: null },
      select: { id: true, email: true },
    });
    if (!user || !user.email) {
      return NextResponse.json({ error: '用户不存在或未绑定邮箱' }, { status: 400 });
    }
    if (newEmailNorm === user.email) {
      return NextResponse.json({ error: '新邮箱与当前邮箱相同' }, { status: 400 });
    }

    const okCurrent = await verifyEmailCode(user.email, currentEmailCode, 'change_email');
    if (!okCurrent) {
      return NextResponse.json({ error: '当前邮箱验证码错误或已过期' }, { status: 400 });
    }

    const okNew = await verifyEmailCode(newEmailNorm, newEmailCode, 'change_email');
    if (!okNew) {
      return NextResponse.json({ error: '新邮箱验证码错误或已过期' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { email: newEmailNorm, deletedAt: null },
    });
    if (existing) {
      return NextResponse.json({ error: '该邮箱已被其他账号使用' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmailNorm },
    });

    const sessionData = await import('@/lib/session').then((m) => m.getSession());
    sessionData.email = newEmailNorm;
    await sessionData.save();

    return NextResponse.json({ success: true, message: '邮箱已更换', email: newEmailNorm });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    console.error('PUT email error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
