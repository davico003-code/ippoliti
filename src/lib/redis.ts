import { Redis } from '@upstash/redis'
import { nanoid } from 'nanoid'

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

/* ── Selecciones ── */

// Snapshot inmutable para propiedades externas (Zonaprop, colega, etc.) cargadas
// a mano. Viaja embebido dentro de seleccion:{token}; el ClientShortlist lo
// renderiza directo sin fetchear Tokko ni Microlink.
export interface PropiedadExternaSnapshot {
  title: string
  image: string | null
  location: string
  price: string | null
  rooms: number
  baths: number
  area: number
  // Coords para el pin del mapa. Se completan geocodificando `location` al
  // renderizar la selección (cacheado). Opcionales: si no resuelven, sin pin.
  lat?: number | null
  lng?: number | null
}

interface SeleccionProperty {
  id: string
  url: string
  note: string
  source?: 'externa'
  snapshot?: PropiedadExternaSnapshot
}

interface SeleccionInput {
  clientName: string
  clientPhone: string
  clientEmail?: string
  contactId?: string
  contactSource?: string
  agent: string
  agentId: string
  agentName: string
  days: number
  note: string
  properties: SeleccionProperty[]
}

function normalizeContactId(value: string | undefined | null): string {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._:+-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120)
}

function contactIdFromInput(data: SeleccionInput): string {
  const explicit = normalizeContactId(data.contactId)
  if (explicit) return explicit
  const phoneDigits = data.clientPhone.replace(/\D/g, '')
  if (phoneDigits.length >= 8) return `phone:${phoneDigits}`
  return ''
}

export async function crearSeleccion(data: SeleccionInput): Promise<string> {
  const contactId = contactIdFromInput(data)
  const activeKey = contactId ? `contacto:${contactId}:seleccion_activa` : ''
  const existingToken = activeKey ? await redis.get<string>(activeKey) : null
  const existingSelection = existingToken ? await getSeleccion(existingToken) : null
  const token = existingSelection?.token || existingToken || nanoid(10)
  const now = new Date().toISOString()
  const createdAt = existingSelection?.createdAt || now
  const expiresAt = '2099-12-31T23:59:59.999Z'

  const payload = {
    ...data,
    contactId: contactId || data.contactId || '',
    token,
    permanent: true,
    createdAt,
    updatedAt: now,
    expiresAt,
  }

  await redis.set(`seleccion:${token}`, JSON.stringify(payload))

  const currentReactions = await redis.get(`reacciones:${token}`)
  if (!currentReactions) {
    await redis.set(`reacciones:${token}`, JSON.stringify({ _meta: { viewCount: 0, lastActivity: now } }))
  }

  if (activeKey) {
    await redis.set(activeKey, token)
    const historyKey = `contacto:${contactId}:selecciones`
    const history = await redis.lrange<string>(historyKey, 0, 100)
    if (!history.includes(token)) await redis.lpush(historyKey, token)
  }

  return token
}

export async function getSeleccion(token: string) {
  const raw = await redis.get<string>(`seleccion:${token}`)
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : raw
}

export async function getReacciones(token: string) {
  const raw = await redis.get<string>(`reacciones:${token}`)
  if (!raw) return {}
  return typeof raw === 'string' ? JSON.parse(raw) : raw
}

export async function patchReaccion(
  token: string,
  propertyId: string,
  patch: { liked?: boolean | null; wantVisit?: boolean; comment?: string; reaction?: string | null }
) {
  const current = await getReacciones(token)
  const existing = current[propertyId] || {}
  current[propertyId] = { ...existing, ...patch, updatedAt: new Date().toISOString() }
  current._meta = { ...(current._meta || {}), lastActivity: new Date().toISOString() }

  // Get TTL to preserve it
  const ttl = await redis.ttl(`reacciones:${token}`)
  if (ttl > 0) {
    await redis.set(`reacciones:${token}`, JSON.stringify(current), { ex: ttl })
  } else {
    await redis.set(`reacciones:${token}`, JSON.stringify(current))
  }
}

export async function incrementViewCount(token: string) {
  const current = await getReacciones(token)
  const meta = current._meta || { viewCount: 0 }
  meta.viewCount = (meta.viewCount || 0) + 1
  current._meta = meta

  const ttl = await redis.ttl(`reacciones:${token}`)
  if (ttl > 0) {
    await redis.set(`reacciones:${token}`, JSON.stringify(current), { ex: ttl })
  } else {
    await redis.set(`reacciones:${token}`, JSON.stringify(current))
  }
}

export async function listarSelecciones(agent?: string) {
  const keys: string[] = []
  let cursor = 0
  do {
    const result = await redis.scan(cursor, { match: 'seleccion:*', count: 100 })
    cursor = Number(result[0])
    const batch = result[1]
    if (Array.isArray(batch)) keys.push(...(batch.map(String)))
  } while (cursor !== 0)

  const results = []
  for (const key of keys) {
    const raw = await redis.get<string>(key)
    if (!raw) continue
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (agent && agent !== 'all' && data.agentId !== agent && data.agent !== agent) continue

    const tk = key.replace('seleccion:', '')
    const reactions = await getReacciones(tk)

    let liked = 0, disliked = 0, wantVisit = 0, hasComments = false
    for (const [k, v] of Object.entries(reactions)) {
      if (k === '_meta') continue
      const r = v as { liked?: boolean | null; wantVisit?: boolean; comment?: string }
      if (r.liked === true) liked++
      if (r.liked === false) disliked++
      if (r.wantVisit) wantVisit++
      if (r.comment) hasComments = true
    }

    results.push({ ...data, token: tk, resumen: { liked, disliked, wantVisit, hasComments } })
  }

  results.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  return results
}

export async function listarSeleccionesPorAgente(agentId: string) {
  return listarSelecciones(agentId)
}

export async function listarTodasSelecciones() {
  return listarSelecciones('all')
}
