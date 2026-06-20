// POST /api/feedback/alert
//
// "Avisame si baja": captura de lead anónimo (sin login). Guarda contacto +
// canal en `feedback:property:{id}:alert` (LIST). Es PII — NUNCA se devuelve
// ni se loguea el contacto. Sólo se lee desde el endpoint admin protegido.
//
// Body: { propertyId: number, contacto: string, canal: 'whatsapp'|'email',
//         valuacion?: number }

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
  ALERT_CANALES,
  FB_TTL,
  type AlertCanal,
} from '@/lib/feedback'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ALERTS_CAP = 1000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizarContacto(canal: AlertCanal, raw: string): string | null {
  const v = raw.trim()
  if (!v || v.length > 120) return null
  if (canal === 'email') {
    return EMAIL_RE.test(v) ? v.toLowerCase() : null
  }
  // whatsapp: dígitos (+ opcional). Entre 8 y 15 dígitos.
  const digits = v.replace(/[^\d]/g, '')
  if (digits.length < 8 || digits.length > 15) return null
  return v.startsWith('+') ? `+${digits}` : digits
}

export async function POST(req: Request) {
  // Rate-limit más estricto: es captura de lead, no una reacción.
  if (!(await rateLimit(getIp(req), 'alert', 5))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  let body: { propertyId?: unknown; contacto?: unknown; canal?: unknown; valuacion?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const propertyId = parsePropertyId(body.propertyId)
  const canal = body.canal as AlertCanal
  const rawContacto = typeof body.contacto === 'string' ? body.contacto : ''
  if (!propertyId || !ALERT_CANALES.includes(canal)) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const contacto = normalizarContacto(canal, rawContacto)
  if (!contacto) {
    return NextResponse.json({ error: 'invalid_contacto' }, { status: 400 })
  }

  const valuacion =
    typeof body.valuacion === 'number' && Number.isFinite(body.valuacion) ? body.valuacion : null

  const { vid, isNew } = ensureVid()
  try {
    const key = `${fbKey(propertyId)}:alert`
    await redis.lpush(key, JSON.stringify({ contacto, canal, valuacion, vid, ts: Date.now() }))
    await redis.ltrim(key, 0, ALERTS_CAP - 1)
    await redis.expire(key, FB_TTL)
    await indexProperty(propertyId)
  } catch {
    /* fire-and-forget */
  }

  // Nunca devolvemos el contacto (PII).
  const res = NextResponse.json({ ok: true })
  if (isNew) setVidCookie(res, vid)
  return res
}
