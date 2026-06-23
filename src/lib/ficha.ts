// Fichas white-label anónimas en verficha.casa.
//
// Cada ficha es un snapshot inmutable de una propiedad de Tokko, accesible vía
// un slug público de 8 chars. La ficha vive 60 días en Redis y NO se refetchea
// Tokko en cada view: el snapshot es la fuente de verdad mientras la ficha
// está activa.
//
// Keys en Redis:
//   ficha:{slug}             → JSON Ficha (TTL 60d)
//   ficha:{slug}:stats       → JSON FichaStats (TTL 60d, mismo que ficha)
//   fichas:all               → SET con slugs vivos (sin TTL, cleanup lazy)

import { customAlphabet } from 'nanoid'
import { redis } from './redis'
import {
  getPropertyById,
  getAllPhotos,
  getBlueprintPhotos,
  getMainPhoto,
  formatPrice,
  getOperationType,
  getDescription,
  getRoofedArea,
  getTotalSurface,
  getLotSurface,
  translatePropertyType,
  translateTag,
  translateOrientation,
  translateDisposition,
  translateCondition,
  translateSituation,
  parseStreetOnly,
  type TokkoProperty,
} from './tokko'

const TTL_SECONDS = 60 * 24 * 60 * 60 // 60d
const SET_KEY = 'fichas:all'
const KEY = (slug: string) => `ficha:${slug}`
const STATS_KEY = (slug: string) => `ficha:${slug}:stats`

// Alfabeto sin caracteres ambiguos (sin 0, O, l, I, 1)
const slugGen = customAlphabet('abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8)

export function generarSlug(): string {
  return slugGen()
}

export interface FichaSnapshot {
  fotos: string[]                    // URLs https absolutas (sin blueprints)
  blueprints: string[]               // URLs de planos (separados de fotos)
  ogImage: string | null             // foto principal alta res, https absoluta
  precio: string                     // formateado: "USD 285.000"
  precioRaw: number
  moneda: string                     // "USD" | "ARS"
  operacion: string                  // "Venta" | "Alquiler" | "Alquiler temporario"
  tipo: string                       // "Casa" | "Departamento" | ...
  tituloGenerico: string             // "Casa 4 amb en Funes"
  zonaAprox: string                  // "Funes" — último segmento de short_location
  zonaCompleta: string               // "Charquito, Roldán" — barrio, ciudad
  direccionCalle: string             // "Bv Sarmiento" — sin número
  m2cubiertos: number | null
  m2totales: number | null
  m2terreno: number | null
  m2semicubiertos: number | null
  m2descubiertos: number | null
  ambientes: number | null
  dormitorios: number | null
  banos: number | null
  cocheras: number | null
  antiguedad: number | null
  // Campos opcionales (pueden faltar; UI debe tolerar undefined)
  expensas?: number                  // $ARS, undefined si 0 o no aplica
  orientacion?: string               // traducido: "Norte", "Sur", ...
  disposicion?: string               // traducido: "Frente", "Contrafrente"
  estado?: string                    // traducido: "Excelente", "Muy bueno"
  situacion?: string                 // traducido: "Vacío", "Inquilino"
  piso?: string                      // depto: "3", "PB"
  pisos?: number                     // casas: cantidad de plantas
  frenteM?: number                   // metros lineales del lote
  fondoM?: number                    // metros lineales del lote
  extras?: Array<{ name: string; value: string }>  // extra_attributes filtrados
  descripcion: string
  caracteristicas: string[]
  // Coords con offset 30-50m aplicado al crear (NO son las coords reales).
  // Se renombraron a lat/lng para retrocompat del consumer.
  lat: number | null
  lng: number | null
}

export interface Ficha {
  slug: string
  propertyId: number
  notas: string                // notas internas, NUNCA renderizadas en /v
  origen?: 'tokko' | 'externa' // default tokko; 'externa' = importada a mano
  sourceUrl?: string           // URL original (Zonaprop), interna, NUNCA renderizada
  createdAt: string            // ISO
  expiresAt: string            // ISO (createdAt + 60d)
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

function deriveZonaCompleta(property: TokkoProperty): string {
  const loc = property.location
  if (!loc) return ''
  const parts = (loc.short_location || '').split('|').map(s => s.trim()).filter(Boolean)
  if (parts.length >= 2) return `${parts[parts.length - 1]}, ${parts[parts.length - 2]}`
  if (parts.length === 1) return parts[0]
  return loc.name || ''
}

function deriveTituloGenerico(tipo: string, ambientes: number | null, zona: string): string {
  const tipoStr = tipo || 'Propiedad'
  const ambStr = ambientes && ambientes > 0 ? `${ambientes} amb` : ''
  const zonaStr = zona ? `en ${zona}` : ''
  return [tipoStr, ambStr, zonaStr].filter(Boolean).join(' ')
}

// Aplica un offset aleatorio de 30..50 metros a las coords reales para que el
// pin del mapa no exponga la dirección exacta. Calculado al crear la ficha y
// fijado durante sus 60 días de vida.
function applyOffset(lat: number, lng: number): { lat: number; lng: number } {
  const angle = Math.random() * 2 * Math.PI
  const distM = 30 + Math.random() * 20
  const dLat = (distM * Math.cos(angle)) / 111000
  const dLng = (distM * Math.sin(angle)) / (111000 * Math.cos((lat * Math.PI) / 180))
  return { lat: lat + dLat, lng: lng + dLng }
}

function parseNum(v: unknown): number | null {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

function extractBlueprints(property: TokkoProperty): string[] {
  return getBlueprintPhotos(property).filter(u => u.startsWith('https://'))
}

interface ExtraAttribute { name?: string; value?: string | number; is_expenditure?: boolean; is_measure?: boolean }
function pickExtras(property: TokkoProperty): Array<{ name: string; value: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = ((property as any).extra_attributes || []) as ExtraAttribute[]
  return raw
    .map(a => {
      const name = (a?.name || '').toString().trim()
      const value = (a?.value ?? '').toString().trim()
      return { name, value }
    })
    .filter(a => a.name && a.value && a.value !== '0' && a.value !== '0.00')
}

export function buildSnapshotFromTokko(property: TokkoProperty): FichaSnapshot {
  const fotosPlanas = (property.photos || [])
    .filter(p => !p.is_blueprint)
    .sort((a, b) => a.order - b.order)
    .map(p => p.original || p.image)
    .filter(u => typeof u === 'string' && u.startsWith('https://'))

  const ogImage =
    pickOgImage(fotosPlanas) ||
    (() => {
      const main = getMainPhoto(property)
      return main && main.startsWith('https://') ? main : null
    })()

  const op = property.operations?.[0]
  const priceObj = op?.prices?.[0]

  const tipo = translatePropertyType(property.type?.name)
  const ambientes = property.room_amount || null
  const zonaAprox = deriveZonaAprox(property)

  // Coords con offset
  const realLat = property.geo_lat ? parseFloat(property.geo_lat) : NaN
  const realLng = property.geo_long ? parseFloat(property.geo_long) : NaN
  let lat: number | null = null
  let lng: number | null = null
  if (Number.isFinite(realLat) && Number.isFinite(realLng)) {
    const off = applyOffset(realLat, realLng)
    lat = off.lat
    lng = off.lng
  }

  // Direccion calle: prefiero real_address (sin marketing) sobre address
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const realAddr = (property as any).real_address || property.address || ''
  const direccionCalle = parseStreetOnly(realAddr)

  // Expensas — undefined si 0 o no aplica
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expRaw = (property as any).expenses
  const expensas = typeof expRaw === 'number' && expRaw > 0 ? expRaw : undefined

  // Floor / floors_amount
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const piso = ((property as any).floor || '').toString().trim() || undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pisosRaw = (property as any).floors_amount
  const pisos = typeof pisosRaw === 'number' && pisosRaw > 0 ? pisosRaw : undefined

  return {
    fotos: fotosPlanas,
    blueprints: extractBlueprints(property),
    ogImage,
    precio: formatPrice(property),
    precioRaw: priceObj?.price ?? 0,
    moneda: priceObj?.currency ?? '',
    operacion: getOperationType(property),
    tipo,
    tituloGenerico: deriveTituloGenerico(tipo, ambientes, zonaAprox),
    zonaAprox,
    zonaCompleta: deriveZonaCompleta(property),
    direccionCalle,
    m2cubiertos: getRoofedArea(property),
    m2totales: getTotalSurface(property),
    m2terreno: getLotSurface(property),
    m2semicubiertos: parseNum(property.semiroofed_surface) ?? null,
    m2descubiertos: parseNum(property.unroofed_surface) ?? null,
    ambientes,
    dormitorios: property.suite_amount || null,
    banos: property.bathroom_amount || null,
    cocheras: property.parking_lot_amount || null,
    antiguedad: typeof property.age === 'number' && property.age >= 0 ? property.age : null,
    expensas,
    orientacion: translateOrientation(property.orientation) || undefined,
    disposicion: translateDisposition(property.disposition) || undefined,
    estado: translateCondition(property.property_condition) || undefined,
    situacion: translateSituation(property.situation) || undefined,
    piso,
    pisos,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    frenteM: parseNum((property as any).front_measure) ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fondoM: parseNum((property as any).depth_measure) ?? undefined,
    extras: pickExtras(property),
    descripcion: getDescription(property),
    caracteristicas: Array.from(
      new Set((property.tags || []).map(t => translateTag(t.name)).filter(Boolean)),
    ),
    lat,
    lng,
  }
}

// ── CRUD ────────────────────────────────────────────────────────────────────

export async function crearFicha(input: {
  propertyId: number
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

  // El audio narrado YA NO se precachea automáticamente al crear la ficha.
  // Pasamos a opt-in: la generación se dispara desde /admin/audio para evitar
  // consumir créditos de ElevenLabs en propiedades no seleccionadas. Si no
  // hay audio cacheado, el componente AudioSummary directamente no se renderiza.

  const domain = process.env.NEXT_PUBLIC_NEUTRAL_DOMAIN || 'verficha.casa'
  return {
    slug,
    url: `https://${domain}/${slug}`,
    expiresAt: ficha.expiresAt,
    ficha,
  }
}

// ── Ficha externa (importada a mano desde Zonaprop / colega) ────────────────
//
// Genera una ficha verficha.casa PROPIA a partir de datos cargados a mano. El
// snapshot resultante es indistinguible de uno de Tokko para el renderer de
// /v/[slug]: misma forma, marca SI-neutra, sin rastro del portal de origen.
// Las fotos ya vienen re-hosteadas en Vercel Blob (el caller las sube), así la
// ficha no depende del CDN del competidor.

export interface FichaExternaInput {
  titulo: string
  descripcion: string
  fotos: string[]              // URLs https (idealmente ya en Vercel Blob)
  operacion: string           // 'Venta' | 'Alquiler'
  tipo: string                // 'Casa' | 'Departamento' | ...
  precioRaw: number
  moneda: string              // 'USD' | 'ARS'
  zona: string
  m2cubiertos: number | null
  m2terreno: number | null
  ambientes: number | null
  dormitorios: number | null
  banos: number | null
}

// Saca el nombre del portal del título/descripción para que la ficha se vea
// 100% propia ("Casa Venta 3 Dorm. en Funes - Zonaprop" → sin "- Zonaprop").
const PORTAL_TERMS = /\s*[-|·]?\s*\b(zonaprop|argenprop|mercado\s?libre|properati|inmoup|navent)\b/gi
export function stripPortal(s: string): string {
  return (s || '').replace(PORTAL_TERMS, '').replace(/\s{2,}/g, ' ').trim()
}

function formatPrecioManual(precioRaw: number, moneda: string): string {
  if (!precioRaw || precioRaw <= 0) return 'Consultar'
  return `${moneda || 'USD'} ${precioRaw.toLocaleString('es-AR')}`
}

export function buildSnapshotManual(input: FichaExternaInput): FichaSnapshot {
  const tipo = input.tipo?.trim() || 'Propiedad'
  const ambientes = input.ambientes ?? null
  const zonaAprox = (input.zona || '').trim()
  const titulo =
    stripPortal(input.titulo) || deriveTituloGenerico(tipo, ambientes, zonaAprox)
  const fotos = (input.fotos || []).filter(u => typeof u === 'string' && u.startsWith('https://'))

  return {
    fotos,
    blueprints: [],
    ogImage: fotos[0] || null,
    precio: formatPrecioManual(input.precioRaw, input.moneda),
    precioRaw: input.precioRaw > 0 ? input.precioRaw : 0,
    moneda: input.moneda || '',
    operacion: input.operacion?.trim() || 'Venta',
    tipo,
    tituloGenerico: titulo,
    zonaAprox,
    zonaCompleta: zonaAprox,
    direccionCalle: '',
    m2cubiertos: input.m2cubiertos,
    m2totales: null,
    m2terreno: input.m2terreno,
    m2semicubiertos: null,
    m2descubiertos: null,
    ambientes,
    dormitorios: input.dormitorios,
    banos: input.banos,
    cocheras: null,
    antiguedad: null,
    descripcion: stripPortal(input.descripcion),
    caracteristicas: [],
    lat: null,
    lng: null,
  }
}

export async function crearFichaExterna(input: {
  manual: FichaExternaInput
  sourceUrl: string
  ip: string
  userAgent: string
}): Promise<{ slug: string; url: string; expiresAt: string; snapshot: FichaSnapshot }> {
  const snapshot = buildSnapshotManual(input.manual)

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
    propertyId: 0,                       // sin id de Tokko: no precachea audio
    notas: '',
    origen: 'externa',
    sourceUrl: (input.sourceUrl || '').trim(),
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
  return { slug, url: `https://${domain}/${slug}`, expiresAt: ficha.expiresAt, snapshot }
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

// User-agents que NO deben sumar a las stats: crawlers de Open Graph y bots
// de preview de WhatsApp / Telegram / Facebook / Twitter / LinkedIn / etc.
// Compartido entre el route handler /api/ficha/[slug] y la página /v/[slug]
// para que el conteo sea consistente sin importar quién dispara el track.
export const BOT_UA_RE =
  /(bot|crawler|spider|slurp|facebookexternalhit|whatsapp|preview|telegram|skype|linkedin|embed|fetch)/i

export function isLikelyBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false
  return BOT_UA_RE.test(userAgent)
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
