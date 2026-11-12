import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { pushAvisameSiBajaToHilo } from '@/lib/hilo-leads'
import { rateLimit } from '@/lib/feedback'
import { esEmail } from '@/lib/feed-en-red'

// "Avisame si baja" de la ficha (David, 4-oct-2026): mail + propiedad →
// respaldo en Redis y a Hilo, que guarda el pedido y lo suma al aviso
// automático de bajas por emBlue (24 h después del último cambio de precio).

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'avisame-si-baja', 6, 60))) {
    return NextResponse.json({ error: 'Demasiados envíos seguidos. Esperá un momento y reintentá.' }, { status: 429 })
  }
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const str = (v: unknown, max = 200) => String(v ?? '').replace(/[\n\r]+/g, ' ').trim().slice(0, max)
  const email = str(body.email, 120).toLowerCase()
  if (!esEmail(email)) return NextResponse.json({ error: 'Revisá el mail.' }, { status: 400 })
  const propiedadId = Number(body.propiedadId)
  if (!Number.isInteger(propiedadId) || propiedadId <= 0) return NextResponse.json({ error: 'Falta la propiedad.' }, { status: 400 })
  const nombre = str(body.nombre, 80)
  const pagina = str(body.pageUrl, 400) || null

  const [savedRedis, savedHilo] = await Promise.all([
    (async () => {
      try {
        const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })
        await redis.lpush('avisame-si-baja', JSON.stringify({ email, nombre, propiedadId, pagina, fecha: new Date().toISOString() }))
        await redis.ltrim('avisame-si-baja', 0, 9999)
        return true
      } catch (err) {
        console.error('[avisame-si-baja] Redis error:', err)
        return false
      }
    })(),
    pushAvisameSiBajaToHilo({ email, nombre: nombre.length >= 2 ? nombre : null, propiedadId, pagina }),
  ])
  // Lo que importa es que Hilo lo tenga (es quien manda el aviso): sin Hilo,
  // queda en Redis para cargarlo a mano, pero se le avisa que reintente.
  if (!savedHilo) {
    console.error('[avisame-si-baja] Hilo no lo registró', { propiedadId, redis: savedRedis })
    return NextResponse.json({ error: 'No pudimos anotarte en este momento. Reintentá en unos segundos.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
