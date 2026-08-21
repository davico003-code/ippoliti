// Cron diario de salud de las fichas neutras (verficha.casa).
//
// Nació del 21-ago-2026: un agente compartió una selección con fichas de
// Argenprop y el cliente las vio SIN fotos (el middleware del host neutro
// bloqueaba /api/image-proxy). Este cron hace dos cosas para que no se repita:
//
//  1. AUTO-CURA: las fichas activas cuyas fotos todavía apuntan a un CDN
//     externo (argenprop/zonaprop/colega) se re-hostean en Vercel Blob y se
//     actualiza el snapshot. Así dejan de depender del portal.
//  2. MONITOREO: verifica, como lo vería el cliente, que
//       - /api/image-proxy responde en verficha.casa (no cae en not-found),
//       - la foto de portada de cada ficha activa carga (200 image/*),
//       - la página de una ficha externa responde 200.
//     Si algo falla, avisa por WhatsApp al admin. Los lunes manda un resumen OK
//     como latido (si el cron dejara de correr, se nota por ausencia).
//
// Se puede disparar a mano: GET /api/cron/fichas-salud con Bearer CRON_SECRET.
// ?dry=1 → solo reporta, no re-hostea ni notifica.

import { NextRequest, NextResponse } from 'next/server'
import { listFichas, actualizarFotosFicha } from '@/lib/ficha'
import { rehostFotos, necesitaRehost, esFotoPropia } from '@/lib/rehost-fotos'
import { publicImageUrl } from '@/lib/external-images'
import { redis } from '@/lib/redis'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

const NEUTRAL_ORIGIN = `https://${process.env.NEXT_PUBLIC_NEUTRAL_DOMAIN || 'verficha.casa'}`
const MAX_REHOST_POR_CORRIDA = 25
const MAX_CHEQUEOS = 60
const LAST_KEY = 'fichas:salud:last'
const SAMPLE_ARGENPROP =
  'https://www.argenprop.com/static-content/34130991/86334248-212f-49e5-9495-cb3eaf80122f_u_medium.jpg'

type Problema = { slug: string; detalle: string }

async function cargaImagen(url: string): Promise<{ ok: boolean; status: number; ct: string }> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SI-fichas-salud/1.0', Accept: 'image/*,*/*;q=0.8' },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    })
    const ct = (res.headers.get('content-type') || '').split(';')[0].trim()
    // Consumimos poco para no bajar la imagen entera.
    try { await res.body?.cancel() } catch { /* noop */ }
    return { ok: res.ok && ct.startsWith('image/'), status: res.status, ct }
  } catch {
    return { ok: false, status: 0, ct: '' }
  }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const dry = req.nextUrl.searchParams.get('dry') === '1'
  const t0 = Date.now()
  const problemas: Problema[] = []
  const curadas: string[] = []
  let pendientesRehost = 0

  const ahora = Date.now()
  const fichas = (await listFichas()).filter(
    f => !f.revokedAt && new Date(f.expiresAt).getTime() > ahora && f.snapshot?.fotos?.length,
  )

  // ── 1. Auto-cura: re-host de fotos externas ─────────────────────────────
  const externas = fichas.filter(f => necesitaRehost(f.snapshot.fotos))
  for (const f of externas) {
    if (curadas.length >= MAX_REHOST_POR_CORRIDA || dry) {
      pendientesRehost++
      continue
    }
    const r = await rehostFotos(f.snapshot.fotos, `fichas-externas/backfill/${f.slug}`)
    if (r.subidas > 0) {
      await actualizarFotosFicha(f.slug, r.fotos)
      f.snapshot.fotos = r.fotos
      curadas.push(f.slug)
    }
    if (r.fallidas.length && r.fallidas.length === f.snapshot.fotos.filter(u => !esFotoPropia(u)).length && r.subidas === 0) {
      problemas.push({ slug: f.slug, detalle: `no se pudo re-hostear ninguna de ${r.fallidas.length} fotos (origen caído?)` })
    }
  }

  // ── 2. Monitoreo: el proxy del host neutro NO debe caer en not-found ─────
  const proxyUrl = publicImageUrl(SAMPLE_ARGENPROP, NEUTRAL_ORIGIN)!
  const proxy = await cargaImagen(proxyUrl)
  // 502 = Argenprop no devolvió esa foto puntual (aviso borrado): tolerable.
  // 404/HTML = el middleware volvió a bloquear el proxy: grave.
  if (proxy.status === 404 || (proxy.status >= 200 && proxy.status < 300 && !proxy.ok)) {
    problemas.push({ slug: '(proxy)', detalle: `/api/image-proxy en ${NEUTRAL_ORIGIN} respondió ${proxy.status} ${proxy.ct}` })
  }

  // ── 3. Monitoreo: portada de cada ficha activa, como la ve el cliente ────
  const aChequear = [...externas, ...fichas.filter(f => !externas.includes(f))].slice(0, MAX_CHEQUEOS)
  let okPortadas = 0
  for (const f of aChequear) {
    const cover = f.snapshot.fotos[0]
    const url = publicImageUrl(cover, NEUTRAL_ORIGIN)!
    const r = await cargaImagen(url)
    if (r.ok) okPortadas++
    else problemas.push({ slug: f.slug, detalle: `portada rota (${r.status || 'timeout'} ${r.ct}) ${cover.slice(0, 90)}` })
  }

  // ── 4. Monitoreo: una ficha externa responde 200 ─────────────────────────
  const muestra = fichas.find(f => f.origen === 'externa') || fichas[0]
  if (muestra) {
    try {
      const res = await fetch(`${NEUTRAL_ORIGIN}/${muestra.slug}`, {
        headers: { 'User-Agent': 'SI-fichas-salud/1.0' },
        signal: AbortSignal.timeout(15000),
        cache: 'no-store',
      })
      const html = await res.text()
      if (!res.ok || !/<img/i.test(html)) {
        problemas.push({ slug: muestra.slug, detalle: `página ${res.status} ${res.ok ? 'sin <img>' : ''}` })
      }
    } catch (e) {
      problemas.push({ slug: muestra.slug, detalle: `página no responde: ${e instanceof Error ? e.message : String(e)}` })
    }
  }

  const resumen = {
    ok: problemas.length === 0,
    timestamp: new Date().toISOString(),
    ms: Date.now() - t0,
    fichasActivas: fichas.length,
    externasConFotosAjenas: externas.length,
    curadas,
    pendientesRehost,
    portadasOk: `${okPortadas}/${aChequear.length}`,
    proxyNeutro: proxy.status,
    problemas,
    dry,
  }

  try {
    await redis.set(LAST_KEY, JSON.stringify(resumen), { ex: 14 * 24 * 60 * 60 })
  } catch { /* no bloquea */ }

  // ── Aviso ────────────────────────────────────────────────────────────────
  const esLunes = new Date().getUTCDay() === 1
  if (!dry && (problemas.length > 0 || esLunes)) {
    try {
      const { enviarWhatsAppAdmin } = await import('@/agents/blog/lib/whatsapp')
      const lineas = problemas.length
        ? [
            `🚨 Fichas verficha — ${problemas.length} problema(s)`,
            ``,
            ...problemas.slice(0, 8).map(p => `• ${p.slug}: ${p.detalle}`),
            problemas.length > 8 ? `…y ${problemas.length - 8} más` : '',
            ``,
            `Portadas OK: ${resumen.portadasOk} · curadas hoy: ${curadas.length}`,
            `Correr a mano: /api/cron/fichas-salud`,
          ]
        : [
            `✅ Fichas verficha — todo OK (latido semanal)`,
            `${fichas.length} activas · portadas ${resumen.portadasOk} · curadas ${curadas.length}`,
          ]
      await enviarWhatsAppAdmin(lineas.filter(l => l !== undefined).join('\n'))
    } catch (err) {
      console.error('[fichas-salud] no se pudo notificar:', err)
    }
  }

  console.log('[fichas-salud]', JSON.stringify(resumen))
  return NextResponse.json(resumen, { status: problemas.length ? 500 : 200 })
}
