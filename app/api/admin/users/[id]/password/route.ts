import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { logAdminAction } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';

const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id: targetUserId } = await params;
    const body = await request.json();
    const { newPassword } = body as { newPassword?: string };

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `新密码至少 ${MIN_PASSWORD_LENGTH} 位` },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { id: targetUserId, deletedAt: null },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: targetUserId },
      data: { passwordHash },
    });

    await logAdminAction(session.adminId, 'reset_user_password', targetUserId, {
      targetUserId,
    });

    return NextResponse.json({ success: true, message: '密码已重置' });
  } catch (e) {
    if (e instanceof Error && e.message === 'AdminRequired') {
      return NextResponse.json({ error: '请先登录后台' }, { status: 401 });
    }
    console.error('PUT admin user password error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
