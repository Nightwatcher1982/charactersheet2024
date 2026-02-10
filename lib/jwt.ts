/**
 * JWT 签发与校验，供 DM 战役服务等跨服务鉴权使用。
 * 使用 HS256，payload 含 userId、email、role、memberExpiresAt，过期时间由调用方或默认 24h。
 */

import { SignJWT, jwtVerify } from 'jose';

const ALG = 'HS256';
const DEFAULT_EXPIRES_IN_HOURS = 24;

export interface JwtPayload {
  userId: string;
  email: string | null;
  role: string;
  memberExpiresAt: string | null; // ISO 日期字符串
  exp?: number;
  iat?: number;
}

export interface UserForToken {
  id: string;
  email: string | null;
  role: string;
  memberExpiresAt: Date | null;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET 未配置或长度不足 32 字符');
  }
  return new TextEncoder().encode(secret);
}

/**
 * 签发 JWT，供 DM 服务等携带使用。
 */
export async function createToken(
  user: UserForToken,
  expiresInHours: number = DEFAULT_EXPIRES_IN_HOURS
): Promise<string> {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInHours * 3600;
  return new SignJWT({
    userId: user.id,
    email: user.email ?? null,
    role: user.role,
    memberExpiresAt: user.memberExpiresAt
      ? user.memberExpiresAt.toISOString()
      : null,
  })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(secret);
}

/**
 * 校验 JWT，返回 payload；过期或非法则抛错。
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  const secret = getSecret();
  const { payload } = await jwtVerify(token, secret);
  const userId = payload.userId ?? payload.sub;
  if (typeof userId !== 'string') {
    throw new Error('无效的 JWT payload');
  }
  return {
    userId,
    email: typeof payload.email === 'string' ? payload.email : null,
    role: typeof payload.role === 'string' ? payload.role : 'normal',
    memberExpiresAt:
      typeof payload.memberExpiresAt === 'string'
        ? payload.memberExpiresAt
        : null,
    exp: typeof payload.exp === 'number' ? payload.exp : undefined,
    iat: typeof payload.iat === 'number' ? payload.iat : undefined,
  };
}

/**
 * 从请求中解析鉴权：优先 Authorization: Bearer <jwt>，否则走 cookie session。
 * 用于 /api/characters 等需同时支持「角色卡前端 cookie」与「DM 服务带 JWT」的接口。
 */
export interface AuthFromRequest {
  userId: string;
  email?: string;
  role?: string;
  memberExpiresAt?: string | null;
}

export async function getAuthFromRequest(
  request: Request
): Promise<AuthFromRequest> {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      try {
        const payload = await verifyToken(token);
        return {
          userId: payload.userId,
          email: payload.email ?? undefined,
          role: payload.role,
          memberExpiresAt: payload.memberExpiresAt,
        };
      } catch {
        // token 过期或非法， fallback 到 session 或抛错
      }
    }
  }
  const { requireAuth } = await import('@/lib/session');
  const session = await requireAuth();
  return {
    userId: session.userId!,
    email: session.email,
  };
}
