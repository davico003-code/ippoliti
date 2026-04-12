import type { MetadataRoute } from 'next'
import { getProperties, generatePropertySlug } from '@/lib/tokko'
import { getAllPosts } from '@/lib/blog'
import { getDevelopments, generateDevSlug } from '@/lib/developments'

const BASE = 'https://siinmobiliaria.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/propiedades`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/nosotros`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/tasaciones`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/inmobiliaria-roldan`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/inmobiliaria-funes`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/propiedades-roldan`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/alquiler-roldan`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/hausing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/informes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/guia-comprador`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/school`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/barrio-san-sebastian-funes`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/barrio-los-aromos-roldan`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/barrio-don-mateo-funes`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/barrio-el-molino-roldan`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/casas-en-venta-funes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/terrenos-funes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/casas-en-venta-roldan`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/terrenos-roldan`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ]

  let propertyRoutes: MetadataRoute.Sitemap = []
  try {
    const data = await getProperties({ limit: 100 })
    propertyRoutes = (data.objects ?? []).map(p => ({
      url: `${BASE}/propiedades/${generatePropertySlug(p)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {}

  const blogRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    ...getAllPosts().map(post => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]

  let devRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/emprendimientos`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]
  try {
    const devs = await getDevelopments()
    devRoutes = devRoutes.concat(devs.map(d => ({
      url: `${BASE}/emprendimientos/${generateDevSlug(d)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })))
  } catch {}

  return [...staticRoutes, ...blogRoutes, ...devRoutes, ...propertyRoutes]
}
