// Foto del agente que arma la selección. Las fotos viven en el Supabase del CRM
// (si-crm), que es una base distinta a la de verficha. Acá las leemos por la API
// REST de Supabase (PostgREST) por nombre del agente, cacheado en Redis para no
// pegarle en cada view.
//
// Env (en el Vercel de ippoliti, tomadas del CRM):
//   SI_SUPABASE_URL   → https://xxxx.supabase.co
//   SI_SUPABASE_KEY   → service_role o anon con permiso de leer agents.avatar_url
//
// Best-effort: si no hay credenciales o falla, devuelve null y la vista usa el
// avatar de iniciales.

import { redis } from './redis'

const CACHE_TTL = 7 * 24 * 60 * 60 // 7d
const cacheKey = (n: string) => `agente-foto:${n.toLowerCase().replace(/\s+/g, ' ').trim()}`

export async function getAgentePhoto(nombre: string | null | undefined): Promise<string | null> {
  const n = (nombre || '').replace(/\s+/g, ' ').trim()
  if (!n) return null

  try {
    const cached = await redis.get<string>(cacheKey(n))
    if (cached === '__none__') return null
    if (cached) return cached
  } catch {
    /* cache best-effort */
  }

  const url = process.env.SI_SUPABASE_URL
  const key = process.env.SI_SUPABASE_KEY
  let foto: string | null = null
  if (url && key) {
    try {
      const q = `${url}/rest/v1/agents?select=avatar_url&full_name=eq.${encodeURIComponent(n)}&limit=1`
      const res = await fetch(q, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(6000),
      })
      if (res.ok) {
        const rows = (await res.json()) as { avatar_url?: string | null }[]
        const u = rows?.[0]?.avatar_url
        if (u && /^https?:\/\//i.test(u)) foto = u
      }
    } catch {
      /* red/timeout: best-effort */
    }
  }

  try {
    await redis.set(cacheKey(n), foto ?? '__none__', { ex: CACHE_TTL })
  } catch {
    /* cache best-effort */
  }
  return foto
}
