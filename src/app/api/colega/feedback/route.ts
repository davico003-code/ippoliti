// POST /api/colega/feedback
//
// Feedback anónimo de colegas sobre una propiedad vista en la ficha white-label
// (verficha.casa). NO recibe ni guarda nombre/teléfono ni dato del colega.
//
// Body: { slug: string, choice: 'gusta' | 'podria' | 'no_gusta' }
// El propertyId se deduce del slug (Redis ficha:{slug}); los contadores se
// agregan por propertyId para que sean estables aunque haya múltiples fichas.
//
// Anti-spam: rate limit por IP (10/min) y, si llega x-fingerprint, 1 voto cada
// 24h por fingerprint+propertyId. Público, sin auth.

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { getFicha } from '@/lib/ficha'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const CHOICES = ['gusta', 'podria', 'no_gusta'] as const
type Choice = (typeof CHOICES)[number]

const TTL_YEAR = 365 * 86400 // segundos
const IP_LIMIT = 10 // votos
const IP_WINDOW = 60 // segundos
const FP_WINDOW = 86400 // 24h en segundos
const EVENTS_CAP = 500

function getIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(req: Request) {
  // ── Parse + validación del body ──────────────────────────────────────────
  let body: { slug?: unknown; choice?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  const choice = body.choice as Choice
  if (!slug || !CHOICES.includes(choice)) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  // ── Rate limit por IP (10/min) ───────────────────────────────────────────
  const ip = getIp(req)
  try {
    const ipKey = `feedback:rl:ip:${ip}`
    const ipCount = await redis.incr(ipKey)
    if (ipCount === 1) await redis.expire(ipKey, IP_WINDOW)
    if (ipCount > IP_LIMIT) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
  } catch {
    // si Redis falla en el rate limit, no bloqueamos el flujo principal
  }

  // ── Resolver slug → propertyId ───────────────────────────────────────────
  const ficha = await getFicha(slug)
  if (!ficha) {
    return NextResponse.json({ error: 'ficha_no_encontrada' }, { status: 404 })
  }
  const propertyId = ficha.propertyId

  // ── Rate limit por fingerprint+propertyId (1 voto / 24h), si viene ───────
  const fingerprint = req.headers.get('x-fingerprint')?.trim()
  if (fingerprint) {
    const fpKey = `feedback:rl:fp:${fingerprint}:${propertyId}`
    const set = await redis.set(fpKey, choice, { nx: true, ex: FP_WINDOW })
    if (set === null) {
      return NextResponse.json({ error: 'already_voted' }, { status: 429 })
    }
  }

  // ── Persistir contadores + evento (TTL 365d) ─────────────────────────────
  const base = `feedback:property:${propertyId}`
  const totalKey = `${base}:total`
  const choiceKey = `${base}:${choice}`
  const eventosKey = `${base}:eventos`

  const total = await redis.incr(totalKey)
  if (total === 1) await redis.expire(totalKey, TTL_YEAR)

  const choiceTotal = await redis.incr(choiceKey)
  if (choiceTotal === 1) await redis.expire(choiceKey, TTL_YEAR)

  await redis.lpush(eventosKey, JSON.stringify({ choice, slug, ts: Date.now() }))
  await redis.ltrim(eventosKey, 0, EVENTS_CAP - 1)
  await redis.expire(eventosKey, TTL_YEAR)

  return NextResponse.json({ ok: true })
}
