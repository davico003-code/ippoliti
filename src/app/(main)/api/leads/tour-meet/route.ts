import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { rateLimit } from '@/lib/feedback'

// Mismo tope que /api/leads: leads:all es el panel de respaldo y no puede crecer para siempre.
const TOPE_LEADS_ALL = 4999

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })
}

interface TourMeetPayload {
  propertyId?: number
  propertyTitle?: string
  propertyPrice?: string
  propertyUrl?: string
  userAgent?: string
}

// Es un clic hacia WhatsApp, sin nombre ni teléfono: queda solo como rastro en
// Redis y NO va a Hilo (serían consultas anónimas en el inbox). Con el mismo
// rate limit que /api/leads y sin propiedad no se guarda nada: antes un loop de
// POST {} enterraba los leads reales del panel de respaldo.
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'tour-meet', 6, 60))) {
    return NextResponse.json({ error: 'Demasiados envíos seguidos. Esperá un momento y reintentá.' }, { status: 429 })
  }

  let body: TourMeetPayload = {}
  try {
    body = (await request.json()) as TourMeetPayload
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const propertyId = Number(body.propertyId)
  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    return NextResponse.json({ error: 'Falta la propiedad.' }, { status: 400 })
  }

  const lead = {
    tipo: 'tour-meet',
    propertyId,
    propertyTitle: (body.propertyTitle ?? '').toString().slice(0, 200),
    propertyPrice: (body.propertyPrice ?? '').toString().slice(0, 80),
    propertyUrl: (body.propertyUrl ?? '').toString().slice(0, 400),
    userAgent: (body.userAgent ?? request.headers.get('user-agent') ?? '').toString().slice(0, 300),
    fecha: new Date().toISOString(),
  }

  try {
    const redis = getRedis()
    const ts = Date.now()
    await redis.set(`lead:tour-meet:${ts}:${lead.propertyId}`, JSON.stringify(lead))
    await redis.lpush('leads:all', JSON.stringify(lead))
    await redis.ltrim('leads:all', 0, TOPE_LEADS_ALL)
  } catch (err) {
    console.error('[leads/tour-meet] Redis error:', err)
  }

  return NextResponse.json({ ok: true })
}
