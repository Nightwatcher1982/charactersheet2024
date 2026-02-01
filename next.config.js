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
};

module.exports = nextConfig;
