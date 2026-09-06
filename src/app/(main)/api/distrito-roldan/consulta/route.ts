import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { pushLeadToHilo } from '@/lib/hilo-leads'
import { rateLimit } from '@/lib/feedback'
import { celularArValido, normalizarCelularAr } from '@/lib/tasacion/formato'
import { leerPlanoPublicado } from '@/lib/distrito-roldan/plano-publicado'
import { armarBriefLote, armarLoteLead, leerLoteCliente, leerPaginaUrl, leerUtm } from '@/lib/distrito-roldan/consulta'

// POST /api/distrito-roldan/consulta — "Consultar por este lote" del plano
// interactivo (public/planos/distrito-roldan.html). 06-sep-2026.
//
// Mismo patrón que /api/tasacion/solicitud: rate limit por IP, honeypot,
// respaldo best-effort en Redis y push server-to-server a Hilo (origen
// 'lote_web' + objeto `lote` del contrato). Responde ok:true SOLO si Hilo
// aceptó; si no, 502 con texto humano y la hoja ofrece reintentar.
//
// Los números del lote se releen del plano publicado (Blob) y no del body:
// el navegador solo dice QUÉ lote y desde qué página; el precio, la cuota y
// el estado salen del plano vivo.
export const dynamic = 'force-dynamic'

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })
}

const ERROR_HILO = 'No pudimos registrar tu consulta. Probá de nuevo en un momento.'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'dr-lote', 6, 60))) {
    return NextResponse.json(
      { error: 'Demasiados envíos seguidos. Esperá un momento y volvé a intentar.' },
      { status: 429 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 })
  }

  // Honeypot: un humano nunca ve ni completa este campo. Si viene con algo,
  // respondemos como si todo hubiera salido bien y no registramos nada.
  if (str(body.website, 200)) return NextResponse.json({ ok: true })

  const nombre = str(body.nombre, 80)
  const celular = normalizarCelularAr(str(body.whatsapp, 40))
  if (nombre.length < 2) {
    return NextResponse.json({ error: 'Contanos tu nombre para saber a quién escribirle.' }, { status: 400 })
  }
  if (!celularArValido(celular)) {
    return NextResponse.json(
      { error: 'Revisá el WhatsApp: son 10 dígitos con el código de área (341, 3476…), sin el 15.' },
      { status: 400 },
    )
  }
  const cli = leerLoteCliente(body.lote)
  if (!cli) {
    return NextResponse.json({ error: 'No reconocimos el lote. Volvé al plano y elegilo de nuevo.' }, { status: 400 })
  }

  const plano = await leerPlanoPublicado()
  const lote = armarLoteLead(cli, plano, leerUtm(body.utm), leerPaginaUrl(body.paginaUrl))
  const phone = `+549${celular}`
  const brief = armarBriefLote(lote)

  // Respaldo en Redis: si Hilo falla, el pedido no se pierde igual.
  try {
    const redis = getRedis()
    const ts = Date.now()
    const leadData = { nombre, whatsapp: phone, origen: 'lote_web', brief, lote, fecha: new Date(ts).toISOString() }
    await redis.set(`lead:lote_web:${ts}:${celular}`, JSON.stringify(leadData))
    await redis.lpush('leads:all', JSON.stringify(leadData))
  } catch (err) {
    console.error('[dr-lote] Redis error:', err)
  }

  let aceptado = await pushLeadToHilo({
    name: nombre,
    phone,
    origen: 'lote_web',
    message: brief,
    lote,
  })

  // Solo en desarrollo, con DR_LOTE_MOCK=1 y sin secreto de Hilo: simulamos la
  // aceptación para recorrer el flujo completo mientras Hilo termina de
  // aceptar 'lote_web' (se construye en paralelo). En producción nunca aplica.
  if (
    !aceptado &&
    process.env.DR_LOTE_MOCK === '1' &&
    process.env.NODE_ENV !== 'production' &&
    !process.env.HILO_INGEST_SECRET
  ) {
    console.info('[dr-lote] MOCK: consulta simulada como aceptada —', brief)
    aceptado = true
  }

  if (!aceptado) {
    console.error('[dr-lote] Hilo no aceptó el pedido', { lote: lote.nro, estado: lote.estado })
    return NextResponse.json({ error: ERROR_HILO }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
