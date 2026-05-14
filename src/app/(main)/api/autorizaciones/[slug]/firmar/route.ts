// POST /api/autorizaciones/[slug]/firmar
//
// Pública (sin team code: el slug es el secreto que David compartió por WA).
// Valida campos, captura IP + user agent, marca firmada en Redis, llama a
// notifyAgent (stub con TODO de email).
//
// Devuelve { ok: true, redirect } para que el client haga router.push.

import { NextResponse } from 'next/server'
import {
  getAutorizacion,
  marcarFirmada,
  notifyAgent,
  type Signer,
} from '@/lib/autorizaciones'

interface Body {
  nombre?: string
  dni?: string
  domicilio?: string
  email?: string
  firma_base64?: string
  acepto?: boolean
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || ''
  const first = xff.split(',')[0]?.trim()
  if (first) return first
  return req.headers.get('x-real-ip') || 'unknown'
}

function validate(b: Body): { ok: true; data: Omit<Signer, 'ip' | 'user_agent'> } | { ok: false; error: string } {
  const nombre = (b.nombre || '').trim()
  if (nombre.length < 5 || !/\s/.test(nombre)) {
    return { ok: false, error: 'Ingresá nombre y apellido (mínimo 5 caracteres)' }
  }
  const dni = (b.dni || '').trim()
  if (!/^\d{7,9}$/.test(dni)) {
    return { ok: false, error: 'El DNI debe tener entre 7 y 9 dígitos' }
  }
  const domicilio = (b.domicilio || '').trim()
  if (domicilio.length < 8) {
    return { ok: false, error: 'Ingresá tu domicilio completo' }
  }
  const email = (b.email || '').trim()
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'Email inválido' }
  }
  const firma = (b.firma_base64 || '').trim()
  if (!firma.startsWith('data:image/png') || firma.length < 200) {
    return { ok: false, error: 'Firma vacía o inválida' }
  }
  if (!b.acepto) {
    return { ok: false, error: 'Debés aceptar el contenido de la autorización' }
  }
  return {
    ok: true,
    data: { nombre, dni, domicilio, email, firma_base64: firma },
  }
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug
  if (!slug || !/^[a-z0-9]{10}$/.test(slug)) {
    return NextResponse.json({ error: 'Slug inválido' }, { status: 400 })
  }

  let body: Body = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const v = validate(body)
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const auth = await getAutorizacion(slug)
  if (!auth) return NextResponse.json({ error: 'Autorización no encontrada' }, { status: 404 })
  if (auth.status === 'firmada') {
    return NextResponse.json(
      { ok: true, redirect: `/autorizacion/${slug}/firmada` },
      { status: 200 },
    )
  }
  if (auth.status === 'expirada') {
    return NextResponse.json({ error: 'Esta autorización está expirada' }, { status: 410 })
  }

  const signer: Signer = {
    ...v.data,
    ip: getClientIp(req),
    user_agent: req.headers.get('user-agent') || 'unknown',
  }

  try {
    const updated = await marcarFirmada(slug, signer)
    if (!updated) {
      return NextResponse.json({ error: 'No se pudo guardar la firma' }, { status: 500 })
    }
    try {
      notifyAgent(updated)
    } catch (e) {
      console.error('notifyAgent failed:', e)
    }
    return NextResponse.json(
      { ok: true, redirect: `/autorizacion/${slug}/firmada` },
      { status: 200 },
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error guardando firma'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
