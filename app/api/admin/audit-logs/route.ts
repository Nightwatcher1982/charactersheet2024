import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10))
    );
    const actionFilter = searchParams.get('action')?.trim() || undefined;
    const targetUserIdFilter = searchParams.get('targetUserId')?.trim() || undefined;

    const where: { action?: string; targetUserId?: string } = {};
    if (actionFilter) where.action = actionFilter;
    if (targetUserIdFilter) where.targetUserId = targetUserIdFilter;

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          admin: { select: { email: true } },
        },
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    const list = logs.map((log) => ({
      id: log.id,
      adminId: log.adminId,
      adminEmail: log.admin.email,
      action: log.action,
      targetUserId: log.targetUserId,
      payload: log.payload,
      createdAt: log.createdAt,
    }));

    return NextResponse.json({
      logs: list,
      total,
      page,
      pageSize,
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'AdminRequired') {
      return NextResponse.json({ error: '请先登录后台' }, { status: 401 });
    }
    console.error('GET admin audit-logs error:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
