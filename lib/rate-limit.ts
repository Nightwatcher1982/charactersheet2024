/**
 * 简单限流：发验证码按邮箱/IP 频率；登录失败按 IP 次数
 * 使用内存 Map，多实例部署时可改为 Redis
 */

const SEND_CODE_COOLDOWN_MS = 60 * 1000; // 同一邮箱 60 秒内只能发一次
const LOGIN_FAIL_WINDOW_MS = 15 * 60 * 1000; // 15 分钟窗口
const MAX_LOGIN_FAIL_PER_IP = 10; // 同一 IP 15 分钟内最多失败 10 次

const lastSendByEmail = new Map<string, number>();
const loginFailCountByIp = new Map<string, { count: number; resetAt: number }>();

export function checkSendCodeRateLimit(email: string): { ok: boolean; remainingSeconds?: number } {
  const key = email.toLowerCase();
  const last = lastSendByEmail.get(key);
  if (!last) return { ok: true };
  const elapsed = Date.now() - last;
  if (elapsed >= SEND_CODE_COOLDOWN_MS) return { ok: true };
  return {
    ok: false,
    remainingSeconds: Math.ceil((SEND_CODE_COOLDOWN_MS - elapsed) / 1000),
  };
}

export function recordSendCode(email: string): void {
  lastSendByEmail.set(email.toLowerCase(), Date.now());
}

export function checkLoginFailRateLimit(ip: string): { ok: boolean } {
  const entry = loginFailCountByIp.get(ip);
  if (!entry) return { ok: true };
  if (Date.now() > entry.resetAt) return { ok: true };
  return { ok: entry.count < MAX_LOGIN_FAIL_PER_IP };
}

export function recordLoginFail(ip: string): void {
  const entry = loginFailCountByIp.get(ip);
  const now = Date.now();
  if (!entry || now > entry.resetAt) {
    loginFailCountByIp.set(ip, {
      count: 1,
      resetAt: now + LOGIN_FAIL_WINDOW_MS,
    });
    return;
  }
  entry.count += 1;
}

export function clearLoginFail(ip: string): void {
  loginFailCountByIp.delete(ip);
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const xri = request.headers.get('x-real-ip');
  if (xri) return xri.trim();
  return 'unknown';
}
