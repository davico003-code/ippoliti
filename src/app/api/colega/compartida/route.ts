// POST /api/colega/compartida
//
// Cuenta un toque en "Compartir" (copiar link / WhatsApp) dentro de la ficha
// white-label de verficha.casa: el colega que la recibió se la reenvía a su
// cliente. Anónimo: no guarda quién comparte, solo suma al contador del slug
// (ficha:{slug}:compartida), que Hilo muestra en la tarjeta "Feedback" de la
// propiedad. Público, sin auth; dedupe por IP (10 min) en trackShare.

import { NextResponse } from 'next/server'
import { getFicha, trackShare } from '@/lib/ficha'
import { rateLimit } from '@/lib/feedback'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(req: Request) {
  let body: { slug?: unknown } = {}
  try {
    // sendBeacon manda text/plain: se parsea el texto a mano.
    body = JSON.parse(await req.text())
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  if (!slug || slug.length > 32 || !/^[A-Za-z0-9_-]+$/.test(slug)) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const ip = getIp(req)
  if (!(await rateLimit(ip, 'ficha-compartida', 20, 60))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  try {
    const ficha = await getFicha(slug)
    if (!ficha || ficha.revokedAt) return NextResponse.json({ error: 'no_existe' }, { status: 404 })
    const contado = await trackShare(slug, ip)
    return NextResponse.json({ ok: true, contado })
  } catch {
    return NextResponse.json({ error: 'redis_error' }, { status: 500 })
  }
}
