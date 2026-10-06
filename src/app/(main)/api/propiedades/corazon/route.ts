// POST /api/propiedades/corazon — alguien marcó ♥ una casa NUESTRA en el mazo.
//
// Igual que /vista: la web no guarda nada, le avisa a HILO (servidor a
// servidor, con HILO_INGEST_SECRET) y HILO suma el ♥ del día. El informe al
// dueño y el Seguimiento lo muestran: "N personas la marcaron como favorita en
// la web" (David 5-oct). Best-effort: si HILO no responde, el mazo no se entera.
import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { rateLimit } from '@/lib/feedback'

export const dynamic = 'force-dynamic'

const HILO_BASE = process.env.HILO_FEED_URL || 'https://meethilo.com'
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|headless|lighthouse/i

export async function POST(req: Request) {
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return new NextResponse(null, { status: 204 })
  if (BOT.test(req.headers.get('user-agent') ?? '')) return new NextResponse(null, { status: 204 })
  const body = (await req.json().catch(() => ({}))) as { id?: unknown }
  const id = Number(body.id)
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'id inválido' }, { status: 400 })
  // Lo lee el DUEÑO: una persona = un ♥ por propiedad. El navegador ya no lo
  // repite; acá, uno por IP, propiedad y día (como las vistas: muchos celulares
  // comparten IP, un tope más largo se comería personas reales) y un tope por IP.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  try {
    const dia = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
    const primera = await redis.set(`corazon:${dia}:${id}:${ip}`, 1, { nx: true, ex: 26 * 3600 })
    if (primera === null) return new NextResponse(null, { status: 204 })
  } catch {
    /* sin Redis: se cuenta */
  }
  if (!(await rateLimit(ip, 'corazon', 30, 60))) return new NextResponse(null, { status: 204 })
  try {
    await fetch(`${HILO_BASE}/api/public/corazon-web`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-hilo-ingest-secret': secret },
      body: JSON.stringify({ id }),
      signal: AbortSignal.timeout(4000),
    })
  } catch {
    /* best-effort */
  }
  return new NextResponse(null, { status: 204 })
}
