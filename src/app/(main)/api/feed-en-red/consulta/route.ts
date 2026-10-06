import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { pushLeadToHilo } from '@/lib/hilo-leads'
import { esEmail, parsearCriteriosWeb } from '@/lib/feed-en-red'
import { rateLimit } from '@/lib/feedback'

// Consulta del feed de la ficha: nombre + WhatsApp + lo que marcó con ♥.
// Mismo camino que /api/leads: respaldo en Redis y empuje al inbox de Hilo,
// que arma el mensaje con la lista y la suma al link de seguimiento.

const ID_GUARDADA = /^(?:n:[1-9]\d{0,9}|propia:[1-9]\d{0,9}|meli:MLA\d{6,14})$/
/** Las opciones del rescate ("¿Qué buscás?"): solo estas se aceptan. */
const MOTIVOS = new Set(['Más económicas', 'Más grandes', 'Otra zona', 'Otro tipo de propiedad', 'Solo estaba mirando'])

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
  // Una sola línea: la bandeja de Hilo lee el resumen renglón por renglón.
  const barrio = str(body.barrio, 80).replace(/[\n\r]+/g, ' ') || null
  // "Conocé tu próximo hogar" (home): qué eligió además de la zona ("casas hasta USD 200 mil").
  const busqueda = str(body.busqueda, 80).replace(/[\n\r]+/g, ' ') || null
  const pageUrl = str(body.pageUrl, 400)
  const tipo = str(body.tipo, 20)
  const motivos = Array.isArray(body.motivos) ? body.motivos.map((m) => str(m, 40)).filter((m, i, xs) => MOTIVOS.has(m) && xs.indexOf(m) === i) : []
  const vistas = Math.max(0, Math.min(99, Math.round(Number(body.vistas) || 0)))
  // Tocó ★ "Quiero conocerla" en el Tinder (4-oct): el asesor sabe que quiere coordinar la visita.
  const visita = body.visita === true
  // Lo que deslizó, en una línea ("Deslizó 14: le gustaron 3 … y pasó 11 …", lib/mazo-deslizadas.ts):
  // el asesor sabe qué busca de verdad sin preguntarle (David 5-oct).
  const deslizadas = str(body.deslizadas, 300).replace(/[\n\r]+/g, ' ') || null
  // Opcional (4-oct): dejó también el mail para recibir las nuevas de su búsqueda.
  const emailCrudo = str(body.email, 120).toLowerCase()
  const email = emailCrudo && esEmail(emailCrudo) ? emailCrudo : null
  const criterios = email ? parsearCriteriosWeb(body.suscripcion) : null
  const suscripcion = criterios ? { ...criterios, busqueda, pagina: pageUrl || null } : null

  // Rescate SIN WhatsApp: lo que eligió queda guardado para entender qué
  // buscaba la gente que no guardó ninguna (no va a Hilo: no hay a quién llamar).
  if (tipo === 'feedback') {
    if (motivos.length === 0) return NextResponse.json({ ok: true })
    try {
      const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })
      await redis.lpush('feed:feedback', JSON.stringify({ motivos, barrio, busqueda, vistas, deslizadas, pageUrl, fecha: new Date().toISOString() }))
      await redis.ltrim('feed:feedback', 0, 4999)
    } catch (err) {
      console.error('[feed-en-red] feedback Redis error:', err)
    }
    return NextResponse.json({ ok: true })
  }

  // Rescate CON WhatsApp: quiere que le avisemos cuando entre algo así → consulta a Hilo (por turno).
  if (tipo === 'busca') {
    if (whatsapp.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'Dejá tu WhatsApp con característica, por ejemplo 341 555 1234.' }, { status: 400 })
    }
    const mensaje = [
      `🔎 Miró ${vistas || 'varias'} propiedades en la web${barrio ? ` (zona ${barrio})` : ''} y no guardó ninguna.`,
      `Busca: ${[busqueda, ...motivos.map((m) => m.toLowerCase())].filter(Boolean).join(', ') || 'no dijo'}.`,
      'Pidió que le avisemos por WhatsApp cuando entre algo así.',
      deslizadas,
    ]
      .filter(Boolean)
      .join('\n')
    // Respaldo en Redis y empuje a Hilo A LA VEZ (antes en serie: la persona esperaba los dos).
    const [savedRedis, savedHilo] = await Promise.all([
      (async () => {
        try {
          const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })
          const data = { nombre, whatsapp, origen: 'feed_web_busca', motivos, barrio, busqueda, pageUrl, fecha: new Date().toISOString() }
          await redis.set(`lead:feed_web_busca:${Date.now()}:${whatsapp}`, JSON.stringify(data))
          await redis.lpush('leads:all', JSON.stringify(data))
          return true
        } catch (err) {
          console.error('[feed-en-red] Redis error:', err)
          return false
        }
      })(),
      pushLeadToHilo({
        name: nombre.length >= 2 ? nombre : null,
        phone: whatsapp,
        origen: 'feed_web_busca',
        message: mensaje,
        sourceUrl: pageUrl || null,
      }),
    ])
    if (!savedRedis && !savedHilo) {
      return NextResponse.json({ error: 'No pudimos registrar tu pedido. Reintentá en unos segundos o escribinos por WhatsApp.' }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  }

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

  // Respaldo en Redis y empuje a Hilo A LA VEZ (antes en serie: la persona esperaba los dos).
  const [savedRedis, savedHilo] = await Promise.all([
    (async () => {
      try {
        const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })
        const data = { nombre, whatsapp, email, origen: 'feed_web', guardadas, barrio, busqueda, visita, suscripcion, pageUrl, fecha: new Date().toISOString() }
        await redis.set(`lead:feed_web:${Date.now()}:${whatsapp}`, JSON.stringify(data))
        await redis.lpush('leads:all', JSON.stringify(data))
        return true
      } catch (err) {
        console.error('[feed-en-red] Redis error:', err)
        return false
      }
    })(),
    pushLeadToHilo({
      name: nombre,
      phone: whatsapp,
      email,
      origen: 'feed_web',
      guardadas,
      visita,
      barrio,
      suscripcion,
      message:
        [busqueda ? `Buscó en la web: ${busqueda}.` : null, visita ? 'Tocó «Quiero conocerla» en la primera de la lista: pidió coordinar esa visita.' : null, deslizadas]
          .filter(Boolean)
          .join(' ') || null,
      sourceUrl: pageUrl || null,
      attribution: utm,
    }),
  ])

  if (!savedRedis && !savedHilo) {
    console.error('[feed-en-red] LEAD PERDIDO: falló Redis y Hilo')
    return NextResponse.json(
      { error: 'No pudimos registrar tu pedido en este momento. Reintentá en unos segundos o escribinos por WhatsApp.' },
      { status: 502 },
    )
  }
  return NextResponse.json({ ok: true })
}
