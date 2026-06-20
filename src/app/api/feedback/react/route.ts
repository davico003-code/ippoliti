// POST /api/feedback/react
//
// Reacción de 4 caritas (😍 encanta · 🤔 duda · 💸 cara · 🙈 no) en la ficha.
// Un voto por visitante (dedupe por vid); cambiar de carita mueve el conteo.
// Contadores `feedback:property:{id}:react:{choice}` — agregado PRIVADO.
//
// Body: { propertyId: number, choice: 'encanta'|'duda'|'cara'|'no' }

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import {
  ensureVid,
  setVidCookie,
  fbKey,
  parsePropertyId,
  getIp,
  rateLimit,
  indexProperty,
  REACT_CHOICES,
  FB_TTL,
  type ReactChoice,
} from '@/lib/feedback'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  if (!(await rateLimit(getIp(req), 'react', 40))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  let body: { propertyId?: unknown; choice?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const propertyId = parsePropertyId(body.propertyId)
  const choice = body.choice as ReactChoice
  if (!propertyId || !REACT_CHOICES.includes(choice)) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const { vid, isNew } = ensureVid()
  try {
    const base = fbKey(propertyId)
    const vidKey = `${base}:reactvid`
    const prev = await redis.hget<string>(vidKey, vid)

    if (prev !== choice) {
      await redis.hset(vidKey, { [vid]: choice })
      await redis.expire(vidKey, FB_TTL)

      const inc = await redis.incr(`${base}:react:${choice}`)
      if (inc === 1) await redis.expire(`${base}:react:${choice}`, FB_TTL)

      if (prev && REACT_CHOICES.includes(prev as ReactChoice)) {
        const dec = await redis.decr(`${base}:react:${prev}`)
        if (dec < 0) await redis.set(`${base}:react:${prev}`, 0)
      }
    }
    await indexProperty(propertyId)
  } catch {
    /* fire-and-forget */
  }

  const res = NextResponse.json({ ok: true, choice })
  if (isNew) setVidCookie(res, vid)
  return res
}
