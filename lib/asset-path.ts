/**
 * 获取静态资源的完整路径（包含 basePath）
 * @param path 资源路径，以 / 开头
 * @returns 完整路径
 */
export function getAssetPath(path: string): string {
  // Next.js 在客户端会自动暴露 __NEXT_DATA__.assetPrefix
  // 但对于静态资源，最简单的方法是直接从环境变量读取
  // 注意：NEXT_PUBLIC_ 前缀的变量会在构建时嵌入到客户端代码中
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  if (!basePath) return path;
  
  // 标准化 basePath（确保以 / 开头，不以 / 结尾）
  const normalizedBasePath = (() => {
    const withLeadingSlash = basePath.startsWith('/') ? basePath : `/${basePath}`;
    const trimmed = withLeadingSlash.replace(/\/+$/, '');
    return trimmed === '/' ? '' : trimmed;
  })();
  
  return `${normalizedBasePath}${path}`;
}
