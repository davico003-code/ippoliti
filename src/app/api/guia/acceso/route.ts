import { SignJWT } from 'jose'
import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

const SECRET = new TextEncoder().encode(process.env.AGENT_JWT_SECRET ?? 'si-secret-2026')
const COOKIE_NAME = 'si_guia_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 365 días

export interface GuiaRegistro {
  nombre: string
  email: string
  whatsapp: string | null
  fecha: string
  ip: string | null
  userAgent: string | null
}

export async function POST(req: Request) {
  let body: { nombre?: string; email?: string; whatsapp?: string | null; website?: string; _start?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // Anti-spam honeypot: bots suelen rellenar todos los campos. Si `website`
  // viene con valor, asumimos bot y devolvemos 200 silencioso (no persistimos).
  if (body.website) {
    return NextResponse.json({ ok: true })
  }
  // Anti-spam timing: si el form se "envía" en < 1500ms desde que se montó,
  // es casi seguro un bot. Aceptamos pero no persistimos.
  if (typeof body._start === 'number' && Date.now() - body._start < 1500) {
    return NextResponse.json({ ok: true })
  }

  const nombre = (body.nombre ?? '').trim()
  const email = (body.email ?? '').trim()
  const whatsapp = (body.whatsapp ?? '').trim() || null

  if (!nombre || nombre.length < 2) {
    return NextResponse.json({ error: 'Nombre debe tener al menos 2 caracteres' }, { status: 400 })
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }
  if (whatsapp && !/^[+\d\s()-]{7,20}$/.test(whatsapp)) {
    return NextResponse.json({ error: 'WhatsApp inválido' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? null
  const userAgent = req.headers.get('user-agent') ?? null
  const registro: GuiaRegistro = {
    nombre,
    email,
    whatsapp,
    fecha: new Date().toISOString(),
    ip,
    userAgent,
  }

  // Persistir en Upstash Redis (misma infra que /api/leads)
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const redis = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
      const ts = Date.now()
      await redis.set(`guia:registro:${ts}:${email}`, JSON.stringify(registro))
      await redis.lpush('guia:registros:all', JSON.stringify(registro))
    } else {
      console.warn('[guia/acceso] Redis no configurado — registro sin persistir')
    }
  } catch (err) {
    console.error('[guia/acceso] Error guardando en Redis:', err)
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
