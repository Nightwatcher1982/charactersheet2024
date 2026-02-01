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

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (!basePath) return path;

  const normalizedBasePath = (() => {
    const withLeadingSlash = basePath.startsWith('/') ? basePath : `/${basePath}`;
    const trimmed = withLeadingSlash.replace(/\/+$/, '');
    return trimmed === '/' ? '' : trimmed;
  })();

  return `${normalizedBasePath}${path}`;
}
