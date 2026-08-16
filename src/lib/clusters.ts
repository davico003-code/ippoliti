import type { TokkoProperty } from '@/lib/tokko'
import { TYPE_FILTER_GROUPS } from '@/lib/tokko'

/**
 * LANDING ENGINE por clusters (Growth OS §22-23, 16-ago-2026): las landings
 * destino de Google Search (G_SEARCH_BUY_FUNES → /funes/casas, etc.), con
 * granularidad de RANGO DE PRECIO que las landings históricas no tienen
 * (/funes/casas/180000-250000). Catálogo CERRADO: la ruta [...cluster] usa
 * dynamicParams=false, así que solo existen las URLs listadas acá — cero
 * riesgo de pisar rutas reales o abrir un agujero de contenido infinito.
 *
 * Filtro centralizado (la deuda que las landings viejas repiten inline):
 * ciudad por texto normalizado (mismo criterio que PropiedadesView), tipo por
 * id de Tokko (TYPE_FILTER_GROUPS, más robusto que name.includes), operación
 * sobre TODAS las operations, y rango SOLO en USD comparando el price de esa
 * moneda (jamás prices[0] — bug conocido del filtro de precio).
 */

export type Cluster = {
  /** Segmentos de la URL: ['funes','casas'] → /funes/casas */
  segments: string[]
  ciudad: 'funes' | 'roldan' | 'rosario'
  /** value de TYPE_FILTER_GROUPS ('casa', 'terreno', …) o null = todos. */
  tipo: string | null
  operacion: 'Sale' | 'Rent'
  /** Rango USD inclusivo; null = sin tope. */
  rango: { min: number | null; max: number | null } | null
  h1: string
  metaTitle: string
  metaDescription: string
  keywords: string
  intro: string
  /** Texto SEO del bloque inferior (2 párrafos). */
  seoTexto: [string, string]
  waTexto: string
}

const FUNES_CASAS_BASE = {
  ciudad: 'funes' as const,
  tipo: 'casa',
  operacion: 'Sale' as const,
}

export const CLUSTERS: Cluster[] = [
  {
    ...FUNES_CASAS_BASE,
    segments: ['funes', 'casas'],
    rango: null,
    h1: 'Casas en venta en Funes',
    metaTitle: 'Casas en venta en Funes | Precios reales y fotos | SI INMOBILIARIA',
    metaDescription:
      'Todas las casas en venta en Funes con precio, fotos y m². Barrios abiertos y countries. Asesoramiento de SI INMOBILIARIA, en Funes desde 1983.',
    keywords: 'casas en venta funes, comprar casa funes, casas funes precios',
    intro: 'Inventario real y actualizado: precio, m² y dormitorios de cada casa.',
    seoTexto: [
      'Funes tiene opciones para todos los perfiles: casas compactas en barrios abiertos desde USD 150.000, y residencias en countries como Funes Hills o Kentucky por encima de USD 400.000. Casi todas con jardín, parrilla y cochera.',
      'En SI INMOBILIARIA vivimos y trabajamos en Funes desde 1983: te decimos qué barrio conviene según tu presupuesto y tu etapa de vida, sin vueltas.',
    ],
    waTexto: 'Hola! Busco casa en venta en Funes',
  },
  {
    ...FUNES_CASAS_BASE,
    segments: ['funes', 'casas', '180000-250000'],
    rango: { min: 180_000, max: 250_000 },
    h1: 'Casas en Funes de USD 180.000 a 250.000',
    metaTitle: 'Casas en venta en Funes entre USD 180.000 y 250.000 | SI INMOBILIARIA',
    metaDescription:
      'Casas en venta en Funes entre USD 180.000 y 250.000: el rango donde más se vende. Fotos, m² y asesoramiento directo de SI INMOBILIARIA.',
    keywords: 'casas funes 200000 dolares, casa funes 180000, casas funes hasta 250000',
    intro: 'El rango donde más operaciones se cierran en Funes, con inventario real.',
    seoTexto: [
      'Entre USD 180.000 y 250.000 entrás a casas de 3 dormitorios en barrios abiertos consolidados y a las primeras opciones de barrios cerrados. Es el segmento con más demanda de Funes: lo que está bien de precio se vende rápido.',
      'Si estás en este rango, conviene definir la búsqueda y actuar con datos: en SI INMOBILIARIA vemos todas las operaciones de la zona y te decimos qué está bien de precio y qué no.',
    ],
    waTexto: 'Hola! Busco casa en Funes entre 180 y 250 mil dólares',
  },
  {
    ...FUNES_CASAS_BASE,
    segments: ['funes', 'casas', '250000-400000'],
    rango: { min: 250_000, max: 400_000 },
    h1: 'Casas en Funes de USD 250.000 a 400.000',
    metaTitle: 'Casas en venta en Funes entre USD 250.000 y 400.000 | SI INMOBILIARIA',
    metaDescription:
      'Casas amplias y en barrios cerrados de Funes entre USD 250.000 y 400.000. Fotos, m² y asesoramiento de SI INMOBILIARIA.',
    keywords: 'casas funes 300000, casas barrio cerrado funes, casas funes hills precio',
    intro: 'Casas amplias y barrios cerrados: el paso de categoría en Funes.',
    seoTexto: [
      'En este rango aparecen las casas de 4 dormitorios, piscina y los barrios cerrados con seguridad y amenities: Funes Hills, Kentucky, La Herradura y más.',
      'SI INMOBILIARIA está en Funes desde 1983: conocemos cada barrio cerrado, sus expensas reales y su reventa. Te asesoramos antes de que firmes nada.',
    ],
    waTexto: 'Hola! Busco casa en Funes entre 250 y 400 mil dólares',
  },
  {
    segments: ['funes', 'lotes'],
    ciudad: 'funes',
    tipo: 'terreno',
    operacion: 'Sale',
    rango: null,
    h1: 'Lotes y terrenos en venta en Funes',
    metaTitle: 'Lotes en venta en Funes | Barrios abiertos y cerrados | SI INMOBILIARIA',
    metaDescription:
      'Terrenos y lotes en venta en Funes: barrios abiertos y countries. Medidas, precios y asesoramiento para construir. SI INMOBILIARIA.',
    keywords: 'lotes funes, terrenos en venta funes, lote barrio cerrado funes',
    intro: 'Todos los lotes disponibles, con medidas y precio real.',
    seoTexto: [
      'Comprar el lote es la decisión más importante de construir: define el costo de la obra, los servicios y la reventa. En Funes hay lotes desde barrios abiertos con todos los servicios hasta countries con seguridad.',
      'Te acompañamos a elegir con criterio: orientación, servicios, reglamento del barrio y potencial de reventa. SI INMOBILIARIA, en Funes desde 1983.',
    ],
    waTexto: 'Hola! Busco lote en Funes',
  },
  {
    segments: ['roldan', 'casas'],
    ciudad: 'roldan',
    tipo: 'casa',
    operacion: 'Sale',
    rango: null,
    h1: 'Casas en venta en Roldán',
    metaTitle: 'Casas en venta en Roldán | Precios reales y fotos | SI INMOBILIARIA',
    metaDescription:
      'Casas en venta en Roldán con precio, fotos y m². Tierra de Sueños, Punta Chacra y más. Sucursal propia en Roldán. SI INMOBILIARIA.',
    keywords: 'casas en venta roldan, comprar casa roldan, casas tierra de sueños',
    intro: 'Inventario real de Roldán, actualizado todos los días.',
    seoTexto: [
      'Roldán es la zona de mayor crecimiento del corredor: barrios como Tierra de Sueños y Punta Chacra ofrecen casas nuevas con mejor relación precio-m² que Funes o Rosario.',
      'Tenemos sucursal propia en Roldán con un equipo que vive ahí: conocemos cada barrio, sus etapas y sus precios reales de cierre.',
    ],
    waTexto: 'Hola! Busco casa en venta en Roldán',
  },
  {
    segments: ['roldan', 'lotes'],
    ciudad: 'roldan',
    tipo: 'terreno',
    operacion: 'Sale',
    rango: null,
    h1: 'Lotes y terrenos en venta en Roldán',
    metaTitle: 'Lotes en venta en Roldán | Medidas y precios | SI INMOBILIARIA',
    metaDescription:
      'Terrenos y lotes en venta en Roldán: Tierra de Sueños, Punta Chacra y más. Medidas, precios y financiación. SI INMOBILIARIA con sucursal en Roldán.',
    keywords: 'lotes roldan, terrenos en venta roldan, lote tierra de sueños',
    intro: 'Lotes con medidas y precio real, en los barrios que más crecen.',
    seoTexto: [
      'Roldán sigue siendo la mejor puerta de entrada para construir en el corredor: lotes con servicios, escritura al día y precios que todavía permiten proyectar.',
      'Nuestro equipo de la sucursal Roldán te dice qué etapa de cada barrio conviene y cuáles lotes tienen la mejor reventa.',
    ],
    waTexto: 'Hola! Busco lote en Roldán',
  },
  {
    segments: ['roldan', 'alquileres'],
    ciudad: 'roldan',
    tipo: null,
    operacion: 'Rent',
    rango: null,
    h1: 'Alquileres en Roldán',
    metaTitle: 'Alquileres en Roldán | Casas y departamentos | SI INMOBILIARIA',
    metaDescription:
      'Casas y departamentos en alquiler en Roldán, con requisitos claros y atención directa de nuestra sucursal en Roldán. SI INMOBILIARIA.',
    keywords: 'alquileres roldan, casa en alquiler roldan, alquiler tierra de sueños',
    intro: 'Lo disponible hoy para alquilar, con requisitos claros.',
    seoTexto: [
      'El alquiler en Roldán se mueve rápido: lo que está bien de precio se reserva en días. Publicamos solo lo disponible de verdad, con los requisitos claros desde el primer contacto.',
      'La administración de alquileres la lleva nuestra sucursal de Roldán: garantías, contratos y atención durante toda la locación.',
    ],
    waTexto: 'Hola! Busco alquiler en Roldán',
  },
  {
    segments: ['rosario', 'departamentos'],
    ciudad: 'rosario',
    tipo: 'departamento',
    operacion: 'Sale',
    rango: null,
    h1: 'Departamentos en venta en Rosario',
    metaTitle: 'Departamentos en venta en Rosario | Fisherton y más | SI INMOBILIARIA',
    metaDescription:
      'Departamentos en venta en Rosario: Fisherton, Pichincha, Puerto Norte y más. Precios reales, fotos y asesoramiento de SI INMOBILIARIA.',
    keywords: 'departamentos en venta rosario, departamento fisherton, comprar departamento rosario',
    intro: 'Departamentos con precio real, del centro a Fisherton.',
    seoTexto: [
      'Del macrocentro a Fisherton y Puerto Norte: el mercado de departamentos de Rosario tiene precios de oportunidad en pesos del ladrillo que no se ven hace años.',
      'SI INMOBILIARIA opera Rosario desde 1983: tasamos con datos de cierres reales, no con expectativas de publicación.',
    ],
    waTexto: 'Hola! Busco departamento en Rosario',
  },
]

/** URL absoluta canónica de un cluster. */
export function clusterUrl(c: Cluster): string {
  return `https://siinmobiliaria.com/${c.segments.join('/')}`
}

export function clusterPath(c: Cluster): string {
  return `/${c.segments.join('/')}`
}

export function findCluster(segments: string[]): Cluster | null {
  const key = segments.join('/')
  return CLUSTERS.find((c) => c.segments.join('/') === key) ?? null
}

/** Clusters "hermanos" para chips y para el fallback sin inventario. */
export function clustersRelacionados(c: Cluster, max = 4): Cluster[] {
  return CLUSTERS.filter((x) => x !== c)
    .sort((a, b) => {
      const pa = (a.ciudad === c.ciudad ? 0 : 2) + (a.tipo === c.tipo ? 0 : 1)
      const pb = (b.ciudad === c.ciudad ? 0 : 2) + (b.tipo === c.tipo ? 0 : 1)
      return pa - pb
    })
    .slice(0, max)
}

const norm = (s: string | null | undefined) =>
  (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Filtro central del cluster sobre el inventario completo. */
export function filterForCluster(props: TokkoProperty[], c: Cluster): TokkoProperty[] {
  const tipoIds = c.tipo
    ? TYPE_FILTER_GROUPS.find((g) => g.value === c.tipo)?.ids ?? []
    : []

  return props.filter((p) => {
    // Ciudad: mismo criterio de texto normalizado que usa /propiedades.
    const loc = norm(
      `${p.location?.short_location ?? ''} ${p.location?.name ?? ''} ${p.fake_address ?? ''} ${p.address ?? ''}`,
    )
    if (!loc.includes(c.ciudad)) return false

    // Operación: sobre TODAS las operations (una propiedad puede ser dual).
    const op = p.operations?.find((o) => o.operation_type === c.operacion)
    if (!op) return false

    // Tipo por id de Tokko (robusto); fallback al nombre si no hay id.
    if (c.tipo) {
      const typeId = p.type?.id
      const matchId = typeId != null && tipoIds.includes(typeId)
      const matchName = norm(p.type?.name).includes(c.tipo === 'terreno' ? 'terreno' : c.tipo)
      if (!matchId && !matchName) return false
    }

    // Rango: SOLO USD, con el price de ESA moneda (nunca prices[0]).
    if (c.rango) {
      const usd = op.prices?.find((pr) => pr.currency === 'USD')
      if (!usd) return false
      if (c.rango.min != null && usd.price < c.rango.min) return false
      if (c.rango.max != null && usd.price > c.rango.max) return false
    }
    return true
  })
}
