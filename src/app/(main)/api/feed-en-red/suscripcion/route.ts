import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { pushSuscripcionToHilo } from '@/lib/hilo-leads'
import { rateLimit } from '@/lib/feedback'
import { esEmail, parsearCriteriosWeb } from '@/lib/feed-en-red'

// "Recibí las nuevas por mail" del Tinder (David, 4-oct-2026: "que puedan dejar
// su mail y ya prefiltramos su búsqueda para empezar a hacer campañas de
// mailing"). Mail + búsqueda (dónde, qué, hasta cuánto) → respaldo en Redis y
// a Hilo, que la escribe en el contacto con consentimiento de email y lo suma
// a la lista "Web: búsquedas por mail". No es una consulta: nadie lo llama.

const MOTIVOS = new Set(['Más económicas', 'Más grandes', 'Otra zona', 'Otro tipo de propiedad', 'Solo estaba mirando'])

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'feed-suscripcion', 6, 60))) {
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
  const criterios = parsearCriteriosWeb(body.criterios)
  if (!criterios) return NextResponse.json({ error: 'Falta la búsqueda.' }, { status: 400 })
  const nombre = str(body.nombre, 80)
  const busqueda = str(body.busqueda, 80) || null
  const pageUrl = str(body.pageUrl, 400) || null
  const motivos = Array.isArray(body.motivos) ? body.motivos.map((m) => str(m, 40)).filter((m, i, xs) => MOTIVOS.has(m) && xs.indexOf(m) === i) : []

  const suscripcion = { ...criterios, busqueda, pagina: pageUrl }
  const [savedRedis, savedHilo] = await Promise.all([
    (async () => {
      try {
        const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })
        await redis.lpush('feed:suscripciones', JSON.stringify({ email, nombre, ...suscripcion, motivos, fecha: new Date().toISOString() }))
        await redis.ltrim('feed:suscripciones', 0, 9999)
        return true
      } catch (err) {
        console.error('[feed-suscripcion] Redis error:', err)
        return false
      }
    })(),
    pushSuscripcionToHilo({ email, nombre: nombre.length >= 2 ? nombre : null, criterios: suscripcion }),
  ])
  if (!savedRedis && !savedHilo) {
    console.error('[feed-suscripcion] SUSCRIPCIÓN PERDIDA: falló Redis y Hilo')
    return NextResponse.json({ error: 'No pudimos anotarte en este momento. Reintentá en unos segundos.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
