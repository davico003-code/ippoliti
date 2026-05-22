// POST /api/admin/revalidate-propiedades
//
// Forzar refresh del cache de propiedades de todas las capas:
//   - Next.js data cache: revalidateTag('tokko-properties') invalida todas
//     las pages/routes que pasen ese tag al fetch (lib/tokko.ts).
//   - Vercel CDN edge cache: revalidatePath() sobre los API routes con
//     Cache-Control public s-maxage los marca como stale.
//   - Redis Upstash: SCAN+DEL para borrar 'barrios:propiedades:*' (cache
//     custom de getPropiedadesByBarrio, TTL 1h). NO toca audio:* ni
//     ficha:* (otros subsistemas).
//
// Auth: header x-team-code contra SI_TEAM_CODE.
//
// Ejemplo de uso:
//   curl -X POST 'https://siinmobiliaria.com/api/admin/revalidate-propiedades' \
//     -H 'x-team-code: inmobiliaria123'
//
// Devuelve { ok, redisKeysDeleted, tagsRevalidated, pathsRevalidated, errors }.

import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redis } from '@/lib/redis'
import { assertTeamCode } from '@/lib/team-auth'

export const dynamic = 'force-dynamic'

// Tags definidos en src/lib/tokko.ts. 'tokko-properties' es el tag base que
// llevan TODAS las pages que llaman getProperties(), así que invalidarlo es
// suficiente para destrabar el listado entero (no hace falta enumerar pages
// individualmente — Next revalida cualquier render que dependa de ese tag).
const TAGS = ['tokko-properties']

// Paths a revalidar explícitamente. Cubren:
//   - Rutas server-rendered críticas con datos de listado.
//   - API routes con Cache-Control: s-maxage que cachea Vercel Edge — el
//     revalidateTag por sí solo no limpia esa capa, hay que pasar el path.
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

async function deleteByPattern(pattern: string): Promise<number> {
  let cursor: string = '0'
  let deleted = 0

  // Tope defensivo: 200 iteraciones × count 200 = 40k keys máx por patrón.
  // Suficiente para el tamaño de Redis del proyecto, sin riesgo de loop infinito.
  for (let i = 0; i < 200; i++) {
    const [next, batch] = (await redis.scan(cursor, {
      match: pattern,
      count: 200,
    })) as [string, string[]]

    if (Array.isArray(batch) && batch.length > 0) {
      // Upstash DEL acepta múltiples keys en una sola llamada.
      const n = await redis.del(...batch)
      deleted += typeof n === 'number' ? n : batch.length
    }

    cursor = next
    if (cursor === '0') break
  }

  return deleted
}

export async function POST(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

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

  return NextResponse.json(
    {
      ok,
      redisKeysDeleted,
      tagsRevalidated,
      pathsRevalidated,
      errors,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 500 },
  )
}
