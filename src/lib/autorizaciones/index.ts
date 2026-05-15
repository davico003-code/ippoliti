// Autorizaciones de venta digitales — schema + helpers Redis.
//
// Flujo:
//   1. Agente genera autorización desde /recursos/autorizaciones (gating con SI_TEAM_CODE)
//   2. Comparte el link /autorizacion/{slug} por WhatsApp
//   3. Cliente firma desde el celular → status 'firmada'
//   4. Cliente descarga PDF; el agente también lo tiene en su panel
//
// Keys en Redis:
//   auth:{slug}              → JSON Autorizacion (TTL 90d)
//   auth:list:pendiente      → sorted set (score = created_at ms)
//   auth:list:firmada        → sorted set (score = signed_at ms)
//
// El TTL del JSON es absoluto desde la creación. El link de firma caduca a los
// 90 días (expires_at). Los listados (sorted sets) se hacen cleanup-lazy: si un
// `auth:{slug}` ya no existe, lo removemos del set al listar.

import { customAlphabet } from 'nanoid'
import { redis } from '../redis'
import type { DocumentoSnapshot } from './documentoTexto'

const TTL_SECONDS = 90 * 24 * 60 * 60 // 90d
const KEY = (slug: string) => `auth:${slug}`
const LIST_PENDIENTE = 'auth:list:pendiente'
const LIST_FIRMADA = 'auth:list:firmada'

// Alfabeto alfanumérico minúscula (incluye dígitos y letras a-z)
const slugGen = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10)

export function generarSlug(): string {
  return slugGen()
}

// ── Tipos ──────────────────────────────────────────────────────────────────

export type TipoAutorizacion = 'exclusiva' | 'no_exclusiva'
export type TipoPropiedad =
  | 'casa'
  | 'depto'
  | 'ph'
  | 'local'
  | 'terreno'
  | 'galpon'
  | 'oficina'
  | 'otro'
export type AutorizacionStatus = 'pendiente' | 'firmada' | 'expirada'

export interface Servicios {
  luz: boolean
  agua: boolean
  gas: boolean
  pavimento: boolean
  cloacas: boolean
}

export interface ClientePrecarga {
  nombre?: string
  dni?: string
  email?: string
}

export interface Agente {
  nombre: string
  matricula: string
  rol: string
}

export interface Signer {
  nombre: string
  dni: string
  domicilio: string
  email: string
  firma_base64: string
  ip?: string
  user_agent?: string
}

export interface Autorizacion {
  slug: string
  tipo: TipoAutorizacion
  plazo_dias: number
  renovacion_automatica: boolean
  direccion: string
  tipo_propiedad: TipoPropiedad
  servicios: Servicios
  tiene_expensas: boolean
  expensas_monto_ars?: number
  /** Público — aparece en el acuerdo del cliente. */
  precio_publicacion_usd?: number
  /** INTERNO — solo visible en panel admin. NUNCA llega al documento del cliente ni al PDF. */
  precio_venta_usd?: number
  /** INTERNO — solo visible en panel admin. NUNCA llega al documento del cliente ni al PDF. */
  notas_internas?: string
  cliente_precarga: ClientePrecarga
  agente: Agente
  created_at: string
  expires_at: string
  status: AutorizacionStatus
  signed_at: string | null
  signer: Signer | null
  /** Snapshot del documento al momento de la firma (versionado). Si está
   *  presente, el PDF se genera desde acá en lugar de getClausulas(auth). */
  documento_snapshot?: DocumentoSnapshot
}

// ── Input para crear ───────────────────────────────────────────────────────

export interface CrearInput {
  tipo: TipoAutorizacion
  plazo_dias: number
  renovacion_automatica: boolean
  direccion: string
  tipo_propiedad: TipoPropiedad
  servicios: Servicios
  tiene_expensas: boolean
  expensas_monto_ars?: number
  precio_publicacion_usd?: number
  precio_venta_usd?: number
  notas_internas?: string
  cliente_precarga?: ClientePrecarga
}

const AGENTE_DEFAULT: Agente = {
  nombre: 'David Flores',
  matricula: '0621',
  rol: 'Corredor Inmobiliario',
}

// ── CRUD ───────────────────────────────────────────────────────────────────

export async function crearAutorizacion(input: CrearInput): Promise<Autorizacion> {
  const slug = generarSlug()
  const now = new Date()
  const expires = new Date(now.getTime() + TTL_SECONDS * 1000)

  const auth: Autorizacion = {
    slug,
    tipo: input.tipo,
    plazo_dias: input.plazo_dias,
    renovacion_automatica: input.renovacion_automatica,
    direccion: input.direccion.trim(),
    tipo_propiedad: input.tipo_propiedad,
    servicios: input.servicios,
    tiene_expensas: input.tiene_expensas,
    expensas_monto_ars: input.tiene_expensas ? input.expensas_monto_ars : undefined,
    precio_publicacion_usd: input.precio_publicacion_usd,
    precio_venta_usd: input.precio_venta_usd,
    notas_internas: input.notas_internas,
    cliente_precarga: input.cliente_precarga || {},
    agente: AGENTE_DEFAULT,
    created_at: now.toISOString(),
    expires_at: expires.toISOString(),
    status: 'pendiente',
    signed_at: null,
    signer: null,
  }

  await redis.set(KEY(slug), JSON.stringify(auth), { ex: TTL_SECONDS })
  await redis.zadd(LIST_PENDIENTE, { score: now.getTime(), member: slug })

  return auth
}

// Lee del Redis y aplica read-through de expiración: si la pendiente vencida,
// la marca 'expirada' en memoria (no la actualiza en Redis; el TTL absoluto la
// borrará igual a los 90d, y el listado la filtra).
export async function getAutorizacion(slug: string): Promise<Autorizacion | null> {
  const raw = await redis.get(KEY(slug))
  if (!raw) return null
  const auth = typeof raw === 'string' ? (JSON.parse(raw) as Autorizacion) : (raw as Autorizacion)
  if (auth.status === 'pendiente' && new Date(auth.expires_at).getTime() < Date.now()) {
    return { ...auth, status: 'expirada' }
  }
  return auth
}

export async function marcarFirmada(slug: string, signer: Signer): Promise<Autorizacion | null> {
  // Import dinámico para evitar ciclo (documentoTexto importa el tipo Autorizacion).
  const { buildDocumentoSnapshot } = await import('./documentoTexto')

  const auth = await getAutorizacion(slug)
  if (!auth) return null
  if (auth.status !== 'pendiente') return auth

  const now = new Date()
  const partial: Autorizacion = {
    ...auth,
    status: 'firmada',
    signed_at: now.toISOString(),
    signer,
  }
  // Snapshot del documento ya renderizado con datos del firmante. El PDF lo
  // consume; si en el futuro cambiamos la plantilla, este snapshot conserva
  // exactamente el texto que el cliente firmó.
  const updated: Autorizacion = {
    ...partial,
    documento_snapshot: buildDocumentoSnapshot(partial, signer, now),
  }
  await redis.set(KEY(slug), JSON.stringify(updated), { ex: TTL_SECONDS })
  await redis.zrem(LIST_PENDIENTE, slug)
  await redis.zadd(LIST_FIRMADA, { score: now.getTime(), member: slug })
  return updated
}

// ── Update parcial (campos internos) ───────────────────────────────────────

/** Campos del schema que se pueden modificar vía PATCH desde el panel admin.
 *  NO incluye campos del contrato firmado (preciso_publicacion, dirección, etc)
 *  porque cambiarlos invalidaría el snapshot. */
export interface UpdateInput {
  precio_venta_usd?: number | null   // null = borrar
  notas_internas?: string | null     // null = borrar
  expires_at?: string                 // ISO, para extender
}

export async function actualizarAutorizacion(
  slug: string,
  patch: UpdateInput,
): Promise<Autorizacion | null> {
  const auth = await getAutorizacion(slug)
  if (!auth) return null

  const updated: Autorizacion = { ...auth }
  if (patch.precio_venta_usd !== undefined) {
    updated.precio_venta_usd = patch.precio_venta_usd === null ? undefined : patch.precio_venta_usd
  }
  if (patch.notas_internas !== undefined) {
    updated.notas_internas = patch.notas_internas === null ? undefined : patch.notas_internas
  }
  if (patch.expires_at !== undefined) {
    updated.expires_at = patch.expires_at
  }
  await redis.set(KEY(slug), JSON.stringify(updated), { ex: TTL_SECONDS })
  return updated
}

// ── Eliminación ────────────────────────────────────────────────────────────

/** Elimina el acuerdo del Redis (key + ambos sorted sets). Idempotente.
 *  Retorna true si existía, false si no. */
export async function eliminarAutorizacion(slug: string): Promise<boolean> {
  const existed = (await redis.exists(KEY(slug))) === 1
  await Promise.all([
    redis.del(KEY(slug)),
    redis.zrem(LIST_PENDIENTE, slug),
    redis.zrem(LIST_FIRMADA, slug),
  ])
  return existed
}

// ── Listado ────────────────────────────────────────────────────────────────

type ListStatus = 'pendiente' | 'firmada' | 'all'

export interface ListResult {
  items: Autorizacion[]
  hasMore: boolean
}

export async function listAutorizaciones(opts: {
  status: ListStatus
  limit?: number
  offset?: number
}): Promise<ListResult> {
  const { status, limit = 20, offset = 0 } = opts

  const fromKeys = async (setKey: string): Promise<string[]> => {
    const res = await redis.zrange(setKey, 0, -1, { rev: true })
    return (res as unknown as string[]) || []
  }

  let slugs: string[] = []
  if (status === 'all') {
    const [firmadas, pendientes] = await Promise.all([
      fromKeys(LIST_FIRMADA),
      fromKeys(LIST_PENDIENTE),
    ])
    // Combinamos preservando orden temporal (firmadas primero porque típicamente
    // son más recientes en flujo activo); luego mezclamos por score real al fetch.
    const seen = new Set<string>()
    slugs = [...firmadas, ...pendientes].filter(s => {
      if (seen.has(s)) return false
      seen.add(s)
      return true
    })
  } else {
    slugs = await fromKeys(status === 'firmada' ? LIST_FIRMADA : LIST_PENDIENTE)
  }

  const page = slugs.slice(offset, offset + limit)
  const fetched = await Promise.all(page.map(s => getAutorizacion(s)))

  // Cleanup-lazy: si algún slug del set ya no existe en Redis (TTL expirado),
  // lo removemos del sorted set para que no se vuelva a ver.
  const items: Autorizacion[] = []
  const stale: string[] = []
  fetched.forEach((auth, i) => {
    if (auth) {
      items.push(auth)
    } else {
      stale.push(page[i])
    }
  })
  if (stale.length > 0) {
    await Promise.all([
      redis.zrem(LIST_PENDIENTE, ...stale),
      redis.zrem(LIST_FIRMADA, ...stale),
    ])
  }

  if (status === 'all') {
    // Orden cronológico global por created_at (las firmadas conservan el orden
    // de creación, no de firma — más predecible para el agente).
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  return {
    items,
    hasMore: slugs.length > offset + limit,
  }
}

// ── Notificación al agente ─────────────────────────────────────────────────

// TODO: implementar cuando se defina la dirección de email y el transport
// (Resend / nodemailer / etc). Por ahora solo logueamos para no romper el flujo
// de firma. El PDF se puede regenerar on-demand desde /api/autorizaciones/.../pdf.
export function notifyAgent(auth: Autorizacion): void {
  console.log('TODO: enviar email a David con PDF de', auth.slug)
}
