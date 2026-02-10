import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export type UserRole = 'normal' | 'member';

export async function requireMember(): Promise<{
  userId: string;
  email?: string;
  role: string;
  memberExpiresAt?: Date | null;
}> {
  const session = await requireAuth();
  const user = await prisma.user.findFirst({
    where: { id: session.userId, deletedAt: null },
    select: { id: true, email: true, role: true, memberExpiresAt: true },
  });
  if (!user) throw new Error('Unauthorized');
  // 会员到期后视为非会员（预留：爱发电对接后由 Webhook/定时任务更新 role，此处做实时校验）
  const now = new Date();
  if (user.memberExpiresAt && user.memberExpiresAt < now) {
    throw new Error('Forbidden: 会员已过期');
  }
  if (user.role !== 'member') {
    throw new Error('Forbidden: 需要会员权限');
  }
  return {
    userId: user.id,
    email: user.email ?? undefined,
    role: user.role,
    memberExpiresAt: user.memberExpiresAt,
  };
}

export function isMemberRole(role: string): role is 'member' {
  return role === 'member';
}
