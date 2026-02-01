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
  ...(normalizedBasePath ? { basePath: normalizedBasePath } : {}),
};

module.exports = nextConfig;
