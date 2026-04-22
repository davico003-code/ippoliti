/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/guia',
        destination: '/guia/index.html',
      },
    ]
  },
  async redirects() {
    return [
      // Redirect vieja guía a la nueva
      {
        source: '/guia-comprador',
        destination: '/guia',
        permanent: true,
      },
      // Redirect old domain to new
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'inmobiliariaippoliti.com' }],
        destination: 'https://siinmobiliaria.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.inmobiliariaippoliti.com' }],
        destination: 'https://siinmobiliaria.com/:path*',
        permanent: true,
      },
    ]
  },
  compress: true,
  images: {
    unoptimized: false,
    formats: ['image/webp'],
    minimumCacheTTL: 2678400,
    deviceSizes: [360, 640, 828, 1080, 1920],
    remotePatterns: [
      { protocol: 'https', hostname: 'static.tokkobroker.com' },
      { protocol: 'https', hostname: 'www.tokkobroker.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'cdn.tokkobroker.com' },
      { protocol: 'http', hostname: 'static.tokkobroker.com' },
    ],
  },
};

export default nextConfig;
