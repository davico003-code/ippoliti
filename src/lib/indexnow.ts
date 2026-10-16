import 'server-only'
import { redis } from '@/lib/redis'
import { generatePropertySlug, getPropertyById, sanitizeProperty } from '@/lib/tokko'

// IndexNow: le avisa a Bing (y a los que comparten el protocolo: Yandex, Seznam,
// Naver) que una URL cambió, para que la vuelvan a leer en minutos en vez de días.
// ChatGPT, Copilot y DuckDuckGo buscan sobre el índice de Bing: una ficha nueva
// o dada de baja llega ahí sin esperar al rastreo. Google NO usa IndexNow (para
// Google está el sitemap con lastmod real).
//
// La clave es pública por diseño: public/<clave>.txt prueba que el sitio es nuestro.
export const INDEXNOW_KEY = 'f99b8126a2afb574afa27f07227bd3fe'
export const SITIO = 'https://siinmobiliaria.com'
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const POR_PEDIDO = 10_000
/** id de la ficha → su ruta (/propiedades/123-casa-en-…): con la propiedad ya
 *  dada de baja, el feed no la devuelve y la ruta indexada sale de acá. */
export const CLAVE_FICHAS = 'indexnow:fichas'

export type ResultadoIndexNow = { enviadas: number; estado?: number; omitido?: string }

/** Avisa estas rutas o URLs del sitio. Nunca tira: un aviso perdido lo recupera
 *  el repaso diario (cron /api/cron/indexnow). Solo en producción, salvo
 *  INDEXNOW_FORZAR=1 (los previews no avisan URLs de producción). */
export async function avisarIndexNow(rutas: Array<string | null | undefined>, motivo: string): Promise<ResultadoIndexNow> {
  const urlList = Array.from(new Set(
    rutas.filter((r): r is string => !!r).map((r) => (r.startsWith('http') ? r : `${SITIO}${r}`)),
  )).filter((u) => u === SITIO || u.startsWith(`${SITIO}/`))
  if (!urlList.length) return { enviadas: 0 }
  if (process.env.VERCEL_ENV !== 'production' && process.env.INDEXNOW_FORZAR !== '1') {
    return { enviadas: 0, omitido: 'no es producción' }
  }
  let estado: number | undefined
  for (let i = 0; i < urlList.length; i += POR_PEDIDO) {
    const lote = urlList.slice(i, i + POR_PEDIDO)
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: 'siinmobiliaria.com', key: INDEXNOW_KEY, keyLocation: `${SITIO}/${INDEXNOW_KEY}.txt`, urlList: lote }),
        // Corto: Hilo espera la respuesta de /api/revalidate 6 s.
        signal: AbortSignal.timeout(3500),
        cache: 'no-store',
      })
      estado = r.status
      // 200 = recibido · 202 = recibido, validando la clave. El resto es un error.
      if (r.status !== 200 && r.status !== 202) {
        console.error('[indexnow]', motivo, r.status, (await r.text().catch(() => '')).slice(0, 200))
      }
    } catch (e) {
      console.error('[indexnow]', motivo, 'sin respuesta', e instanceof Error ? e.message : e)
    }
  }
  return { enviadas: urlList.length, estado }
}

/** Una propiedad cambió (alta, edición, vendida, reservada, baja): avisa su
 *  ficha —la de hoy y la que estaba indexada, si el título cambió— y el listado. */
export async function avisarCambioDeFicha(id: string | number): Promise<ResultadoIndexNow> {
  let ruta: string | null = null
  try {
    const p = sanitizeProperty(await getPropertyById(Number(id)))
    if (!p.deleted_at) ruta = `/propiedades/${generatePropertySlug(p)}`
  } catch {
    // Dada de baja (el feed responde 404): queda la ruta que estaba indexada.
  }
  const anterior = await redis.hget<string>(CLAVE_FICHAS, String(id)).catch(() => null)
  if (ruta && ruta !== anterior) await redis.hset(CLAVE_FICHAS, { [String(id)]: ruta }).catch(() => {})
  return avisarIndexNow([ruta, anterior, '/propiedades'], `ficha ${id}`)
}
