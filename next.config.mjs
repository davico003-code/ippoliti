// CSP en modo Report-Only: NO bloquea nada (solo registra violaciones en consola),
// para endurecer sin riesgo de romper GA4 / Meta Pixel / Clarity / Leaflet / YouTube.
// Cuando se valide sin violaciones reales, pasar el key a 'Content-Security-Policy'
// (enforce). Allowlist según los terceros que el sitio realmente usa.
const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://www.clarity.ms https://*.clarity.ms",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // analytics.google.com no matchea *.google-analytics.com (dominio distinto):
  // GA4 manda /g/collect ahí y sin esta entrada quedaba como violación.
  "connect-src 'self' https://*.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com https://*.clarity.ms https://api.microlink.io https://*.supabase.co https://meethilo.com https://www.tokkobroker.com https://*.basemaps.cartocdn.com https://tile.openstreetmap.org",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "media-src 'self' blob: https://*.public.blob.vercel-storage.com https://*.supabase.co",
  "worker-src 'self' blob:",
].join('; ')

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
          { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
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
      // Consolidación SEO: la landing vieja de San Sebastián canibalizaba al hub
      // de barrios-privados (dos páginas self-canonical compitiendo por la misma
      // keyword). 301 → el hub, que tiene 2.4x más contenido.
      {
        source: '/barrio-san-sebastian-funes',
        destination: '/barrios-privados/san-sebastian',
        permanent: true,
      },
      // Renombre /herramientas → /recursos
      {
        source: '/herramientas',
        destination: '/recursos',
        permanent: true,
      },
      {
        source: '/herramientas/calculadora-alquiler',
        destination: '/recursos/calculadora-alquiler',
        permanent: true,
      },
      {
        source: '/herramientas/ajuste-alquiler',
        destination: '/recursos/ajuste-alquiler',
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
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400,
    deviceSizes: [360, 640, 828, 1080, 1920],
    remotePatterns: [
      { protocol: 'https', hostname: 'static.tokkobroker.com' },
      { protocol: 'https', hostname: 'www.tokkobroker.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'cdn.tokkobroker.com' },
      { protocol: 'http', hostname: 'static.tokkobroker.com' },
      // Overrides de imagen de notas subidos a Vercel Blob (/admin/notas).
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      // Fotos servidas desde Hilo (Supabase Storage) — puente Tokko → Hilo.
      { protocol: 'https', hostname: '*.supabase.co' },
      // Fotos de avisos externos (Zonaprop/Navent) en fichas importadas. Se
      // sirven directo del CDN del portal (ver isExternalCdn en HeroGallery).
      { protocol: 'https', hostname: '*.zonapropcdn.com' },
      { protocol: 'https', hostname: '*.naventcdn.com' },
    ],
  },
};

export default nextConfig;
