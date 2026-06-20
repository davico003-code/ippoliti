// POST /api/feedback/valuation
//
// Slider de valuación + chips de objeción. Auto-guarda en cada cambio. El
// valor (lo que el visitante considera "precio justo") se guarda por vid en
// `feedback:property:{id}:valuation` (HASH vid→número). Las objeciones llevan
// contadores `feedback:property:{id}:objection:{choice}` con dedupe por vid.
// AGREGADO 100% PRIVADO — nunca se muestra al público.
//
// Body: { propertyId: number, valor: number, objeciones?: string[] }

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
  OBJECTION_CHOICES,
  FB_TTL,
  type ObjectionChoice,
} from '@/lib/feedback'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  if (!(await rateLimit(getIp(req), 'valuation', 60))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  let body: { propertyId?: unknown; valor?: unknown; objeciones?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const propertyId = parsePropertyId(body.propertyId)
  const valor = typeof body.valor === 'number' && Number.isFinite(body.valor) ? body.valor : null
  if (!propertyId || valor == null || valor < 0) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const objeciones = Array.isArray(body.objeciones)
    ? (body.objeciones.filter(
        (o): o is ObjectionChoice =>
          typeof o === 'string' && OBJECTION_CHOICES.includes(o as ObjectionChoice),
      ))
    : null

  const { vid, isNew } = ensureVid()
  try {
    const base = fbKey(propertyId)

    // Valor de valuación (overwrite por vid).
    await redis.hset(`${base}:valuation`, { [vid]: valor })
    await redis.expire(`${base}:valuation`, FB_TTL)

    // Objeciones: diff contra lo previo para mantener contadores sin doble conteo.
    if (objeciones != null) {
      const vidObjKey = `${base}:objectionvid`
      const prevRaw = await redis.hget<string>(vidObjKey, vid)
      let prev: string[] = []
      if (prevRaw) {
        try {
          const parsed = typeof prevRaw === 'string' ? JSON.parse(prevRaw) : prevRaw
          if (Array.isArray(parsed)) prev = parsed.filter((x) => typeof x === 'string')
        } catch {
          /* ignore */
        }
      }

      const added = objeciones.filter((o) => !prev.includes(o))
      const removed = prev.filter((o) => !objeciones.includes(o as ObjectionChoice))

      for (const o of added) {
        const n = await redis.incr(`${base}:objection:${o}`)
        if (n === 1) await redis.expire(`${base}:objection:${o}`, FB_TTL)
      }
      for (const o of removed) {
        const n = await redis.decr(`${base}:objection:${o}`)
        if (n < 0) await redis.set(`${base}:objection:${o}`, 0)
      }

      await redis.hset(vidObjKey, { [vid]: JSON.stringify(objeciones) })
      await redis.expire(vidObjKey, FB_TTL)
    }
    await indexProperty(propertyId)
  } catch {
    /* fire-and-forget */
  }

  const res = NextResponse.json({ ok: true })
  if (isNew) setVidCookie(res, vid)
  return res
}
