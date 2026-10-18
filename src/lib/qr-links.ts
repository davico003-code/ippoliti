// QR dinámicos (David, 17-oct-2026): cada QR impreso apunta a
// siinmobiliaria.com/qr/<slug>. El destino real vive en Redis (editable desde
// /admin/qr sin redeploy) y, si Redis no responde, cae a este mapa por defecto.
// Cada escaneo suma un contador total y uno por día.

import { redis } from '@/lib/redis'

export interface QrLink {
  slug: string
  nombre: string
  destino: string
}

// Mapa por defecto. Agregar acá un QR nuevo lo deja andando aunque Redis esté
// vacío; después se puede cambiar el destino desde /admin/qr.
export const QR_LINKS_DEFAULT: QrLink[] = [
  {
    // QR genérico de SI INMOBILIARIA (portaretratos, carteles, tarjetas). El
    // destino se va rotando desde /admin/qr: video de captación, tasación, etc.
    slug: 'si',
    nombre: 'QR genérico SI INMOBILIARIA',
    destino: 'https://siinmobiliaria.com',
  },
]

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,48}$/

export function esSlugValido(slug: string): boolean {
  return SLUG_RE.test(slug)
}

export function esDestinoValido(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

const KEY_LINKS = 'qr:links' // hash slug → JSON { nombre, destino }
const keyScans = (slug: string) => `qr:scans:${slug}`
const keyScansDia = (slug: string, dia: string) => `qr:scans:${slug}:${dia}`

function hoy(): string {
  // Día en Argentina (UTC-3), para que el contador diario cierre a medianoche local.
  return new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function parseLink(slug: string, raw: unknown): QrLink | null {
  const obj = typeof raw === 'string' ? safeJson(raw) : raw
  if (!obj || typeof obj !== 'object') return null
  const { nombre, destino } = obj as Partial<QrLink>
  if (!destino || !esDestinoValido(destino)) return null
  return { slug, nombre: nombre || slug, destino }
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s) } catch { return null }
}

/** Destino de un slug: Redis primero, mapa por defecto después. */
export async function resolverQr(slug: string): Promise<QrLink | null> {
  if (!esSlugValido(slug)) return null
  try {
    const raw = await redis.hget(KEY_LINKS, slug)
    const link = raw != null ? parseLink(slug, raw) : null
    if (link) return link
  } catch (err) {
    console.error('[qr] Redis hget error:', err)
  }
  return QR_LINKS_DEFAULT.find(l => l.slug === slug) ?? null
}

/** Suma un escaneo (total + día). Nunca tira: si Redis falla, igual redirigimos. */
export async function contarEscaneo(slug: string): Promise<void> {
  try {
    const dia = hoy()
    const p = redis.pipeline()
    p.incr(keyScans(slug))
    p.incr(keyScansDia(slug, dia))
    p.expire(keyScansDia(slug, dia), 60 * 60 * 24 * 400)
    await p.exec()
  } catch (err) {
    console.error('[qr] Redis incr error:', err)
  }
}

export interface QrLinkConStats extends QrLink {
  escaneos: number
  escaneosHoy: number
  enRedis: boolean
}

/** Lista todos los QR (Redis + defaults) con sus contadores. */
export async function listarQr(): Promise<QrLinkConStats[]> {
  const porSlug = new Map<string, QrLink & { enRedis: boolean }>()
  for (const l of QR_LINKS_DEFAULT) porSlug.set(l.slug, { ...l, enRedis: false })
  try {
    const all = (await redis.hgetall<Record<string, unknown>>(KEY_LINKS)) ?? {}
    for (const [slug, raw] of Object.entries(all)) {
      const link = parseLink(slug, raw)
      if (link) porSlug.set(slug, { ...link, enRedis: true })
    }
  } catch (err) {
    console.error('[qr] Redis hgetall error:', err)
  }
  const links = Array.from(porSlug.values())
  if (links.length === 0) return []
  const dia = hoy()
  let counts: (number | null)[] = []
  try {
    const keys = links.flatMap(l => [keyScans(l.slug), keyScansDia(l.slug, dia)])
    counts = (await redis.mget<(number | null)[]>(...keys)) ?? []
  } catch (err) {
    console.error('[qr] Redis mget error:', err)
  }
  return links.map((l, i) => ({
    ...l,
    escaneos: Number(counts[i * 2] ?? 0),
    escaneosHoy: Number(counts[i * 2 + 1] ?? 0),
  }))
}

/** Crea o actualiza un QR (destino y nombre) en Redis. */
export async function guardarQr(link: QrLink): Promise<void> {
  if (!esSlugValido(link.slug)) throw new Error('Slug inválido: solo minúsculas, números y guiones.')
  if (!esDestinoValido(link.destino)) throw new Error('El destino tiene que ser un link completo (https://...).')
  await redis.hset(KEY_LINKS, {
    [link.slug]: JSON.stringify({ nombre: link.nombre.trim().slice(0, 80) || link.slug, destino: link.destino.trim() }),
  })
}
