import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export interface SessionData {
  userId?: string;
  email?: string;
  phone?: string; // 兼容旧 session
  tokenVersion?: number; // 与 User.tokenVersion 一致，用于多端登出
  isLoggedIn: boolean;
}

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 15; // 15 天
export const REMEMBER_ME_MAX_AGE = 60 * 60 * 24 * 30; // 30 天

export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
  cookieName: 'dnd_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: DEFAULT_MAX_AGE,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    throw new Error('Unauthorized');
  }
  const user = await prisma.user.findFirst({
    where: { id: session.userId, deletedAt: null },
    select: { tokenVersion: true },
  });
  if (!user) {
    session.destroy();
    throw new Error('Unauthorized');
  }
  const sessionVersion = session.tokenVersion ?? 0;
  if (user.tokenVersion !== sessionVersion) {
    session.destroy();
    throw new Error('Unauthorized');
  }
  return session as Required<Pick<SessionData, 'userId' | 'email'>> & { isLoggedIn: true };
}
