// Lógica compartida de revalidación del cache de propiedades de Tokko.
//
// Refresca todas las capas de cache de una sola pasada:
//   - Next.js data cache: revalidateTag('tokko-properties') invalida todas
//     las pages/routes que pasen ese tag al fetch (lib/tokko.ts).
//   - Vercel CDN edge cache: revalidatePath() sobre los API routes con
//     Cache-Control public s-maxage los marca como stale.
//   - Redis Upstash: SCAN+DEL para borrar 'barrios:propiedades:*' (cache
//     custom de getPropiedadesByBarrio, TTL 1h). NO toca audio:* ni
//     ficha:* (otros subsistemas).
//
// La usan dos endpoints con auth distinta:
//   - /api/admin/revalidate-propiedades  → header x-team-code (SI_TEAM_CODE)
//   - /api/agentes/revalidate-tokko      → cookie si_agent_token (panel)

import { revalidatePath, revalidateTag } from 'next/cache'
import { redis } from '@/lib/redis'

// 'tokko-properties' es el tag base que llevan TODAS las pages que llaman
// getProperties(), así que invalidarlo destraba el listado entero.
const TAGS = ['tokko-properties']

// API routes con Cache-Control: s-maxage que cachea Vercel Edge — el
// revalidateTag por sí solo no limpia esa capa, hay que pasar el path.
const PATHS = [
  '/',
  '/propiedades',
  '/api/propiedades',
  '/api/propiedades/list-cards',
  '/api/propiedades/similar',
  '/api/propiedades/nearby',
]

// Patrones Redis a borrar. Si en el futuro se suman otros caches de
// propiedades, agregar el prefijo acá. NO incluir audio:* ni ficha:*.
const REDIS_PATTERNS = ['barrios:propiedades:*']

export interface RevalidateResult {
  ok: boolean
  redisKeysDeleted: number
  tagsRevalidated: string[]
  pathsRevalidated: string[]
  errors: string[]
  timestamp: string
}

async function deleteByPattern(pattern: string): Promise<number> {
  let cursor: string = '0'
  let deleted = 0

  // Tope defensivo: 200 iteraciones × count 200 = 40k keys máx por patrón.
  for (let i = 0; i < 200; i++) {
    const [next, batch] = (await redis.scan(cursor, {
      match: pattern,
      count: 200,
    })) as [string, string[]]

    if (Array.isArray(batch) && batch.length > 0) {
      const n = await redis.del(...batch)
      deleted += typeof n === 'number' ? n : batch.length
    }

    cursor = next
    if (cursor === '0') break
  }

  return deleted
}

export async function revalidarPropiedades(): Promise<RevalidateResult> {
  const errors: string[] = []
  let redisKeysDeleted = 0
  const tagsRevalidated: string[] = []
  const pathsRevalidated: string[] = []

  for (const pattern of REDIS_PATTERNS) {
    try {
      const n = await deleteByPattern(pattern)
      redisKeysDeleted += n
      console.log(`[revalidate-propiedades] redis ${pattern} → ${n} keys`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      errors.push(`redis ${pattern}: ${msg}`)
      console.error(`[revalidate-propiedades] redis ${pattern} falló:`, msg)
    }
  }

  for (const tag of TAGS) {
    try {
      revalidateTag(tag)
      tagsRevalidated.push(tag)
    } catch (e) {
      errors.push(`tag ${tag}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  for (const path of PATHS) {
    try {
      revalidatePath(path)
      pathsRevalidated.push(path)
    } catch (e) {
      errors.push(`path ${path}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const ok = errors.length === 0
  console.log(
    `[revalidate-propiedades] done ok=${ok} redis=${redisKeysDeleted} tags=${tagsRevalidated.length} paths=${pathsRevalidated.length}`,
  )

  return {
    ok,
    redisKeysDeleted,
    tagsRevalidated,
    pathsRevalidated,
    errors,
    timestamp: new Date().toISOString(),
  }
}
