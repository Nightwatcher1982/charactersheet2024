/**
 * 获取静态资源的完整路径（包含 basePath，或 CDN 地址）
 * - 若配置了 NEXT_PUBLIC_PIC_BASE_URL 且 path 以 /pic/ 开头，返回 CDN 地址（适合图片走 OSS+CDN）
 * - 否则返回 basePath + path（当前站点相对路径）
 * @param path 资源路径，以 / 开头
 * @returns 完整 URL 或路径
 */
export function getAssetPath(path: string): string {
  const cdnBase = process.env.NEXT_PUBLIC_PIC_BASE_URL;
  if (cdnBase && path.startsWith('/pic/')) {
    const base = cdnBase.replace(/\/+$/, '');
    return `${base}${path}`;
  }

  const basePath = getEffectiveBasePath();
  if (!basePath) return path;
  return `${basePath}${path}`;
}

/**
 * 获取当前生效的 basePath（构建时注入或浏览器端从 pathname 推断）
 * 用于子路径部署时 API/资源路径正确带上前缀。
 */
function getEffectiveBasePath(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const normalizedEnv = (() => {
    if (!fromEnv) return '';
    const withLead = fromEnv.startsWith('/') ? fromEnv : `/${fromEnv}`;
    const t = withLead.replace(/\/+$/, '');
    return t === '' || t === '/' ? '' : t;
  })();
  if (normalizedEnv) return normalizedEnv;

  if (typeof window === 'undefined') return '';
  const pathname = window.location.pathname || '';
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '';
  const first = segments[0];
  if (first === 'login' || first === 'api' || first === 'admin' || first === 'settings' || first === 'characters' || first === 'create') return '';
  return `/${first}`;
}

/**
 * 获取 API 请求的完整路径（含 basePath，用于子路径部署时 fetch 正确命中接口）
 * @param path 以 / 开头的 API 路径，如 /api/auth/me
 */
export function getApiUrl(path: string): string {
  const basePath = getEffectiveBasePath();
  if (!basePath) return path;
  return `${basePath}${path}`;
}
