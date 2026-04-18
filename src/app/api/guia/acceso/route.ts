import { SignJWT } from 'jose'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SECRET = new TextEncoder().encode(process.env.AGENT_JWT_SECRET ?? 'si-secret-2026')
const COOKIE_NAME = 'si_guia_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 365 días

export async function POST(req: Request) {
  let body: { nombre?: string; email?: string; whatsapp?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const nombre = (body.nombre ?? '').trim()
  const email = (body.email ?? '').trim()
  const whatsapp = (body.whatsapp ?? '').trim() || null

  if (!nombre || !email) {
    return NextResponse.json({ error: 'Nombre y email son obligatorios' }, { status: 400 })
  }

  // Crear lead en Tokko (best-effort, no bloquea el acceso)
  try {
    const apiKey = process.env.TOKKO_API_KEY
    if (apiKey) {
      await fetch('https://www.tokkobroker.com/api/v1/lead/?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nombre,
          email: email,
          phone: whatsapp ? `+54${whatsapp.replace(/\D/g, '')}` : '',
          tags: ['guia-2026'],
          notes: 'Lead desde Guía del Comprador 2026 — siinmobiliaria.com',
        }),
      })
    }
  } catch (err) {
    console.warn('[guia/acceso] Error creando lead en Tokko:', err)
  }

  // Generar JWT
  const token = await new SignJWT({ nombre, email, tipo: 'guia' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('365d')
    .sign(SECRET)

  // Setear cookie
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  return res
}
