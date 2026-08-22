import type { MetadataRoute } from 'next'
import { getProperties, generatePropertySlug } from '@/lib/tokko'
import { getAllPosts } from '@/lib/blog'
import { getDevelopments, generateDevSlug } from '@/lib/developments'
import { BARRIOS } from '@/lib/barrios'
import { detectarEdificios } from '@/lib/edificios'
import { sanitizeProperty } from '@/lib/tokko'
import { BARRIOS_TASADOR } from '@/lib/tasador/barrios'
import { CLUSTERS, clusterUrl } from '@/lib/clusters'
import { tiposTasadorIndexables } from '@/lib/seo/tasador-indexing'

const BASE = 'https://siinmobiliaria.com'

// Regenerar cada hora para que las notas programadas entren solas al sitemap
// al llegar su fecha (getAllPosts las filtra hasta entonces).
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/propiedades`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/nosotros`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/tasaciones`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/inmobiliaria-roldan`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/inmobiliaria-funes`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/propiedades-roldan`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/alquiler-roldan`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/hausing`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/informes`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/mercado-inmobiliario-funes`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/guia`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/recursos`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/recursos/calculadora-alquiler`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/recursos/ajuste-alquiler`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/recursos/costos-de-construccion`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/recursos/mapa-funes`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/recursos/asistente-obras`, changeFrequency: 'monthly', priority: 0.8 },
    // Fincazul es ruta estática (no viene en el feed de Tokko, así que el mapeo
    // de getDevelopments() de abajo nunca la incluye).
    { url: `${BASE}/emprendimientos/fincazul`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/barrio-los-aromos-roldan`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/barrio-don-mateo-funes`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/barrio-el-molino-roldan`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/casas-en-venta-funes`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/terrenos-funes`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/casas-en-venta-roldan`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/terrenos-roldan`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/inmobiliaria-fisherton`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/casas-en-venta-fisherton`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/departamentos-puerto-norte`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/departamentos-pichincha`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/departamentos-centro-rosario`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/departamentos-echesortu`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/departamentos-abasto`, changeFrequency: 'weekly', priority: 0.9 },
  ]

  let propertyRoutes: MetadataRoute.Sitemap = []
  let propertyObjects: ReturnType<typeof sanitizeProperty>[] = []
  try {
    // Sin limit: trae TODO el inventario (antes {limit:100} cortaba a 100 y en
    // Hilo dejaba ~150 propiedades fuera del sitemap → sin indexar).
    const data = await getProperties()
    // Defensa: si el feed alguna vez incluye despublicadas, no las listamos.
    propertyObjects = (data.objects ?? []).map(sanitizeProperty).filter(p => !p.deleted_at)
    propertyRoutes = propertyObjects.map(p => ({
      url: `${BASE}/propiedades/${generatePropertySlug(p)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (err) {
    // Catch NO silencioso: un 403 de Tokko acá publica un sitemap sin las ~220
    // fichas y nadie se entera. Al menos que quede en los logs de Vercel.
    console.error('[sitemap] No se pudieron listar propiedades:', err instanceof Error ? err.message : err)
  }

  let blogRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/blog`, changeFrequency: 'weekly', priority: 0.7 },
  ]
  try {
    blogRoutes = blogRoutes.concat(
      (await getAllPosts()).map(post => {
        // new Date(post.date) con una fecha corrupta produce Invalid Date y el
        // serializador del sitemap revienta con RangeError → sitemap.xml 500.
        const d = new Date(post.date)
        return {
          url: `${BASE}/blog/${post.slug}`,
          ...(isNaN(d.getTime()) ? {} : { lastModified: d }),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }
      }),
    )
  } catch (err) {
    console.error('[sitemap] No se pudieron listar posts del blog:', err instanceof Error ? err.message : err)
  }

  let devRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/emprendimientos`, changeFrequency: 'weekly', priority: 0.8 },
  ]
  try {
    const devs = await getDevelopments()
    devRoutes = devRoutes.concat(devs.map(d => ({
      url: `${BASE}/emprendimientos/${generateDevSlug(d)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })))
  } catch (err) {
    console.error('[sitemap] No se pudieron listar emprendimientos:', err instanceof Error ? err.message : err)
  }

  const barriosRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/barrios-privados`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...BARRIOS.map((b) => ({
      url: `${BASE}/barrios-privados/${b.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ]

  // Solo publicamos landings con referencias locales suficientes. El tasador
  // puede resolver otras combinaciones, pero no deben competir en el índice.
  const tasadorRoutes: MetadataRoute.Sitemap = BARRIOS_TASADOR.flatMap((barrio) => {
    return tiposTasadorIndexables(barrio).map((tipo) => ({
      url: `${BASE}/tasar/${tipo}-${barrio.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  })

  // Páginas de edificio (departamentos agrupados por dirección). Reusa el
  // inventario ya fetcheado arriba en vez de pegarle a Tokko de nuevo.
  let edificioRoutes: MetadataRoute.Sitemap = []
  try {
    edificioRoutes = detectarEdificios(propertyObjects).map((e) => ({
      url: `${BASE}/edificios/${e.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (err) {
    console.error('[sitemap] No se pudieron detectar edificios:', err instanceof Error ? err.message : err)
  }

  // Landings por cluster (Growth OS §23): generadas desde el catálogo cerrado.
  const clusterRoutes: MetadataRoute.Sitemap = CLUSTERS.map((c) => ({
    url: clusterUrl(c),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [...staticRoutes, ...clusterRoutes, ...edificioRoutes, ...tasadorRoutes, ...barriosRoutes, ...blogRoutes, ...devRoutes, ...propertyRoutes]
}
