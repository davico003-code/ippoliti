// GET    /api/ficha/[slug] → endpoint público que alimenta la página /v/[slug]
//                            de verficha.casa. Devuelve snapshot + colega y
//                            suma una view a las stats (filtrando bots de OG).
//                            Sin auth.
//
// DELETE /api/ficha/[slug] → revoca la ficha (soft-delete). Requiere X-Team-Code.

import { NextResponse } from 'next/server'
import { requireTeamCode } from '@/lib/teamAuth'
import { getFicha, revocarFicha, trackView } from '@/lib/ficha'

interface Ctx {
  params: { slug: string }
}

const BOT_UA_RE = /(bot|crawler|spider|slurp|facebookexternalhit|whatsapp|preview|telegram|skype|linkedin|embed|fetch)/i

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

  // Tracking — saltear bots de OG/preview (Facebook, WhatsApp, Telegram, etc).
  // Esto evita inflar views con crawlers de previews al pegar el link.
  const ua = req.headers.get('user-agent') || ''
  if (!BOT_UA_RE.test(ua)) {
    await trackView(slug, getClientIp(req))
  }

  // Devolvemos solo lo necesario para renderizar /v: snapshot, colega y slug.
  // OMITIMOS notas, generadoDesde y propertyId — son trazabilidad interna.
  return NextResponse.json({
    ok: true,
    slug: ficha.slug,
    snapshot: ficha.snapshot,
    colega: ficha.colega,
    expiresAt: ficha.expiresAt,
  })
}

export async function DELETE(req: Request, { params }: Ctx) {
  const block = requireTeamCode(req)
  if (block) return block

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
