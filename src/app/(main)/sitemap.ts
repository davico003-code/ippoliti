import type { MetadataRoute } from 'next'
import { getProperties, generatePropertySlug, sanitizeProperty, type TokkoProperty } from '@/lib/tokko'
import { getAllPosts } from '@/lib/blog'
import { getDevelopments, generateDevSlug } from '@/lib/developments'
import { BARRIOS } from '@/lib/barrios'
import { detectarEdificios } from '@/lib/edificios'
import { CLUSTERS, clusterUrl, filterForCluster } from '@/lib/clusters'
import { esIndexableTasar, mercadoDe } from '@/lib/seo/tasar'
import { cargarTasar } from '@/lib/tasador/cargar-tasar'
import { videos, esIndexable } from '@/lib/contenidos'
// Último commit de cada página fija (lo regenera scripts/sitemap-fechas.mjs).
import FECHAS from '@/data/sitemap-fechas.json'

const BASE = 'https://siinmobiliaria.com'

// Regenerar cada hora para que las notas programadas entren solas al sitemap
// al llegar su fecha (getAllPosts las filtra hasta entonces).
export const revalidate = 3600

// <lastmod> REAL de cada URL (nunca "hoy" por defecto): la propiedad, su última
// edición en Hilo; la nota, su edición; la página fija, su último commit; el
// listado, lo más nuevo que muestra. Si no se sabe, va sin lastmod: una fecha
// inventada le enseña a Google a ignorarlas todas.
const fechaFija = (ruta: string): string | undefined => (FECHAS as Record<string, string>)[ruta]

/** "2026-10-03" (día de Argentina) de una fecha ISO; undefined si no es una fecha. */
function dia(x: string | Date | null | undefined): string | undefined {
  if (!x) return undefined
  if (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x)) return x
  const d = new Date(x)
  return Number.isNaN(d.getTime()) ? undefined : d.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
}
const masNueva = (...xs: (string | undefined)[]): string | undefined => xs.filter(Boolean).sort().pop()
const conFecha = (lastModified: string | undefined) => (lastModified ? { lastModified } : {})

type Frecuencia = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

/** Una página fija, con la fecha de su último commit. */
const fija = (ruta: string, changeFrequency: Frecuencia, priority: number): MetadataRoute.Sitemap[number] => ({
  url: ruta === '/' ? BASE : `${BASE}${ruta}`,
  ...conFecha(fechaFija(ruta)),
  changeFrequency,
  priority,
})

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fijas: MetadataRoute.Sitemap = [
    fija('/', 'daily', 1),
    fija('/contenidos', 'weekly', 0.8),
    fija('/nosotros', 'monthly', 0.5),
    fija('/tasaciones', 'monthly', 0.7),
    fija('/inmobiliaria-roldan', 'monthly', 0.8),
    fija('/inmobiliaria-funes', 'monthly', 0.8),
    fija('/propiedades-roldan', 'weekly', 0.8),
    fija('/alquiler-roldan', 'weekly', 0.8),
    fija('/alquileres-temporarios', 'weekly', 0.7),
    fija('/hausing', 'weekly', 0.8),
    fija('/informes', 'weekly', 0.7),
    fija('/mercado-inmobiliario-funes', 'weekly', 0.8),
    fija('/guia', 'monthly', 0.9),
    fija('/recursos', 'monthly', 0.7),
    fija('/recursos/calculadora-alquiler', 'monthly', 0.8),
    fija('/recursos/ajuste-alquiler', 'monthly', 0.8),
    fija('/recursos/costos-de-construccion', 'monthly', 0.8),
    fija('/recursos/mapa-funes', 'monthly', 0.8),
    fija('/recursos/asistente-obras', 'monthly', 0.8),
    fija('/recursos/analisis-comercial', 'monthly', 0.8),
    // Fincazul es ruta estática (no viene en el feed de Tokko, así que el mapeo
    // de getDevelopments() de abajo nunca la incluye).
    fija('/emprendimientos/fincazul', 'weekly', 0.8),
    // Fisherton Work: mismo caso que Fincazul (ruta estática, no está en HILO).
    fija('/emprendimientos/fisherton-work', 'weekly', 0.8),
    fija('/emprendimientos/tierra-nueva', 'weekly', 0.8),
    fija('/barrio-los-aromos-roldan', 'monthly', 0.7),
    fija('/barrio-don-mateo-funes', 'monthly', 0.7),
    fija('/barrio-el-molino-roldan', 'monthly', 0.7),
    fija('/casas-en-venta-funes', 'weekly', 0.9),
    fija('/terrenos-funes', 'weekly', 0.9),
    fija('/casas-en-venta-roldan', 'weekly', 0.9),
    fija('/terrenos-roldan', 'weekly', 0.9),
    fija('/inmobiliaria-fisherton', 'monthly', 0.8),
    fija('/casas-en-venta-fisherton', 'weekly', 0.9),
    fija('/departamentos-puerto-norte', 'weekly', 0.9),
    fija('/departamentos-pichincha', 'weekly', 0.9),
    fija('/departamentos-centro-rosario', 'weekly', 0.9),
    fija('/departamentos-echesortu', 'weekly', 0.9),
    fija('/departamentos-abasto', 'weekly', 0.9),
  ]

  // Videos de Mundo SI: solo los que tienen texto propio suficiente (el resto
  // va noindex: ver esIndexable en lib/contenidos).
  const videoRoutes: MetadataRoute.Sitemap = videos.filter(esIndexable).map((v) => ({
    url: `${BASE}/contenidos/${v.id}`,
    ...conFecha(masNueva(dia(v.uploadDate), fechaFija('/contenidos/[id]'))),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  let propertyRoutes: MetadataRoute.Sitemap = []
  let propertyObjects: TokkoProperty[] = []
  // Última edición de cada propiedad en Hilo (campo last_update del feed).
  const editada = new Map<number, string>()
  const ultimaDe = (ps: Pick<TokkoProperty, 'id'>[]) => masNueva(...ps.map((p) => editada.get(p.id)))
  try {
    // Sin limit: trae TODO el inventario (antes {limit:100} cortaba a 100 y en
    // Hilo dejaba ~150 propiedades fuera del sitemap → sin indexar).
    const data = await getProperties()
    for (const p of data.objects ?? []) {
      const d = dia(p.last_update)
      if (d) editada.set(p.id, d)
    }
    // Defensa: si el feed alguna vez incluye despublicadas, no las listamos.
    propertyObjects = (data.objects ?? []).map(sanitizeProperty).filter(p => !p.deleted_at)
    propertyRoutes = [
      { url: `${BASE}/propiedades`, ...conFecha(masNueva(ultimaDe(propertyObjects), fechaFija('/propiedades'))), changeFrequency: 'hourly' as const, priority: 0.9 },
      ...propertyObjects.map(p => ({
        url: `${BASE}/propiedades/${generatePropertySlug(p)}`,
        ...conFecha(editada.get(p.id)),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ]
  } catch (err) {
    // Catch NO silencioso: un 403 de Tokko acá publica un sitemap sin las ~220
    // fichas y nadie se entera. Al menos que quede en los logs de Vercel.
    console.error('[sitemap] No se pudieron listar propiedades:', err instanceof Error ? err.message : err)
    propertyRoutes = [fija('/propiedades', 'hourly', 0.9)]
  }

  let blogRoutes: MetadataRoute.Sitemap = [fija('/blog', 'weekly', 0.7)]
  try {
    const posts = await getAllPosts()
    // Una fecha corrupta daría Invalid Date y el serializador del sitemap
    // revienta con RangeError → sitemap.xml 500: dia() la descarta.
    const fechaDe = (post: (typeof posts)[number]) => dia(post.updatedAt ?? post.publishAt ?? post.date)
    blogRoutes = [
      { url: `${BASE}/blog`, ...conFecha(masNueva(...posts.map(fechaDe), fechaFija('/blog'))), changeFrequency: 'weekly' as const, priority: 0.7 },
      ...posts.map(post => ({
        url: `${BASE}/blog/${post.slug}`,
        ...conFecha(fechaDe(post)),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ]
  } catch (err) {
    console.error('[sitemap] No se pudieron listar posts del blog:', err instanceof Error ? err.message : err)
  }

  let devRoutes: MetadataRoute.Sitemap = [fija('/emprendimientos', 'weekly', 0.8)]
  try {
    const devs = await getDevelopments()
    devRoutes = devRoutes.concat(devs.map(d => ({
      url: `${BASE}/emprendimientos/${generateDevSlug(d)}`,
      // Lo último que cambió en sus unidades, o el último cambio de la página.
      ...conFecha(masNueva(ultimaDe(propertyObjects.filter(p => p.development?.id === d.id)), fechaFija('/emprendimientos/[slug]'))),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })))
  } catch (err) {
    console.error('[sitemap] No se pudieron listar emprendimientos:', err instanceof Error ? err.message : err)
  }

  const barriosRoutes: MetadataRoute.Sitemap = [
    fija('/barrios-privados', 'weekly', 0.9),
    ...BARRIOS.map((b) => ({
      url: `${BASE}/barrios-privados/${b.slug}`,
      ...conFecha(fechaFija('/barrios-privados/[slug]')),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ]

  // Tasar y vender por barrio: solo las landings que dan número (lo decide
  // Hilo); /tasar/{slug} y /vender/{slug} comparten slug. Si Hilo no responde,
  // el sitemap sale igual, sin ellas esa vez. Los números se rearman todos los
  // días, pero eso no es "la página cambió": el lastmod es el del último cambio
  // de la página (si no, 370 URLs dirían "hoy" todos los días).
  const tasadorRoutes: MetadataRoute.Sitemap = await cargarTasar()
    .then(({ indice, mercado }) => {
      const indexables = Array.from(indice.landings.values()).filter(esIndexableTasar)
      return [
        fija('/vender', 'weekly', 0.9),
        fija('/tasar', 'weekly', 0.8),
        ...indexables.map((l) => ({ url: `${BASE}/tasar/${l.slug}`, ...conFecha(fechaFija('/tasar/[slug]')), changeFrequency: 'weekly' as const, priority: l.zona.esCiudad ? 0.8 : 0.7 })),
        // /vender/{slug}, además, con el mercado del barrio (si no, es noindex: ver la página).
        ...indexables.filter((l) => mercadoDe(mercado, l)).map((l) => ({ url: `${BASE}/vender/${l.slug}`, ...conFecha(fechaFija('/vender/[slug]')), changeFrequency: 'weekly' as const, priority: l.zona.esCiudad ? 0.8 : 0.7 })),
      ]
    })
    .catch((err: unknown) => {
      console.error('[sitemap] Sin las landings de tasación:', err instanceof Error ? err.message : err)
      return []
    })

  // Páginas de edificio (departamentos agrupados por dirección). Reusa el
  // inventario ya fetcheado arriba en vez de pegarle a Tokko de nuevo.
  let edificioRoutes: MetadataRoute.Sitemap = []
  try {
    edificioRoutes = detectarEdificios(propertyObjects).map((e) => ({
      url: `${BASE}/edificios/${e.slug}`,
      ...conFecha(masNueva(ultimaDe(e.unidades), fechaFija('/edificios/[slug]'))),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (err) {
    console.error('[sitemap] No se pudieron detectar edificios:', err instanceof Error ? err.message : err)
  }

  // Landings por cluster (Growth OS §23): generadas desde el catálogo cerrado.
  const clusterRoutes: MetadataRoute.Sitemap = CLUSTERS.map((c) => ({
    url: clusterUrl(c),
    // Lo último que cambió entre las propiedades que lista.
    ...conFecha(masNueva(ultimaDe(filterForCluster(propertyObjects, c)), fechaFija('/[...cluster]'))),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [...fijas, ...videoRoutes, ...clusterRoutes, ...edificioRoutes, ...tasadorRoutes, ...barriosRoutes, ...blogRoutes, ...devRoutes, ...propertyRoutes]
}
