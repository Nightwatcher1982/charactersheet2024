import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  validateEmail,
  createEmailVerification,
  type VerificationCodeType,
} from '@/lib/verification';
import { sendVerificationEmail } from '@/lib/email';
import { checkSendCodeRateLimit, recordSendCode } from '@/lib/rate-limit';

const VALID_TYPES: VerificationCodeType[] = [
  'register',
  'change_password',
  'change_email',
  'reset_password',
];

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type, newEmail } = body as {
      email?: string;
      type?: string;
      newEmail?: string;
    };

    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: '请输入正确的邮箱地址' },
        { status: 400 }
      );
    }
    if (!type || !VALID_TYPES.includes(type as VerificationCodeType)) {
      return NextResponse.json(
        { error: '无效的验证码类型' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // 注册：检查邮箱是否已注册
    if (type === 'register') {
      const existing = await prisma.user.findFirst({
        where: { email: normalizedEmail, deletedAt: null },
      });
      if (existing) {
        return NextResponse.json(
          { error: '该邮箱已注册，请直接登录' },
          { status: 400 }
        );
      }
    }

    // 限流：同一邮箱 60 秒内只能发一次（按 email+type 维度）
    const rateLimitKey = `${normalizedEmail}:${type}`;
    const limit = checkSendCodeRateLimit(rateLimitKey);
    if (!limit.ok) {
      return NextResponse.json(
        { error: `请${limit.remainingSeconds}秒后再试` },
        { status: 429 }
      );
    }

    const { code, id } = await createEmailVerification(
      normalizedEmail,
      type as VerificationCodeType,
      newEmail && validateEmail(newEmail) ? newEmail : undefined
    );

    const sent = await sendVerificationEmail(
      normalizedEmail,
      code,
      type as VerificationCodeType
    );
    if (!sent) {
      return NextResponse.json(
        { error: '验证码发送失败，请稍后重试' },
        { status: 500 }
      );
    }

    recordSendCode(rateLimitKey);

    // 本地默认在响应里带验证码便于测试；设置 REAL_EMAIL_IN_DEV=1 时与生产一致，不返回 code
    const includeCodeInResponse =
      process.env.NODE_ENV !== 'production' &&
      (process.env.REAL_EMAIL_IN_DEV !== '1' && process.env.REAL_EMAIL_IN_DEV !== 'true');

    return NextResponse.json({
      success: true,
      message: '验证码已发送至您的邮箱',
      ...(includeCodeInResponse && { code }),
    });
  } catch (err) {
    console.error('send-code error:', err);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
