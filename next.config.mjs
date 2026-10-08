// CSP en modo Report-Only: NO bloquea nada (solo registra violaciones en consola),
// para endurecer sin riesgo de romper GA4 / Meta Pixel / Clarity / Leaflet / YouTube.
// Cuando se valide sin violaciones reales, pasar el key a 'Content-Security-Policy'
// (enforce). Allowlist según los terceros que el sitio realmente usa.
const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  // El Pixel de Meta manda eventos por <form> e <iframe> ocultos a facebook.com/tr.
  "form-action 'self' https://www.facebook.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://www.clarity.ms https://*.clarity.ms",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // analytics.google.com no matchea *.google-analytics.com (dominio distinto):
  // GA4 manda /g/collect ahí y sin esta entrada quedaba como violación.
  "connect-src 'self' https://*.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com https://*.clarity.ms https://api.microlink.io https://*.supabase.co https://meethilo.com https://www.tokkobroker.com https://*.basemaps.cartocdn.com https://tile.openstreetmap.org",
  // kuula.co (tours 360 de /dockgarden) y cloudflarestream (videos del
  // desarrollador vía Brickfy) se embeben en iframes; www.google.com es el mapa
  // embebido de /emprendimientos/fisherton-work.
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://kuula.co https://*.cloudflarestream.com https://www.facebook.com https://www.google.com",
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
      // URLs del sitio viejo (inmobiliariaippoliti.com, que llega acá con la
      // misma ruta): Google todavía las manda y daban 404. Van al listado con
      // la operación y el tipo que dice la URL (sin adivinar la propiedad).
      ...[['venta', 'venta'], ['alquiler', 'alquiler']].flatMap(([seg, op]) => [
        { source: `/${seg}/:t(casa|casas)/:rest*`, destination: `/propiedades?operacion=${op}&tipo=casa`, permanent: true },
        { source: `/${seg}/:t(departamento|departamentos)/:rest*`, destination: `/propiedades?operacion=${op}&tipo=departamento`, permanent: true },
        { source: `/${seg}/:t(terreno|terrenos|lote|lotes)/:rest*`, destination: `/propiedades?operacion=${op}&tipo=terreno`, permanent: true },
        { source: `/${seg}/:t(local|locales)/:rest*`, destination: `/propiedades?operacion=${op}&tipo=local`, permanent: true },
        { source: `/${seg}/:rest*`, destination: `/propiedades?operacion=${op}`, permanent: true },
      ]),
      // Selecciones viejas de Hilo (hasta 27-sep): siinmobiliaria.com/propiedad/{tokko_id}.
      // Ese número es el id de la ficha (getIdFromSlug lee el número del principio).
      { source: '/propiedad/:id(\\d+)', destination: '/propiedades/:id', permanent: true },
      { source: '/propiedad/:rest*', destination: '/propiedades', permanent: true },
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
      // Planos que Hilo sirve ya recortados (y parados para el celular).
      { protocol: 'https', hostname: 'meethilo.com', pathname: '/api/public/plano/**' },
      // Fotos de avisos externos (Zonaprop/Navent) en fichas importadas. Se
      // sirven directo del CDN del portal (ver isExternalCdn en HeroGallery).
      { protocol: 'https', hostname: '*.zonapropcdn.com' },
      { protocol: 'https', hostname: '*.naventcdn.com' },
      // Fotos de avisos de colegas copiadas a Cloudflare R2 por Hilo (7-oct-2026):
      // las fichas de verficha las muestran desde ahí.
      { protocol: 'https', hostname: 'fotos.likeprop.app' },
      // El mismo bucket de R2 con el dominio de SI (lo que ven los clientes en verficha).
      { protocol: 'https', hostname: 'fotos.verficha.casa' },
      // Colegas de la Red Propia EN VIVO en la selección del cliente (Rosario):
      // las originales pesan 1-2 MB; optimizadas, como las de Tokko.
      { protocol: 'https', hostname: 'propia-assets-v2.nyc3.cdn.digitaloceanspaces.com' },
      { protocol: 'https', hostname: 'propia-assets-v2.nyc3.digitaloceanspaces.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com', pathname: '/portales-prod-images/**' },
    ],
  },
};

export default nextConfig;
