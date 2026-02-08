import { prisma } from '@/lib/prisma';

export async function logAdminAction(
  adminId: string,
  action: string,
  targetUserId?: string,
  payload?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        targetUserId: targetUserId ?? undefined,
        payload: payload ? (payload as object) : undefined,
      },
    });
  } catch (e) {
    console.error('admin audit log error:', e);
  }
}
