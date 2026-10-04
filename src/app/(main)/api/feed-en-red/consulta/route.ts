import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { pushLeadToHilo } from '@/lib/hilo-leads'
import { rateLimit } from '@/lib/feedback'

// Consulta del feed de la ficha: nombre + WhatsApp + lo que marcó con ♥.
// Mismo camino que /api/leads: respaldo en Redis y empuje al inbox de Hilo,
// que arma el mensaje con la lista y la suma al link de seguimiento.

const ID_GUARDADA = /^(?:n:[1-9]\d{0,9}|propia:[1-9]\d{0,9}|meli:MLA\d{6,14})$/

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'feed-en-red', 6, 60))) {
    return NextResponse.json({ error: 'Demasiados envíos seguidos. Esperá un momento y reintentá.' }, { status: 429 })
  }
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const str = (v: unknown, max = 200) => String(v ?? '').trim().slice(0, max)
  const nombre = str(body.nombre, 80)
  const whatsapp = str(body.whatsapp, 30)
  const barrio = str(body.barrio, 80) || null
  const pageUrl = str(body.pageUrl, 400)
  const guardadas = Array.isArray(body.guardadas)
    ? body.guardadas
        .map((g) => str(g, 40))
        .filter((g, i, todas) => ID_GUARDADA.test(g) && todas.indexOf(g) === i)
        .slice(0, 12)
    : []

  if (nombre.length < 2) return NextResponse.json({ error: 'Contanos tu nombre.' }, { status: 400 })
  if (whatsapp.replace(/\D/g, '').length < 10) {
    return NextResponse.json({ error: 'Revisá el WhatsApp: con característica, por ejemplo 341 555 1234.' }, { status: 400 })
  }
  if (guardadas.length === 0) return NextResponse.json({ error: 'Marcá con el corazón las que te gustaron.' }, { status: 400 })

  const utm = (() => {
    try {
      const p = new URL(pageUrl).searchParams
      const g = (k: string) => p.get(`utm_${k}`) || undefined
      const u = { utm_source: g('source'), utm_medium: g('medium'), utm_campaign: g('campaign'), utm_content: g('content') }
      return Object.values(u).some(Boolean) ? { ...u, captured_at: new Date().toISOString() } : null
    } catch {
      return null
    }
  })()

  let savedRedis = false
  try {
    const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })
    const data = { nombre, whatsapp, origen: 'feed_web', guardadas, barrio, pageUrl, fecha: new Date().toISOString() }
    await redis.set(`lead:feed_web:${Date.now()}:${whatsapp}`, JSON.stringify(data))
    await redis.lpush('leads:all', JSON.stringify(data))
    savedRedis = true
  } catch (err) {
    console.error('[feed-en-red] Redis error:', err)
  }

  const savedHilo = await pushLeadToHilo({
    name: nombre,
    phone: whatsapp,
    origen: 'feed_web',
    guardadas,
    barrio,
    sourceUrl: pageUrl || null,
    attribution: utm,
  })

  if (!savedRedis && !savedHilo) {
    console.error('[feed-en-red] LEAD PERDIDO: falló Redis y Hilo')
    return NextResponse.json(
      { error: 'No pudimos registrar tu pedido en este momento. Reintentá en unos segundos o escribinos por WhatsApp.' },
      { status: 502 },
    )
  }
  return NextResponse.json({ ok: true })
}
