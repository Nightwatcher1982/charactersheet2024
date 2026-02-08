/** @type {import('next').NextConfig} */
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const normalizedBasePath = (() => {
  if (!rawBasePath) return '';
  const withLeadingSlash = rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`;
  // 去掉末尾 /
  const trimmed = withLeadingSlash.replace(/\/+$/, '');
  return trimmed === '/' ? '' : trimmed;
})();

const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  trailingSlash: true,
  ...(normalizedBasePath ? { basePath: normalizedBasePath } : {}),
  images: {
    // 启用 WebP/AVIF 等格式，减小体积、加快加载
    formats: ['image/avif', 'image/webp'],
  },
  // 开发环境禁用 webpack 文件系统缓存，避免 .next/cache 损坏导致 404（ENOENT pack.gz）
  webpack: (config, { dev }) => {
    if (dev) config.cache = false;
    return config;
  },
};

module.exports = nextConfig;
