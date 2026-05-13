import { Redis } from '@upstash/redis'
import { getProperties, sanitizeProperty, type TokkoProperty } from '@/lib/tokko'
import { BARRIOS, getBarrioBySlug } from '@/lib/barrios'
import { propertyMatchesBarrio } from './barrio-matcher'

const CACHE_TTL_SECONDS = 60 * 60 // 1h

type TipoPropiedad = 'Terreno' | 'Casa' | 'Departamento' | 'Todos'

function getRedis(): Redis | null {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
}

function cacheKey(slug: string, tipo: TipoPropiedad): string {
  return `barrios:propiedades:${slug}:${tipo.toLowerCase()}`
}

function matchesType(p: TokkoProperty, tipo: TipoPropiedad): boolean {
  if (tipo === 'Todos') return true
  const name = (p.type?.name ?? '').toLowerCase()
  if (tipo === 'Terreno') return name === 'land' || name === 'terreno'
  if (tipo === 'Casa') return name === 'house' || name === 'casa'
  if (tipo === 'Departamento') return name === 'apartment' || name === 'departamento'
  return true
}

function operationTimestamp(p: TokkoProperty): number {
  // Tokko no expone created_at en TokkoProperty tipado; usamos id como proxy
  // (los IDs son monótonos crecientes en Tokko).
  return p.id ?? 0
}

export interface BarrioPropertiesResult {
  properties: TokkoProperty[]
  total: number
  lastUpdate: string
  cached: boolean
}

export async function getPropiedadesByBarrio(
  slug: string,
  tipo: TipoPropiedad = 'Todos',
): Promise<BarrioPropertiesResult> {
  const barrio = getBarrioBySlug(slug)
  if (!barrio) {
    return { properties: [], total: 0, lastUpdate: new Date().toISOString(), cached: false }
  }

  const redis = getRedis()
  const key = cacheKey(slug, tipo)

  if (redis) {
    try {
      const cached = await redis.get<string>(key)
      if (cached) {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : (cached as BarrioPropertiesResult)
        return { ...parsed, cached: true }
      }
    } catch (err) {
      console.warn('[barrios] Redis cache read error:', err)
    }
  }

  const all = await getProperties({ limit: 100 })
  const filtered = (all.objects ?? [])
    .filter((p) => propertyMatchesBarrio(p, barrio))
    .filter((p) => matchesType(p, tipo))
    .map(sanitizeProperty)
    .sort((a, b) => operationTimestamp(b) - operationTimestamp(a))

  const result: BarrioPropertiesResult = {
    properties: filtered,
    total: filtered.length,
    lastUpdate: new Date().toISOString(),
    cached: false,
  }

  if (redis) {
    try {
      await redis.set(key, JSON.stringify(result), { ex: CACHE_TTL_SECONDS })
    } catch (err) {
      console.warn('[barrios] Redis cache write error:', err)
    }
  }

  return result
}

export async function getCountsByBarrio(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  try {
    const all = await getProperties({ limit: 100 })
    for (const barrio of BARRIOS) {
      counts[barrio.slug] = (all.objects ?? []).filter((p) =>
        propertyMatchesBarrio(p, barrio),
      ).length
    }
  } catch (err) {
    console.warn('[barrios] getCountsByBarrio error:', err)
    for (const b of BARRIOS) counts[b.slug] = 0
  }
  return counts
}
