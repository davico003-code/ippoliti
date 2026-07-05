// Agentes del CRM (Tokko). Fuente única compartida por:
//   - /api/tokko/agents  → la expone al front de /nosotros
//   - agente-foto.ts     → resuelve la foto del agente que arma una selección
//
// Cachea en Redis 24h. Si el cache está frío y hay TOKKO_API_KEY, le pega a
// Tokko y lo repuebla. Best-effort: ante cualquier error devuelve [].

import { redis } from './redis'

export type TokkoAgent = {
  id: number
  name: string
  email: string
  phone: string
  cellphone: string
  picture: string | null
  position: string
}

type TokkoUserResponse = {
  objects: Array<{
    id: number
    name: string
    email?: string
    phone?: string
    cellphone?: string
    picture?: string | null
    position?: string
  }>
}

export const TOKKO_AGENTS_CACHE_KEY = 'tokko:agents:14045'
const CACHE_TTL_SECONDS = 86400 // 24h

// Devuelve los agentes de Tokko. Prioriza el cache de Redis; si está vacío y hay
// API key, hace el fetch y repuebla el cache. Nunca tira.
export async function getTokkoAgents(): Promise<{ agents: TokkoAgent[]; cached: boolean }> {
  try {
    const cached = await redis.get<TokkoAgent[]>(TOKKO_AGENTS_CACHE_KEY)
    if (Array.isArray(cached) && cached.length > 0) {
      return { agents: cached, cached: true }
    }
  } catch {
    // sin cache: seguimos al fetch
  }

  const key = process.env.TOKKO_API_KEY
  if (!key) return { agents: [], cached: false }

  try {
    const res = await fetch(
      `https://www.tokkobroker.com/api/v1/user/?key=${key}&format=json&limit=100`,
      { next: { revalidate: CACHE_TTL_SECONDS, tags: ['tokko-agents'] } }
    )
    if (!res.ok) return { agents: [], cached: false }
    const data = (await res.json()) as TokkoUserResponse
    const agents: TokkoAgent[] = (data.objects ?? []).map((u) => ({
      id: u.id,
      name: u.name?.trim() ?? '',
      email: (u.email ?? '').trim(),
      phone: (u.phone ?? '').trim(),
      cellphone: (u.cellphone ?? '').trim(),
      picture: u.picture ?? null,
      position: (u.position ?? '').trim(),
    }))

    try {
      await redis.set(TOKKO_AGENTS_CACHE_KEY, JSON.stringify(agents), { ex: CACHE_TTL_SECONDS })
    } catch {
      // escritura de cache no fatal
    }

    return { agents, cached: false }
  } catch {
    return { agents: [], cached: false }
  }
}
