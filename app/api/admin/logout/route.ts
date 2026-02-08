import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import { logAdminAction } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getAdminSession();
    if (session.adminId) {
      await logAdminAction(session.adminId, 'admin_logout');
    }
    session.destroy();
    return NextResponse.json({ success: true, message: '已退出' });
  } catch {
    return NextResponse.json({ success: true });
  }
}
