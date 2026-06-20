// Agregación server-side del feedback por propiedad (privado / admin).
//
// Reúne lo capturado en Redis para una propiedad y lo enriquece con datos de
// Tokko (foto + dirección + precio) para el panel de /agentes. NUNCA se expone
// públicamente: los `alerts` contienen PII (contacto de leads).

import { redis } from '@/lib/redis'
import {
  fbKey,
  FB_INDEX_KEY,
  REACT_CHOICES,
  OBJECTION_CHOICES,
  type ReactChoice,
  type ObjectionChoice,
} from '@/lib/feedback'
import {
  getPropertyById,
  getMainPhoto,
  formatPrice,
  sanitizeProperty,
} from '@/lib/tokko'

export interface AlertEntry {
  contacto: string
  canal: 'whatsapp' | 'email'
  valuacion: number | null
  ts: number
}

export interface PropertyFeedbackAggregate {
  propertyId: string
  likes: number
  react: Record<ReactChoice, number>
  valuation: { count: number; avg: number | null; min: number | null; max: number | null }
  objection: Record<ObjectionChoice, number>
  alerts: AlertEntry[]
  /** total de interacciones (para ordenar). */
  total: number
}

export interface PanelRow extends PropertyFeedbackAggregate {
  address: string
  photo: string | null
  priceLabel: string
  publishedPrice: number
  /** desvío promedio de la valuación percibida vs el publicado, en %. */
  avgPct: number | null
}

function toNum(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/** IDs de todas las propiedades que recibieron feedback (vía índice). */
export async function listFeedbackPropertyIds(): Promise<string[]> {
  try {
    const ids = await redis.smembers(FB_INDEX_KEY)
    return Array.isArray(ids) ? ids.map(String) : []
  } catch {
    return []
  }
}

/** Agregado de feedback (solo Redis) para una propiedad. */
export async function getPropertyFeedback(propertyId: string): Promise<PropertyFeedbackAggregate> {
  const base = fbKey(propertyId)

  const [likeCount, reactRaw, valuationVals, objectionRaw, alertsRaw] = await Promise.all([
    redis.scard(`${base}:like`),
    Promise.all(REACT_CHOICES.map((c) => redis.get<number>(`${base}:react:${c}`))),
    redis.hvals(`${base}:valuation`),
    Promise.all(OBJECTION_CHOICES.map((c) => redis.get<number>(`${base}:objection:${c}`))),
    redis.lrange(`${base}:alert`, 0, -1),
  ])

  const react = {} as Record<ReactChoice, number>
  REACT_CHOICES.forEach((c, i) => (react[c] = toNum(reactRaw[i])))

  const objection = {} as Record<ObjectionChoice, number>
  OBJECTION_CHOICES.forEach((c, i) => (objection[c] = toNum(objectionRaw[i])))

  const values = ((valuationVals ?? []) as unknown[]).map(toNum).filter((n) => n > 0)
  const valuation = {
    count: values.length,
    avg: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null,
    min: values.length ? Math.min(...values) : null,
    max: values.length ? Math.max(...values) : null,
  }

  const alerts: AlertEntry[] = ((alertsRaw ?? []) as unknown[])
    .map((raw) => {
      try {
        const o = typeof raw === 'string' ? JSON.parse(raw) : raw
        return o && typeof o === 'object' ? (o as AlertEntry) : null
      } catch {
        return null
      }
    })
    .filter((x): x is AlertEntry => x !== null)

  const likes = toNum(likeCount)
  const reactTotal = REACT_CHOICES.reduce((s, c) => s + react[c], 0)
  const total = likes + reactTotal + valuation.count + alerts.length

  return { propertyId, likes, react, valuation, objection, alerts, total }
}

/** Fila del panel para una propiedad: agregado + Tokko (foto/dirección/precio)
 *  + % promedio. Devuelve null si la propiedad no tiene feedback real. */
export async function buildPanelRow(id: string): Promise<PanelRow | null> {
  const agg = await getPropertyFeedback(id)
  if (agg.total === 0) return null

  let address = `Propiedad ${id}`
  let photo: string | null = null
  let priceLabel = ''
  let publishedPrice = 0
  try {
    const prop = sanitizeProperty(await getPropertyById(Number(id)))
    address = prop.fake_address || prop.address || address
    photo = getMainPhoto(prop)
    priceLabel = formatPrice(prop)
    const p = prop.operations?.[0]?.prices?.[0]?.price
    publishedPrice = typeof p === 'number' && prop.web_price !== false ? p : 0
  } catch {
    /* si Tokko falla mostramos el id igual */
  }

  const avgPct =
    publishedPrice > 0 && agg.valuation.avg != null
      ? Math.round(((agg.valuation.avg - publishedPrice) / publishedPrice) * 100)
      : null

  return { ...agg, address, photo, priceLabel, publishedPrice, avgPct }
}

/** Filas del panel: agregado + foto/dirección/precio de Tokko + % promedio. */
export async function getFeedbackPanelRows(limit = 100): Promise<PanelRow[]> {
  const ids = await listFeedbackPropertyIds()
  if (ids.length === 0) return []

  const rows = await Promise.all(ids.map((id) => buildPanelRow(id)))

  return rows
    .filter((r): r is PanelRow => r !== null)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}
