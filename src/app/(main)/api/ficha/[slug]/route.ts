// GET    /api/ficha/[slug] → endpoint público que alimenta la página /v/[slug]
//                            de verficha.casa. Devuelve snapshot y suma una
//                            view a las stats (filtrando bots de OG/preview).
//                            Sin auth.
//
// DELETE /api/ficha/[slug] → revoca la ficha (soft-delete). Sin auth.

import { NextResponse } from 'next/server'
import { getFicha, revocarFicha, trackView, isLikelyBot } from '@/lib/ficha'

interface Ctx {
  params: { slug: string }
}

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || ''
  const first = xff.split(',')[0]?.trim()
  if (first) return first
  return req.headers.get('x-real-ip') || 'unknown'
}

export async function GET(req: Request, { params }: Ctx) {
  const slug = (params.slug || '').trim()
  if (!slug) return NextResponse.json({ error: 'slug requerido' }, { status: 400 })

  const ficha = await getFicha(slug)
  if (!ficha) return NextResponse.json({ error: 'Ficha no encontrada' }, { status: 404 })
  if (ficha.revokedAt) return NextResponse.json({ error: 'Ficha revocada' }, { status: 410 })

  if (!isLikelyBot(req.headers.get('user-agent'))) {
    await trackView(slug, getClientIp(req))
  }

  // Devolvemos solo lo necesario para renderizar /v: snapshot y slug.
  // OMITIMOS notas, generadoDesde y propertyId — son trazabilidad interna.
  return NextResponse.json({
    ok: true,
    slug: ficha.slug,
    snapshot: ficha.snapshot,
    expiresAt: ficha.expiresAt,
  })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const slug = (params.slug || '').trim()
  if (!slug) return NextResponse.json({ error: 'slug requerido' }, { status: 400 })

  try {
    const ok = await revocarFicha(slug)
    if (!ok) return NextResponse.json({ error: 'Ficha no encontrada' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error revocando ficha' }, { status: 500 })
  }
}
