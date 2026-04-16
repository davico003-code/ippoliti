import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/agentes/', '/seleccion/'],
    },
    sitemap: 'https://siinmobiliaria.com/sitemap.xml',
  }
}
