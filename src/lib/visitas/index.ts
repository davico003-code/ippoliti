// Visitas — leads de "Solicitá una visita" desde la ficha de propiedad.
//
// Flujo:
//   1. Cliente toca CTA "Solicitá una visita" en la ficha (mobile sticky bar,
//      desktop sidebar, o ficha de emprendimientos)
//   2. Completa día + horario + nombre + teléfono + email (opcional)
//   3. POST /api/agendar-visita → crearVisita() persiste en Redis
//   4. En paralelo: WhatsApp al admin + WhatsApp del cliente abierto en su tel
//   5. David ve el listado en /recursos/visitas, cambia status, agrega notas
//
// Keys en Redis:
//   visita:{id}                      → JSON VisitaLead (TTL 180d)
//   visita:list:pendiente            → sorted set (score = created_at ms)
//   visita:list:confirmada           → sorted set
//   visita:list:realizada            → sorted set
//   visita:list:cancelada            → sorted set
//   visita:by-property:{prop_id}     → sorted set (filtro por propiedad)
//
// El listado por estado o por propiedad se hace con cleanup-lazy: si un
// `visita:{id}` ya no existe (TTL expirado), se remueve del sorted set.

import { nanoid as nanoidCustom } from 'nanoid'
import { redis } from '../redis'

const TTL_SECONDS = 180 * 24 * 60 * 60 // 180d
const KEY = (id: string) => `visita:${id}`
const LIST_PREFIX = 'visita:list:'
const BY_PROP = (propId: number) => `visita:by-property:${propId}`

// nanoid 12 chars para evitar colisiones (180d × visitas/día × N propiedades)
const idGen = nanoidCustom

export function generarId(): string {
  return idGen(12)
}

// ── Tipos ──────────────────────────────────────────────────────────────────

export type VisitaStatus = 'pendiente' | 'confirmada' | 'realizada' | 'cancelada'
export type VisitaTipo = 'venta' | 'alquiler' | 'temporario'
export type VisitaSource = 'mobile-sticky' | 'desktop-sidebar' | 'emprendimiento' | 'otro'

export interface VisitaLead {
  id: string
  /** ID de Tokko de la propiedad / emprendimiento */
  propiedad_id: number
  propiedad_titulo: string
  /** URL pública de la ficha (siinmobiliaria.com/propiedades/{slug}) */
  propiedad_url?: string

  // Datos del cliente
  nombre: string
  telefono: string
  email?: string

  // Cuándo quiere venir
  fecha_preferida: string  // 'YYYY-MM-DD' (sin TZ)
  horario: string          // 'HH:MM hs' o 'H:00 hs'

  // Tracking
  tipo: VisitaTipo
  source: VisitaSource
  ip?: string
  user_agent?: string

  // Estado (mutable desde panel admin)
  status: VisitaStatus
  notas_internas?: string

  // Timestamps
  created_at: string                 // ISO
  updated_at?: string                // ISO (cuando cambia status o notas)
}

export interface CrearVisitaInput {
  propiedad_id: number
  propiedad_titulo: string
  propiedad_url?: string
  nombre: string
  telefono: string
  email?: string
  fecha_preferida: string
  horario: string
  tipo: VisitaTipo
  source: VisitaSource
  ip?: string
  user_agent?: string
}

// ── CRUD ───────────────────────────────────────────────────────────────────

export async function crearVisita(input: CrearVisitaInput): Promise<VisitaLead> {
  const id = generarId()
  const now = new Date()
  const visita: VisitaLead = {
    id,
    propiedad_id: input.propiedad_id,
    propiedad_titulo: input.propiedad_titulo.trim(),
    propiedad_url: input.propiedad_url,
    nombre: input.nombre.trim(),
    telefono: input.telefono.trim(),
    email: input.email?.trim() || undefined,
    fecha_preferida: input.fecha_preferida,
    horario: input.horario,
    tipo: input.tipo,
    source: input.source,
    ip: input.ip,
    user_agent: input.user_agent,
    status: 'pendiente',
    created_at: now.toISOString(),
  }
  await redis.set(KEY(id), JSON.stringify(visita), { ex: TTL_SECONDS })
  await redis.zadd(`${LIST_PREFIX}pendiente`, { score: now.getTime(), member: id })
  await redis.zadd(BY_PROP(visita.propiedad_id), { score: now.getTime(), member: id })
  return visita
}

export async function getVisita(id: string): Promise<VisitaLead | null> {
  const raw = await redis.get(KEY(id))
  if (!raw) return null
  return typeof raw === 'string' ? (JSON.parse(raw) as VisitaLead) : (raw as VisitaLead)
}

// ── Update (status + notas) ────────────────────────────────────────────────

export interface UpdateVisitaInput {
  status?: VisitaStatus
  notas_internas?: string | null  // null = borrar
}

export async function actualizarVisita(
  id: string,
  patch: UpdateVisitaInput,
): Promise<VisitaLead | null> {
  const visita = await getVisita(id)
  if (!visita) return null

  const updated: VisitaLead = {
    ...visita,
    updated_at: new Date().toISOString(),
  }
  if (patch.notas_internas !== undefined) {
    updated.notas_internas = patch.notas_internas === null ? undefined : patch.notas_internas
  }

  // Si cambia el status: mover el id entre sorted sets
  if (patch.status && patch.status !== visita.status) {
    const score = new Date(visita.created_at).getTime()
    await redis.zrem(`${LIST_PREFIX}${visita.status}`, id)
    await redis.zadd(`${LIST_PREFIX}${patch.status}`, { score, member: id })
    updated.status = patch.status
  }

  await redis.set(KEY(id), JSON.stringify(updated), { ex: TTL_SECONDS })
  return updated
}

// ── Eliminación ────────────────────────────────────────────────────────────

/** Elimina la visita de Redis (key + todos los sorted sets relacionados). */
export async function eliminarVisita(id: string): Promise<boolean> {
  const visita = await getVisita(id)
  if (!visita) return false
  await Promise.all([
    redis.del(KEY(id)),
    redis.zrem(`${LIST_PREFIX}pendiente`, id),
    redis.zrem(`${LIST_PREFIX}confirmada`, id),
    redis.zrem(`${LIST_PREFIX}realizada`, id),
    redis.zrem(`${LIST_PREFIX}cancelada`, id),
    redis.zrem(BY_PROP(visita.propiedad_id), id),
  ])
  return true
}

// ── Listado ────────────────────────────────────────────────────────────────

export type ListVisitasStatus = VisitaStatus | 'all'

export interface ListVisitasResult {
  items: VisitaLead[]
  hasMore: boolean
}

export async function listVisitas(opts: {
  status?: ListVisitasStatus
  propiedadId?: number
  limit?: number
  offset?: number
}): Promise<ListVisitasResult> {
  const { status = 'all', propiedadId, limit = 30, offset = 0 } = opts

  const fromKey = async (setKey: string): Promise<string[]> => {
    const res = await redis.zrange(setKey, 0, -1, { rev: true })
    return (res as unknown as string[]) || []
  }

  // Resolver el universo de ids según filtros
  let ids: string[]
  if (propiedadId !== undefined) {
    // Filtro por propiedad: prioridad sobre status (después aplicamos status en memoria)
    ids = await fromKey(BY_PROP(propiedadId))
  } else if (status === 'all') {
    const [pen, con, rea, can] = await Promise.all([
      fromKey(`${LIST_PREFIX}pendiente`),
      fromKey(`${LIST_PREFIX}confirmada`),
      fromKey(`${LIST_PREFIX}realizada`),
      fromKey(`${LIST_PREFIX}cancelada`),
    ])
    const seen = new Set<string>()
    ids = [...pen, ...con, ...rea, ...can].filter(s => {
      if (seen.has(s)) return false
      seen.add(s)
      return true
    })
  } else {
    ids = await fromKey(`${LIST_PREFIX}${status}`)
  }

  // Fetch página (con margen para filtrar después por status si aplica)
  const fetchSize = propiedadId !== undefined && status !== 'all'
    ? ids.length  // si filtramos por propiedad+status, traemos todos y filtramos
    : Math.min(ids.length, offset + limit + 1)
  const page = ids.slice(0, fetchSize)
  const fetched = await Promise.all(page.map(id => getVisita(id)))

  // Cleanup-lazy de ids stale
  const stale: string[] = []
  const liveItems: VisitaLead[] = []
  fetched.forEach((v, i) => {
    if (v) liveItems.push(v)
    else stale.push(page[i])
  })
  if (stale.length > 0) {
    await Promise.all([
      redis.zrem(`${LIST_PREFIX}pendiente`, ...stale),
      redis.zrem(`${LIST_PREFIX}confirmada`, ...stale),
      redis.zrem(`${LIST_PREFIX}realizada`, ...stale),
      redis.zrem(`${LIST_PREFIX}cancelada`, ...stale),
    ])
  }

  // Filtro extra por status (en caso de filtro por propiedad)
  let filtered = liveItems
  if (propiedadId !== undefined && status !== 'all') {
    filtered = liveItems.filter(v => v.status === status)
  }

  // Orden global por created_at (más nuevas primero)
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const sliced = filtered.slice(offset, offset + limit)
  return {
    items: sliced,
    hasMore: filtered.length > offset + limit,
  }
}
