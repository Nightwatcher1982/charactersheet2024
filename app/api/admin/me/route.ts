import { NextResponse } from 'next/server';
import { getAdminSession, requireAdmin } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session.isAdmin || !session.adminId) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }
    return NextResponse.json({
      isAdmin: true,
      admin: { id: session.adminId, email: session.email },
    });
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }
}
