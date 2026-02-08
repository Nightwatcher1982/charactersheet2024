/**
 * 邮箱验证码：生成、存储、校验
 * type: register | change_password | change_email | reset_password
 */

import { prisma } from '@/lib/prisma';

export const VERIFICATION_CODE_EXPIRE_MINUTES = 5;
export const MAX_VERIFY_ATTEMPTS = 5;

export type VerificationCodeType = 'register' | 'change_password' | 'change_email' | 'reset_password';

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) && email.length <= 254;
}

/**
 * 创建邮箱验证码记录并返回 code（供发邮件后不再返回给前端）
 */
export async function createEmailVerification(
  email: string,
  type: VerificationCodeType,
  newEmail?: string
): Promise<{ code: string; id: string }> {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRE_MINUTES * 60 * 1000);

  // 同一 email+type 未过期的先作废（可选：仅保留最新一条）
  await prisma.verificationCode.updateMany({
    where: {
      email: email.toLowerCase(),
      type,
      expiresAt: { gt: new Date() },
    },
    data: { expiresAt: new Date(0) },
  });

  const record = await prisma.verificationCode.create({
    data: {
      email: email.toLowerCase(),
      code,
      type,
      newEmail: newEmail?.toLowerCase() ?? undefined,
      expiresAt,
    },
  });
  return { code: record.code, id: record.id };
}

/**
 * 校验邮箱验证码，校验成功后删除该条记录；错误时增加 attempts
 */
export async function verifyEmailCode(
  email: string,
  code: string,
  type: VerificationCodeType
): Promise<boolean> {
  const record = await prisma.verificationCode.findFirst({
    where: {
      email: email.toLowerCase(),
      type,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) return false;
  if (record.attempts >= MAX_VERIFY_ATTEMPTS) return false;

  if (record.code !== code) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: record.attempts + 1 },
    });
    return false;
  }

  await prisma.verificationCode.delete({ where: { id: record.id } });
  return true;
}

/**
 * 校验通过后删除该邮箱该类型下所有未过期验证码（避免重复使用）
 */
export async function consumeEmailVerification(
  email: string,
  type: VerificationCodeType
): Promise<void> {
  await prisma.verificationCode.deleteMany({
    where: {
      email: email.toLowerCase(),
      type,
      expiresAt: { gt: new Date() },
    },
  });
}
