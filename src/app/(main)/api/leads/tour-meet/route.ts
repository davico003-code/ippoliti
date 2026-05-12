import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

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

export async function POST(request: NextRequest) {
  let body: TourMeetPayload = {}
  try {
    body = (await request.json()) as TourMeetPayload
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const lead = {
    tipo: 'tour-meet',
    propertyId: body.propertyId ?? null,
    propertyTitle: (body.propertyTitle ?? '').toString().slice(0, 200),
    propertyPrice: (body.propertyPrice ?? '').toString().slice(0, 80),
    propertyUrl: (body.propertyUrl ?? '').toString().slice(0, 400),
    userAgent: (body.userAgent ?? request.headers.get('user-agent') ?? '').toString().slice(0, 300),
    fecha: new Date().toISOString(),
  }

  try {
    const redis = getRedis()
    const ts = Date.now()
    await redis.set(`lead:tour-meet:${ts}:${lead.propertyId ?? 'na'}`, JSON.stringify(lead))
    await redis.lpush('leads:all', JSON.stringify(lead))
  } catch (err) {
    console.error('[leads/tour-meet] Redis error:', err)
  }

  return NextResponse.json({ ok: true })
}
