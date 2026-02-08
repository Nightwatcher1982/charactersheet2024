import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { validatePhoneNumber } from '@/lib/sms';

export const dynamic = 'force-dynamic';

// 最大尝试次数
const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    // 验证手机号格式
    if (!validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 验证验证码格式
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: '验证码格式不正确' },
        { status: 400 }
      );
    }

    // 查找最近的验证码记录
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        phone,
        code,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: '验证码不正确' },
        { status: 400 }
      );
    }

    // 检查验证码是否过期
    if (verificationCode.expiresAt < new Date()) {
      return NextResponse.json(
        { error: '验证码已过期，请重新获取' },
        { status: 400 }
      );
    }

    // 检查尝试次数
    if (verificationCode.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: '验证码尝试次数过多，请重新获取' },
        { status: 400 }
      );
    }

    // 更新尝试次数
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { attempts: verificationCode.attempts + 1 },
    });

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { phone },
      });
    }

    // 删除已使用的验证码
    await prisma.verificationCode.deleteMany({
      where: { phone },
    });

    // 创建会话
    const session = await getSession();
    session.userId = user.id;
    session.phone = user.phone ?? undefined;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('验证失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
