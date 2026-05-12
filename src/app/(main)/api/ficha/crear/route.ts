// POST /api/ficha/crear → genera una ficha white-label anónima.
//
// Sin auth (acceso abierto). Sin colega: el link no muestra contacto.
//
// Body: { propertyId: number, notas?: string }
// Captura IP + UA en generadoDesde para forense interno (detectar abuso).
// Devuelve: { ok, slug, url, expiresAt }

import { NextResponse } from 'next/server'
import { crearFicha } from '@/lib/ficha'

interface Body {
  propertyId?: number | string
  notas?: string
}

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || ''
  const first = xff.split(',')[0]?.trim()
  if (first) return first
  return req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: Request) {
  let body: Body = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const propertyId = Number(body.propertyId)
  if (!propertyId || Number.isNaN(propertyId)) {
    return NextResponse.json({ error: 'propertyId requerido' }, { status: 400 })
  }

  try {
    const result = await crearFicha({
      propertyId,
      notas: body.notas || '',
      ip: getClientIp(req),
      userAgent: req.headers.get('user-agent') || 'unknown',
    })
    return NextResponse.json(
      {
        ok: true,
        slug: result.slug,
        url: result.url,
        expiresAt: result.expiresAt,
      },
      { status: 201 },
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error creando ficha'
    const status = msg.includes('not found') ? 404 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
