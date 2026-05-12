// Fichas white-label para colegas en verficha.casa.
//
// Cada ficha es un snapshot inmutable de una propiedad de Tokko, asociado a
// UN colega externo y a UN slug público de 8 chars. La ficha vive 30 días en
// Redis y NO se refetchea Tokko en cada view: el snapshot es la fuente de
// verdad mientras la ficha está activa.
//
// Keys en Redis:
//   ficha:{slug}             → JSON Ficha (TTL 30d)
//   ficha:{slug}:stats       → JSON FichaStats (TTL 30d, mismo que ficha)
//   fichas:all               → SET con slugs vivos (sin TTL, cleanup lazy)

import { customAlphabet } from 'nanoid'
import { redis } from './redis'
import {
  getPropertyById,
  getAllPhotos,
  getMainPhoto,
  formatPrice,
  getOperationType,
  getDescription,
  getRoofedArea,
  getTotalSurface,
  translatePropertyType,
  translateTag,
  type TokkoProperty,
} from './tokko'

const TTL_SECONDS = 30 * 24 * 60 * 60 // 30d
const SET_KEY = 'fichas:all'
const KEY = (slug: string) => `ficha:${slug}`
const STATS_KEY = (slug: string) => `ficha:${slug}:stats`

// Alfabeto sin caracteres ambiguos (sin 0, O, l, I, 1)
const slugGen = customAlphabet('abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8)

export function generarSlug(): string {
  return slugGen()
}

export interface FichaSnapshot {
  fotos: string[]            // URLs https absolutas
  ogImage: string | null     // foto principal alta res, https absoluta
  precio: string             // formateado: "USD 285.000"
  precioRaw: number
  moneda: string             // "USD" | "ARS"
  operacion: string          // "Venta" | "Alquiler"
  tipo: string               // "Casa" | "Departamento" | ...
  tituloGenerico: string     // "Casa 4 amb en Funes"
  zonaAprox: string          // "Funes"
  m2cubiertos: number | null
  m2totales: number | null
  ambientes: number | null
  dormitorios: number | null
  banos: number | null
  cocheras: number | null
  antiguedad: number | null
  descripcion: string
  caracteristicas: string[]
  lat: number | null
  lng: number | null
}

export interface Ficha {
  slug: string
  propertyId: number
  colega: {
    id: string
    nombre: string
    whatsapp: string
    email: string | null
  }
  notas: string                // notas internas, NUNCA renderizadas en /v
  createdAt: string            // ISO
  expiresAt: string            // ISO (createdAt + 30d)
  revokedAt: string | null     // ISO si fue revocada manualmente
  generadoDesde: {
    ip: string
    userAgent: string
    createdAt: string
  }
  snapshot: FichaSnapshot
}

export interface FichaStats {
  views: number
  lastViewAt: string | null
  ips: string[]                // últimas 50, más recientes primero
}

// ── Construcción del snapshot desde Tokko ──────────────────────────────────

function pickOgImage(photos: ReturnType<typeof getAllPhotos>): string | null {
  // getAllPhotos devuelve sólo .image (no original). Para OG queremos la
  // versión más grande disponible, así que iteramos preferentemente .original.
  // Como los URLs ya son https absolutas en Tokko, basta con validar prefijo.
  for (const url of photos) {
    if (typeof url === 'string' && url.startsWith('https://')) return url
  }
  return null
}

function deriveZonaAprox(property: TokkoProperty): string {
  const loc = property.location
  if (!loc) return ''
  const parts = (loc.short_location || '').split('|').map(s => s.trim()).filter(Boolean)
  if (parts.length) return parts[parts.length - 1]
  return loc.name || ''
}

function deriveTituloGenerico(tipo: string, ambientes: number | null, zona: string): string {
  const tipoStr = tipo || 'Propiedad'
  const ambStr = ambientes && ambientes > 0 ? `${ambientes} amb` : ''
  const zonaStr = zona ? `en ${zona}` : ''
  return [tipoStr, ambStr, zonaStr].filter(Boolean).join(' ')
}

export function buildSnapshotFromTokko(property: TokkoProperty): FichaSnapshot {
  const fotosPlanas = getAllPhotos(property)
  const fotosOriginal = (property.photos || [])
    .filter(p => !p.is_blueprint)
    .sort((a, b) => a.order - b.order)
    .map(p => p.original || p.image)
    .filter(u => typeof u === 'string' && u.startsWith('https://'))

  const ogImage = pickOgImage(fotosOriginal.length ? fotosOriginal : fotosPlanas)
    || (() => {
      const main = getMainPhoto(property)
      return main && main.startsWith('https://') ? main : null
    })()

  const op = property.operations?.[0]
  const priceObj = op?.prices?.[0]

  const tipo = translatePropertyType(property.type?.name)
  const ambientes = property.room_amount || null
  const zonaAprox = deriveZonaAprox(property)

  return {
    fotos: fotosPlanas.filter(u => u.startsWith('https://')),
    ogImage,
    precio: formatPrice(property),
    precioRaw: priceObj?.price ?? 0,
    moneda: priceObj?.currency ?? '',
    operacion: getOperationType(property),
    tipo,
    tituloGenerico: deriveTituloGenerico(tipo, ambientes, zonaAprox),
    zonaAprox,
    m2cubiertos: getRoofedArea(property),
    m2totales: getTotalSurface(property),
    ambientes,
    dormitorios: property.suite_amount || null,
    banos: property.bathroom_amount || null,
    cocheras: property.parking_lot_amount || null,
    antiguedad: typeof property.age === 'number' && property.age >= 0 ? property.age : null,
    descripcion: getDescription(property),
    caracteristicas: Array.from(new Set(
      (property.tags || []).map(t => translateTag(t.name)).filter(Boolean)
    )),
    lat: property.geo_lat ? parseFloat(property.geo_lat) || null : null,
    lng: property.geo_long ? parseFloat(property.geo_long) || null : null,
  }
}

// ── CRUD ────────────────────────────────────────────────────────────────────

export async function crearFicha(input: {
  propertyId: number
  colega: Ficha['colega']
  notas?: string
  ip: string
  userAgent: string
}): Promise<{ slug: string; url: string; expiresAt: string; ficha: Ficha }> {
  const property = await getPropertyById(input.propertyId)
  const snapshot = buildSnapshotFromTokko(property)

  // Slug único — retry hasta 5 veces ante colisión (probabilidad astronómicamente baja)
  let slug = generarSlug()
  for (let i = 0; i < 5; i++) {
    const exists = await redis.exists(KEY(slug))
    if (!exists) break
    slug = generarSlug()
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + TTL_SECONDS * 1000)

  const ficha: Ficha = {
    slug,
    propertyId: input.propertyId,
    colega: {
      id: input.colega.id,
      nombre: input.colega.nombre,
      whatsapp: input.colega.whatsapp,
      email: input.colega.email ?? null,
    },
    notas: (input.notas || '').trim(),
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    revokedAt: null,
    generadoDesde: {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
      createdAt: now.toISOString(),
    },
    snapshot,
  }

  const initialStats: FichaStats = { views: 0, lastViewAt: null, ips: [] }

  await redis.set(KEY(slug), JSON.stringify(ficha), { ex: TTL_SECONDS })
  await redis.set(STATS_KEY(slug), JSON.stringify(initialStats), { ex: TTL_SECONDS })
  await redis.sadd(SET_KEY, slug)

  const domain = process.env.NEXT_PUBLIC_NEUTRAL_DOMAIN || 'verficha.casa'
  return {
    slug,
    url: `https://${domain}/${slug}`,
    expiresAt: ficha.expiresAt,
    ficha,
  }
}

export async function getFicha(slug: string): Promise<Ficha | null> {
  const raw = await redis.get<string>(KEY(slug))
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : (raw as Ficha)
}

export async function getFichaStats(slug: string): Promise<FichaStats> {
  const raw = await redis.get<string>(STATS_KEY(slug))
  if (!raw) return { views: 0, lastViewAt: null, ips: [] }
  return typeof raw === 'string' ? JSON.parse(raw) : (raw as FichaStats)
}

export async function listFichas(): Promise<Array<Ficha & { stats: FichaStats }>> {
  const slugs = (await redis.smembers(SET_KEY)) as string[]
  if (!slugs.length) return []

  const results: Array<Ficha & { stats: FichaStats }> = []
  const stale: string[] = []

  for (const slug of slugs) {
    const ficha = await getFicha(slug)
    if (!ficha) {
      stale.push(slug)
      continue
    }
    const stats = await getFichaStats(slug)
    results.push({ ...ficha, stats })
  }

  // Lazy cleanup: el TTL de la key expira por su cuenta pero el SET no
  if (stale.length) await redis.srem(SET_KEY, ...stale)

  results.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  return results
}

// Soft-delete: la ficha queda en Redis pero con revokedAt seteado, y el GET
// público devuelve 410 (not-found neutro). Preserva TTL para que se autolimpie.
export async function revocarFicha(slug: string): Promise<boolean> {
  const ficha = await getFicha(slug)
  if (!ficha) return false
  if (ficha.revokedAt) return true // idempotente

  ficha.revokedAt = new Date().toISOString()
  const ttl = await redis.ttl(KEY(slug))
  const ex = ttl > 0 ? ttl : TTL_SECONDS
  await redis.set(KEY(slug), JSON.stringify(ficha), { ex })
  return true
}

// Tracking de view: incrementa contador, anota IP (cap 50). Preserva TTL.
export async function trackView(slug: string, ip: string): Promise<void> {
  const ttl = await redis.ttl(STATS_KEY(slug))
  if (ttl <= 0) return // ficha expirada, no tracking

  const current = await getFichaStats(slug)
  const cleanIp = (ip || 'unknown').slice(0, 64)
  const ips = [cleanIp, ...current.ips.filter(i => i !== cleanIp)].slice(0, 50)

  const next: FichaStats = {
    views: (current.views || 0) + 1,
    lastViewAt: new Date().toISOString(),
    ips,
  }
  await redis.set(STATS_KEY(slug), JSON.stringify(next), { ex: ttl })
}
