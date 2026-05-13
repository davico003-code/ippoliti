import { NextResponse, type NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import { getBarrioBySlug } from '@/lib/barrios'

function getRedis(): Redis | null {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
}

interface LeadBody {
  nombre?: string
  email?: string
  whatsapp?: string
  barrios?: string[]
  presupuesto?: string
  mensaje?: string
  origen?: string // ej: "calculadora", "newsletter-barrios", "barrio-{slug}-interesado"
}

export async function POST(request: NextRequest) {
  let body: LeadBody
  try {
    body = (await request.json()) as LeadBody
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const nombre = (body.nombre ?? '').trim()
  const email = (body.email ?? '').trim()
  const whatsapp = (body.whatsapp ?? '').trim()
  const barriosSlugs = (body.barrios ?? []).filter(Boolean)
  const presupuesto = (body.presupuesto ?? '').trim()
  const mensaje = (body.mensaje ?? '').trim()
  const origen = (body.origen ?? 'barrios-privados').trim()

  if (!nombre || nombre.length < 3) {
    return NextResponse.json({ error: 'Nombre mínimo 3 caracteres' }, { status: 400 })
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  const barriosValidos = barriosSlugs
    .map((slug) => getBarrioBySlug(slug))
    .filter((b): b is NonNullable<typeof b> => Boolean(b))

  const ts = Date.now()
  const fecha = new Date().toISOString()
  const leadData = {
    nombre,
    email,
    whatsapp,
    barrios: barriosValidos.map((b) => ({ slug: b.slug, nombre: b.nombre })),
    presupuesto,
    mensaje,
    origen,
    fecha,
  }

  const redis = getRedis()
  if (redis) {
    try {
      const key = `lead:barrios:${ts}:${email}`
      await redis.set(key, JSON.stringify(leadData))
      await redis.lpush('leads:all', JSON.stringify(leadData))
      await redis.lpush('leads:barrios', JSON.stringify(leadData))
    } catch (err) {
      console.error('[api/barrios/lead] Redis error:', err)
    }
  }

  const apiKey = process.env.TOKKO_API_KEY
  if (apiKey) {
    try {
      const tags = [
        'lead-web',
        'barrios-privados',
        origen,
        ...barriosValidos.map((b) => `barrio-${b.slug}-interesado`),
      ].filter(Boolean)

      const summary = barriosValidos.length
        ? `Interesado en: ${barriosValidos.map((b) => b.nombre).join(', ')}`
        : 'Sin barrios específicos'

      const tokkoPayload = {
        name: nombre,
        email,
        phone: whatsapp ? `+54${whatsapp.replace(/\D/g, '')}` : '',
        message: `${summary}. Presupuesto: ${presupuesto || 'sin definir'}. ${mensaje}`.trim(),
        source: 'Web — Barrios Privados',
        tags,
      }

      await fetch(
        `https://www.tokkobroker.com/api/v1/contact/?key=${apiKey}&format=json`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tokkoPayload),
        },
      )
    } catch (err) {
      console.warn('[api/barrios/lead] Tokko CRM error:', err)
    }
  }

  return NextResponse.json({ ok: true, fecha })
}
