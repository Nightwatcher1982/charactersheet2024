/**
 * 校验角色卡服务签发的 JWT，用于 DM 战役服务鉴权。
 * 与角色卡服务共用 JWT_SECRET（HS256）。
 */

import { jwtVerify } from 'jose';

export interface JwtPayload {
  userId: string;
  email: string | null;
  role: string;
  memberExpiresAt: string | null;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET 未配置或长度不足 32 字符');
  }
  return new TextEncoder().encode(secret);
}

/**
 * 用 token 字符串校验 JWT，返回 payload（供 SSE 等无法带 Header 的场景从 query 传 token）。
 * token 缺失、过期或非法时统一抛 Error('Unauthorized')，便于接口返回 401。
 */
export async function getAuthFromToken(token: string): Promise<JwtPayload> {
  const t = token?.trim();
  if (!t) throw new Error('Unauthorized');
  const secret = getSecret();
  try {
    const { payload } = await jwtVerify(t, secret);
    const userId = payload.userId ?? payload.sub;
    if (typeof userId !== 'string') throw new Error('Unauthorized');
    return {
      userId,
      email: typeof payload.email === 'string' ? payload.email : null,
      role: typeof payload.role === 'string' ? payload.role : 'normal',
      memberExpiresAt:
        typeof payload.memberExpiresAt === 'string' ? payload.memberExpiresAt : null,
    };
  } catch {
    throw new Error('Unauthorized');
  }
}

/**
 * 从请求头 Authorization: Bearer <token> 中解析并校验 JWT，返回 payload。
 * 无 token 或校验失败时抛错。
 */
export async function getAuthFromRequest(request: Request): Promise<JwtPayload> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new Error('Unauthorized');
  }
  return getAuthFromToken(token);
}

/**
 * 判断是否为有效会员（供「仅会员可创建战役」等逻辑使用）。
 */
export function isMember(payload: JwtPayload): boolean {
  if (payload.role !== 'member') return false;
  if (!payload.memberExpiresAt) return true;
  return new Date(payload.memberExpiresAt) > new Date();
}
