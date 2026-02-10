const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去掉易混淆的 0/O, 1/I

/**
 * 生成 6 位邀请码（字母数字），用于战役邀请链接与加入页输入。
 */
export function generateInviteCode(): string {
  let code = '';
  const bytes = new Uint8Array(6);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 6; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < 6; i++) {
    code += CHARS[bytes[i] % CHARS.length];
  }
  return code;
}
