import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { adminSessionOptions, type AdminSessionData } from '@/lib/admin-session';
import { logAdminAction } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json(
        { error: '请输入邮箱和密码' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin || !admin.passwordHash) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    const session = await getIronSession<AdminSessionData>(await cookies(), adminSessionOptions);
    session.adminId = admin.id;
    session.email = admin.email;
    session.isAdmin = true;
    await session.save();

    await logAdminAction(admin.id, 'admin_login');

    return NextResponse.json({
      success: true,
      message: '登录成功',
      admin: { id: admin.id, email: admin.email },
    });
  } catch (err) {
    console.error('admin login error:', err);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
