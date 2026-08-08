import type { MetadataRoute } from 'next'
import { getProperties, generatePropertySlug } from '@/lib/tokko'
import { getAllPosts } from '@/lib/blog'
import { getDevelopments, generateDevSlug } from '@/lib/developments'
import { BARRIOS } from '@/lib/barrios'
import { detectarEdificios } from '@/lib/edificios'
import { sanitizeProperty } from '@/lib/tokko'
import { BARRIOS_TASADOR } from '@/lib/tasador/barrios'

const BASE = 'https://siinmobiliaria.com'

// Regenerar cada hora para que las notas programadas entren solas al sitemap
// al llegar su fecha (getAllPosts las filtra hasta entonces).
export const revalidate = 3600

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
    { url: `${BASE}/mercado-inmobiliario-funes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/guia`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/recursos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/recursos/calculadora-alquiler`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/recursos/ajuste-alquiler`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/recursos/costos-de-construccion`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/recursos/mapa-funes`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/recursos/asistente-obras`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    // Fincazul es ruta estática (no viene en el feed de Tokko, así que el mapeo
    // de getDevelopments() de abajo nunca la incluye).
    { url: `${BASE}/emprendimientos/fincazul`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/barrio-los-aromos-roldan`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/barrio-don-mateo-funes`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/barrio-el-molino-roldan`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/casas-en-venta-funes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/terrenos-funes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/casas-en-venta-roldan`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/terrenos-roldan`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/inmobiliaria-fisherton`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/casas-en-venta-fisherton`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/departamentos-puerto-norte`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/departamentos-pichincha`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/departamentos-centro-rosario`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/departamentos-echesortu`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/departamentos-abasto`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
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
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (err) {
    // Catch NO silencioso: un 403 de Tokko acá publica un sitemap sin las ~220
    // fichas y nadie se entera. Al menos que quede en los logs de Vercel.
    console.error('[sitemap] No se pudieron listar propiedades:', err instanceof Error ? err.message : err)
  }

  let blogRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
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
  } catch (err) {
    console.error('[sitemap] No se pudieron listar emprendimientos:', err instanceof Error ? err.message : err)
  }

  const barriosRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/barrios-privados`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...BARRIOS.map((b) => ({
      url: `${BASE}/barrios-privados/${b.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ]

  // Landings de tasación (/tasar/{tipo}-{barrio}). Priorizamos los barrios con
  // negocio real: cerrados o con muestras propias de terrenos.
  const tasadorRoutes: MetadataRoute.Sitemap = BARRIOS_TASADOR.flatMap((b) => {
    const tipos: string[] = []
    if (b.cerrado || b.muestras > 0) tipos.push('casa', 'lote')
    if (b.muestrasDepto > 0 || b.ciudad === 'Rosario') tipos.push('departamento')
    return tipos.map((tipo) => ({
      url: `${BASE}/tasar/${tipo}-${b.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: b.muestras > 0 || b.muestrasDepto > 0 ? 0.8 : 0.6,
    }))
  })

  // Páginas de edificio (departamentos agrupados por dirección). Reusa el
  // inventario ya fetcheado arriba en vez de pegarle a Tokko de nuevo.
  let edificioRoutes: MetadataRoute.Sitemap = []
  try {
    edificioRoutes = detectarEdificios(propertyObjects).map((e) => ({
      url: `${BASE}/edificios/${e.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (err) {
    console.error('[sitemap] No se pudieron detectar edificios:', err instanceof Error ? err.message : err)
  }

  return [...staticRoutes, ...edificioRoutes, ...tasadorRoutes, ...barriosRoutes, ...blogRoutes, ...devRoutes, ...propertyRoutes]
}
