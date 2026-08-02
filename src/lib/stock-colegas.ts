// Stock de Colegas — el MLS privado de SI INMOBILIARIA.
//
// El MOTOR (Cowork, ~/Downloads/INFO PROPIEDADES FUNES) rastrea Zonaprop +
// Argenprop a diario, deduplica (26% de los avisos son duplicados) y emite
// `stock.json` (TODO el inventario de los 9 barrios) y `oportunidades.json`
// (solo las frutillas). Este módulo es el lado Hilo de esa costura: guarda los
// feeds en Redis y los sirve al panel interno /agentes/stock.
//
// REGLA DE ORO: acá NUNCA se busca en vivo ni se le pega a los portales. El
// panel lee lo que el motor ya verificó. Contratos: STOCK_COLEGAS.md y
// HANDOFF_STOCK_HILO.md (en la carpeta del motor).
//
// Storage (Upstash, mismo cliente que el resto del sitio):
//   stockcolegas:feed  → StockFeed completo (~600 KB, se reemplaza en cada sync)
//   stockcolegas:meta  → resumen del último sync (para el panel y debugging)
//   oportunidades:feed → OppFeed completo (frutillas curadas, trae fotos)
//   (nota: `oportunidades:items` es OTRA cosa — el popup público curado a mano)

import { redis } from '@/lib/redis'

/* ── Tipos (espejo del contrato stock.json) ── */

export interface StockAviso {
  portal: string
  id: string
  url: string
  precio_usd: number
  ultima_vista: string
}

export interface StockPropiedad {
  stock_id: string
  tipo: 'Terreno' | 'Casa'
  barrio: string
  slug: string
  precio_usd: number
  precio_max_usd: number | null
  sup_total_m2: number | null
  sup_cub_m2: number | null
  dorm: number | null
  usd_m2: number | null
  benchmark_usd_m2: number | null
  pct_vs_benchmark: number | null
  percentil_precio: number | null
  percentil_usd_m2: number | null
  estado: 'activa' | 'a_confirmar' | 'cerrada'
  frescura: string
  ultima_vista: string
  fecha_deteccion: string
  dias_en_mercado: number
  dias_es_minimo: boolean
  senal: string | null
  historial_precios: { fecha: string; precio_usd: number }[]
  republicado_de: string | null
  veces_republicada: number
  dup_confianza: 'unico' | 'media' | 'alta'
  es_oportunidad: boolean
  titulo: string
  direccion: string
  flags: string[]
  gemelos?: string[]
  avisos: StockAviso[]
}

export interface StockFeed {
  generado: string
  censo_completo_al: string | null
  total_propiedades: number
  activas: number
  a_confirmar: number
  cerradas: number
  total_avisos: number
  dedup: Record<string, number>
  propiedades: StockPropiedad[]
}

/* Feed de oportunidades (frutillas) — contrato oportunidades.json */
export interface OppItem {
  id: string
  portal: string
  tipo: string
  barrio: string
  slug: string
  precio_usd: number
  sup_total_m2: number | null
  sup_cub_m2: number | null
  dorm: number | null
  usd_m2: number
  benchmark_usd_m2: number
  pct_bajo: number
  senal: string | null
  estado: string
  titulo: string
  fotos: string[]
  url: string
  fecha_deteccion: string
  fecha_verificacion: string
  score: number
}

export interface OppFeed {
  generado: string
  total: number
  oportunidades: OppItem[]
}

export interface SyncMeta {
  ultimo_sync: string
  generado: string
  insertadas: number
  actualizadas: number
  cerradas: number
  total_propiedades: number
  origen: string
}

const KEY_STOCK = 'stockcolegas:feed'
const KEY_META = 'stockcolegas:meta'
const KEY_OPP = 'oportunidades:feed'

/* ── Lectura (panel) ── */

export async function getStockFeed(): Promise<StockFeed | null> {
  try {
    const raw = await redis.get<StockFeed | string>(KEY_STOCK)
    if (!raw) return null
    return typeof raw === 'string' ? (JSON.parse(raw) as StockFeed) : raw
  } catch {
    return null
  }
}

export async function getStockMeta(): Promise<SyncMeta | null> {
  try {
    const raw = await redis.get<SyncMeta | string>(KEY_META)
    if (!raw) return null
    return typeof raw === 'string' ? (JSON.parse(raw) as SyncMeta) : raw
  } catch {
    return null
  }
}

export async function getOppFeed(): Promise<OppFeed | null> {
  try {
    const raw = await redis.get<OppFeed | string>(KEY_OPP)
    if (!raw) return null
    return typeof raw === 'string' ? (JSON.parse(raw) as OppFeed) : raw
  } catch {
    return null
  }
}

/* ── Validación mínima (el feed viene verificado del motor; acá solo sanity) ── */

export function validarStockFeed(body: unknown): body is StockFeed {
  const f = body as StockFeed
  return (
    !!f &&
    typeof f.generado === 'string' &&
    Array.isArray(f.propiedades) &&
    f.propiedades.length > 0 &&
    f.propiedades.every((p) => typeof p.stock_id === 'string' && typeof p.precio_usd === 'number')
  )
}

export function validarOppFeed(body: unknown): body is OppFeed {
  const f = body as OppFeed
  return !!f && typeof f.generado === 'string' && Array.isArray(f.oportunidades)
}

/* ── Ingest ──
 * El motor manda el feed COMPLETO cada día; acá se reemplaza el key entero y
 * se calcula el diff contra lo anterior solo para responder los conteos del
 * contrato ({insertadas, actualizadas, cerradas}). Idempotente: mandar dos
 * veces el mismo feed da {0 insertadas} la segunda vez y no rompe nada. */

export async function ingestStockFeed(feed: StockFeed, origen: string): Promise<SyncMeta> {
  const prev = await getStockFeed()
  const prevIds = new Map<string, StockPropiedad>()
  if (prev) for (const p of prev.propiedades) prevIds.set(p.stock_id, p)

  let insertadas = 0
  let actualizadas = 0
  let cerradas = 0
  for (const p of feed.propiedades) {
    const antes = prevIds.get(p.stock_id)
    if (!antes) insertadas++
    else {
      if (
        antes.precio_usd !== p.precio_usd ||
        antes.estado !== p.estado ||
        antes.ultima_vista !== p.ultima_vista
      )
        actualizadas++
      if (antes.estado !== 'cerrada' && p.estado === 'cerrada') cerradas++
    }
  }

  const meta: SyncMeta = {
    ultimo_sync: new Date().toISOString(),
    generado: feed.generado,
    insertadas,
    actualizadas,
    cerradas,
    total_propiedades: feed.total_propiedades ?? feed.propiedades.length,
    origen,
  }
  // Reemplazo atómico del feed + meta. Sin TTL: vive hasta el próximo sync.
  await redis.set(KEY_STOCK, JSON.stringify(feed))
  await redis.set(KEY_META, JSON.stringify(meta))
  return meta
}

export async function ingestOppFeed(feed: OppFeed): Promise<{ insertadas: number; actualizadas: number; cerradas: number; precios_registrados: number }> {
  const prev = await getOppFeed()
  const prevIds = new Map<string, OppItem>()
  if (prev) for (const o of prev.oportunidades) prevIds.set(`${o.portal}:${o.id}`, o)

  let insertadas = 0
  let actualizadas = 0
  let precios = 0
  const newIds = new Set<string>()
  for (const o of feed.oportunidades) {
    const k = `${o.portal}:${o.id}`
    newIds.add(k)
    const antes = prevIds.get(k)
    if (!antes) insertadas++
    else {
      actualizadas++
      if (antes.precio_usd !== o.precio_usd) precios++
    }
  }
  // cerradas = estaban antes y no vinieron (posible venta) — solo se informa;
  // el histórico completo vive en el motor.
  let cerradas = 0
  prevIds.forEach((_v, k) => {
    if (!newIds.has(k)) cerradas++
  })

  await redis.set(KEY_OPP, JSON.stringify(feed))
  return { insertadas, actualizadas, cerradas, precios_registrados: precios }
}
