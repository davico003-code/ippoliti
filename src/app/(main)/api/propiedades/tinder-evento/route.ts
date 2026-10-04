import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { rateLimit } from '@/lib/feedback'
import { EVENTOS_TINDER, type EventoTinder } from '@/lib/tinder-contador'

// POST /api/propiedades/tinder-evento { evento, origen, v } — suma un paso del
// Tinder en el Redis compartido (lo lee Hilo en Resultados → Tinder web):
//   tinder:dia:<YYYY-MM-DD>           hash  evento → veces · "evento|origen" → veces
//   tinder:uv:<YYYY-MM-DD>:<evento>   HyperLogLog de personas (v = id por navegador)
// Día de Argentina. Mismo contrato que si-crm src/lib/tinder/metricas-logic.ts.

// TINDER_PREFIJO solo para pruebas locales (no ensuciar el contador real).
const PREFIJO = process.env.TINDER_PREFIJO || 'tinder'
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|headless|lighthouse/i
const DIAS_GUARDADO = 400

export async function POST(req: Request) {
  if (BOT.test(req.headers.get('user-agent') ?? '')) return new NextResponse(null, { status: 204 })
  const body = (await req.json().catch(() => null)) as { evento?: unknown; origen?: unknown; v?: unknown } | null
  const evento = EVENTOS_TINDER.find((e) => e === body?.evento) as EventoTinder | undefined
  const origen = body?.origen === 'ficha' || body?.origen === 'home' ? body.origen : null
  const v = typeof body?.v === 'string' && /^[A-Za-z0-9-]{4,64}$/.test(body.v) ? body.v : null
  if (!evento || !origen || !v) return NextResponse.json({ error: 'evento inválido' }, { status: 400 })
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'tinder-evento', 120, 60))) return new NextResponse(null, { status: 204 })
  try {
    const dia = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
    const kDia = `${PREFIJO}:dia:${dia}`
    const kUv = `${PREFIJO}:uv:${dia}:${evento}`
    const p = redis.pipeline()
    p.hincrby(kDia, evento, 1)
    p.hincrby(kDia, `${evento}|${origen}`, 1)
    p.pfadd(kUv, v)
    p.expire(kDia, DIAS_GUARDADO * 86_400)
    p.expire(kUv, DIAS_GUARDADO * 86_400)
    await p.exec()
  } catch (e) {
    console.warn('[tinder-evento]', e instanceof Error ? e.message : e)
  }
  return new NextResponse(null, { status: 204 })
}
