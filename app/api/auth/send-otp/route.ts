import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationCode, validatePhoneNumber, sendVerificationCode } from '@/lib/sms';

// 发送频率限制：同一手机号60秒内只能发送一次
const RATE_LIMIT_SECONDS = 60;

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // 验证手机号格式
    if (!validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 检查发送频率限制
    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        phone,
        createdAt: {
          gte: new Date(Date.now() - RATE_LIMIT_SECONDS * 1000),
        },
      },
    });

    if (recentCode) {
      const remainingSeconds = Math.ceil(
        (recentCode.createdAt.getTime() + RATE_LIMIT_SECONDS * 1000 - Date.now()) / 1000
      );
      return NextResponse.json(
        { error: `请${remainingSeconds}秒后再试` },
        { status: 429 }
      );
    }

    // 生成验证码
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟后过期

    // 保存验证码到数据库
    await prisma.verificationCode.create({
      data: {
        phone,
        code,
        expiresAt,
      },
    });

    // 发送短信（如果配置了阿里云）
    if (process.env.ALIYUN_ACCESS_KEY_ID) {
      const sent = await sendVerificationCode(phone, code);
      if (!sent) {
        return NextResponse.json(
          { error: '短信发送失败，请稍后重试' },
          { status: 500 }
        );
      }
    } else {
      // 开发模式：在控制台输出验证码
      console.log(`[DEV] 验证码（${phone}）:`, code);
    }

    return NextResponse.json({ 
      success: true,
      message: '验证码已发送',
      // 开发模式下返回验证码
      ...(process.env.NODE_ENV !== 'production' && { code })
    });
  } catch (error) {
    console.error('发送验证码失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
