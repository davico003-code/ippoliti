// POST /api/feedback/like
//
// Toggle del "me gusta" anónimo sobre una propiedad. Agrega o saca el vid del
// SET `feedback:property:{id}:like`. El conteo (SCARD) es PRIVADO — nunca se
// expone acá; sólo el estado booleano de ESTE visitante.
//
// Body: { propertyId: number }

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import {
  ensureVid,
  setVidCookie,
  fbKey,
  parsePropertyId,
  getIp,
  rateLimit,
  FB_TTL,
} from '@/lib/feedback'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  if (!(await rateLimit(getIp(req), 'like', 40))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  let body: { propertyId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const propertyId = parsePropertyId(body.propertyId)
  if (!propertyId) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const { vid, isNew } = ensureVid()
  let liked = false
  try {
    const key = `${fbKey(propertyId)}:like`
    const member = await redis.sismember(key, vid)
    if (member === 1) {
      await redis.srem(key, vid)
      liked = false
    } else {
      await redis.sadd(key, vid)
      await redis.expire(key, FB_TTL)
      liked = true
    }
  } catch {
    /* fire-and-forget: si Redis falla, no rompemos la UX */
  }

  const res = NextResponse.json({ ok: true, liked })
  if (isNew) setVidCookie(res, vid)
  return res
}
