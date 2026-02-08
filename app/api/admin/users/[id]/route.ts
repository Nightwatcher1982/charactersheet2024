import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { logAdminAction } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        displayName: true,
        contactInfo: true,
        role: true,
        emailVerifiedAt: true,
        agreementAcceptedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { characters: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    await logAdminAction(session.adminId, 'view_user_detail', id);

    return NextResponse.json({
      user: {
        ...user,
        characterCount: user._count.characters,
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'AdminRequired') {
      return NextResponse.json({ error: '请先登录后台' }, { status: 401 });
    }
    console.error('GET admin user error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

/**
 * 删除用户（软删除：设置 deletedAt）
 * 用于测试或合规清理，删除后该用户无法再登录，列表不再展示
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在或已删除' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logAdminAction(session.adminId, 'delete_user', id, { email: user.email ?? undefined });

    return NextResponse.json({ success: true, message: '用户已删除' });
  } catch (e) {
    if (e instanceof Error && e.message === 'AdminRequired') {
      return NextResponse.json({ error: '请先登录后台' }, { status: 401 });
    }
    console.error('DELETE admin user error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
