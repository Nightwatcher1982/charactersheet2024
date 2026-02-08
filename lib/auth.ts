import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export type UserRole = 'normal' | 'member';

export async function requireMember(): Promise<{ userId: string; email?: string; role: string }> {
  const session = await requireAuth();
  const user = await prisma.user.findFirst({
    where: { id: session.userId, deletedAt: null },
    select: { id: true, email: true, role: true },
  });
  if (!user) throw new Error('Unauthorized');
  if (user.role !== 'member') {
    throw new Error('Forbidden: 需要会员权限');
  }
  return { userId: user.id, email: user.email ?? undefined, role: user.role };
}

export function isMemberRole(role: string): role is 'member' {
  return role === 'member';
}
