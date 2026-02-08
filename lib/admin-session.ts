import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface AdminSessionData {
  adminId?: string;
  email?: string;
  isAdmin: boolean;
}

export const adminSessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
  cookieName: 'dnd_admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 2, // 2 天
  },
};

export async function getAdminSession(): Promise<IronSession<AdminSessionData>> {
  return getIronSession<AdminSessionData>(await cookies(), adminSessionOptions);
}

export async function requireAdmin(): Promise<Required<Pick<AdminSessionData, 'adminId' | 'email'>> & { isAdmin: true }> {
  const session = await getAdminSession();
  if (!session.isAdmin || !session.adminId || !session.email) {
    throw new Error('AdminRequired');
  }
  return session as Required<Pick<AdminSessionData, 'adminId' | 'email'>> & { isAdmin: true };
}
