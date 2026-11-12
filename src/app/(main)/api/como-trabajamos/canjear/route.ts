// POST /api/como-trabajamos/canjear — canjea un link de un solo uso de la
// presentación y deja la cookie de acceso en ese dispositivo. Es POST (desde
// el botón "Ver presentación") para que las vistas previas de WhatsApp y los
// bots, que hacen GET, no quemen el link.
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { COOKIE_ACCESO, DURACION_SESION_S, canjearLink, tokenDeSesion } from '@/lib/como-trabajamos-acceso'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const origen = new URL(req.url).origin
  const form = await req.formData().catch(() => null)
  const token = String(form?.get('k') ?? '')
  // Doble toque en "Ver presentación": si este dispositivo ya canjeó este
  // mismo link, lo dejamos pasar en vez de mostrar "ya fue abierto".
  if (token && (await tokenDeSesion(cookies().get(COOKIE_ACCESO)?.value)) === token) {
    return NextResponse.redirect(new URL('/como-trabajamos', origen), 303)
  }
  const res = await canjearLink(token).catch(() => null)
  if (!res) {
    return NextResponse.redirect(new URL(`/como-trabajamos?k=${encodeURIComponent(token)}&e=1`, origen), 303)
  }
  if (!res.ok) {
    return NextResponse.redirect(new URL(`/como-trabajamos?k=${encodeURIComponent(token)}`, origen), 303)
  }
  const out = NextResponse.redirect(new URL('/como-trabajamos', origen), 303)
  out.cookies.set(COOKIE_ACCESO, res.jwt, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: DURACION_SESION_S,
  })
  return out
}
