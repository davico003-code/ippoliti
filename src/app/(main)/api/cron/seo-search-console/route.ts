export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Monitor diario de Search Console (la capa que la rutina de chequeos técnicos
// no puede ver: qué hizo GOOGLE con el sitio). Corre por cron de Vercel y solo
// molesta por WhatsApp cuando encuentra un problema:
//   1. Google dejó de leer el sitemap (>7 días) → lo reenvía solo y avisa.
//   2. Cayó fuerte la cantidad de páginas visibles en Google (>30% en 7 días).
//   3. Alguna página clave (home, /propiedades, /blog) dejó de estar indexada.
// Baseline en Redis: seo:gsc:paginas_visibles.

import {
  getSitemapStatus,
  submitSitemap,
  getPaginasConImpresiones,
  inspectUrl,
} from '@/lib/gsc'
import { redis } from '@/lib/redis'
import { enviarWhatsAppAdmin } from '@/agents/blog/lib/whatsapp'

const SITEMAP_STALE_DIAS = 7
const CAIDA_ALERTA = 0.3 // -30% de páginas visibles en una semana → alerta
const BASELINE_KEY = 'seo:gsc:paginas_visibles'
const URLS_CLAVE = [
  'https://siinmobiliaria.com/',
  'https://siinmobiliaria.com/propiedades',
  'https://siinmobiliaria.com/blog',
]

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const alertas: string[] = []
  const resumen: Record<string, unknown> = {}

  // 1. Sitemap: ¿Google lo sigue leyendo?
  try {
    const sitemap = await getSitemapStatus()
    resumen.sitemap = sitemap
    const dias = sitemap.lastDownloaded
      ? (Date.now() - Date.parse(sitemap.lastDownloaded)) / 86_400_000
      : Infinity
    if (dias > SITEMAP_STALE_DIAS && !sitemap.isPending) {
      try {
        await submitSitemap()
        alertas.push(
          `Google no leía el sitemap hace ${Math.round(dias)} días. Lo reenvié automáticamente — no hace falta que hagas nada, es para que sepas.`,
        )
      } catch (err) {
        // Sin permiso de propietario el submit da 403: avisar en vez de romper.
        alertas.push(
          `Google no lee el sitemap hace ${Math.round(dias)} días y no pude reenviarlo por API (${err instanceof Error ? err.message.slice(0, 120) : 'error'}). Reenvialo a mano en Search Console → Sitemaps.`,
        )
      }
    }
    if (sitemap.errors > 0) {
      alertas.push(`Search Console reporta ${sitemap.errors} error(es) en el sitemap.`)
    }
  } catch (err) {
    alertas.push(
      `No pude consultar el estado del sitemap en Search Console: ${err instanceof Error ? err.message.slice(0, 160) : 'error'}`,
    )
  }

  // 2. Tendencia de páginas visibles en Google (proxy de indexación).
  try {
    const actual = await getPaginasConImpresiones(7)
    resumen.paginasVisibles = actual
    const previo = Number(await redis.get<number>(BASELINE_KEY)) || 0
    resumen.paginasVisiblesPrevio = previo
    if (previo >= 50 && actual < previo * (1 - CAIDA_ALERTA)) {
      alertas.push(
        `Caída fuerte de visibilidad en Google: la última semana ${actual} páginas recibieron impresiones vs ${previo} la medición anterior (-${Math.round((1 - actual / previo) * 100)}%). Revisar Search Console → Rendimiento.`,
      )
    }
    // El baseline se actualiza siempre: una caída sostenida alerta una vez,
    // no todos los días.
    await redis.set(BASELINE_KEY, actual)
  } catch (err) {
    alertas.push(
      `No pude consultar la visibilidad en Search Console: ${err instanceof Error ? err.message.slice(0, 160) : 'error'}`,
    )
  }

  // 3. Páginas clave: ¿siguen indexadas?
  try {
    const inspecciones = await Promise.all(URLS_CLAVE.map((u) => inspectUrl(u)))
    resumen.inspecciones = inspecciones
    for (const insp of inspecciones) {
      if (insp.verdict !== 'PASS') {
        alertas.push(
          `Página clave SIN indexar según Google: ${insp.url} → "${insp.coverageState}".`,
        )
      }
    }
  } catch (err) {
    alertas.push(
      `No pude inspeccionar las páginas clave: ${err instanceof Error ? err.message.slice(0, 160) : 'error'}`,
    )
  }

  // Notificación: solo si hay algo que decir. Con ?dry=1 se saltea el
  // WhatsApp (para probar el circuito a mano sin hacer ruido).
  const dry = new URL(req.url).searchParams.get('dry') === '1'
  if (alertas.length > 0 && !dry) {
    const cuerpo = `🔍 Monitor de indexación — siinmobiliaria.com\n\n${alertas.map((a) => `• ${a}`).join('\n')}`
    try {
      await enviarWhatsAppAdmin(cuerpo)
    } catch (err) {
      console.error('[seo-gsc] No se pudo enviar el WhatsApp de alerta:', err)
    }
  }

  console.log(`[seo-gsc] ${alertas.length} alerta(s)`, JSON.stringify(resumen))
  return Response.json({
    success: true,
    alertas,
    resumen,
    timestamp: new Date().toISOString(),
  })
}
