import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { logAdminAction } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';

const VALID_ROLES = ['normal', 'member'];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id: targetUserId } = await params;
    const body = await request.json();
    const { role } = body as { role?: string };

    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: 'role 须为 normal 或 member' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { id: targetUserId, deletedAt: null },
      select: { id: true, role: true },
    });
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
    });

    await logAdminAction(session.adminId, 'change_user_role', targetUserId, {
      targetUserId,
      role,
    });

    return NextResponse.json({ success: true, message: '等级已更新', role });
  } catch (e) {
    if (e instanceof Error && e.message === 'AdminRequired') {
      return NextResponse.json({ error: '请先登录后台' }, { status: 401 });
    }
    console.error('PUT admin user role error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
