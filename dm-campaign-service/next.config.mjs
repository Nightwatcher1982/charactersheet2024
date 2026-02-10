/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  webpack: (config, { dev }) => {
    if (dev) config.cache = false;
    return config;
  },
  async headers() {
    // 开发时禁止缓存，避免 rm -rf .next 重启后浏览器仍请求已失效的 chunk 导致 404
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path*',
          headers: [
            { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          ],
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
