// POST /api/ficha/crear → genera una ficha white-label (requiere X-Team-Code)
//
// Body:
//   {
//     propertyId: number,                      // ID de Tokko
//     colegaId?: string,                       // usar colega existente
//     colegaNuevo?: { nombre, whatsapp, email? },
//     guardarColega?: boolean,                 // default true cuando hay colegaNuevo
//     notas?: string,                          // notas internas, no se renderizan
//   }
//
// Devuelve: { ok, slug, url, expiresAt, ficha }

import { NextResponse } from 'next/server'
import { requireTeamCode } from '@/lib/teamAuth'
import { crearColega, getColega, normalizeWhatsapp } from '@/lib/colega'
import { crearFicha } from '@/lib/ficha'

interface Body {
  propertyId?: number | string
  colegaId?: string
  colegaNuevo?: { nombre?: string; whatsapp?: string; email?: string | null }
  guardarColega?: boolean
  notas?: string
}

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || ''
  const first = xff.split(',')[0]?.trim()
  if (first) return first
  return req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: Request) {
  const block = requireTeamCode(req)
  if (block) return block

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

  // Resolver colega: existente por id, o crear/inline desde colegaNuevo.
  let colega: { id: string; nombre: string; whatsapp: string; email: string | null } | null = null

  if (body.colegaId) {
    const existing = await getColega(body.colegaId)
    if (!existing) return NextResponse.json({ error: 'Colega no encontrado' }, { status: 404 })
    colega = {
      id: existing.id,
      nombre: existing.nombre,
      whatsapp: existing.whatsapp,
      email: existing.email,
    }
  } else if (body.colegaNuevo) {
    const nombre = (body.colegaNuevo.nombre || '').trim()
    const whatsapp = normalizeWhatsapp(body.colegaNuevo.whatsapp || '')
    const email = (body.colegaNuevo.email || '').toString().trim() || null
    if (!nombre) return NextResponse.json({ error: 'nombre del colega requerido' }, { status: 400 })
    if (whatsapp.length < 10) return NextResponse.json({ error: 'whatsapp del colega inválido' }, { status: 400 })

    const guardar = body.guardarColega !== false // default true
    if (guardar) {
      const created = await crearColega({ nombre, whatsapp, email })
      colega = { id: created.id, nombre: created.nombre, whatsapp: created.whatsapp, email: created.email }
    } else {
      // Inline, no persiste en redis. id 'temp-...' marca que es one-shot.
      colega = { id: `temp-${Date.now().toString(36)}`, nombre, whatsapp, email }
    }
  } else {
    return NextResponse.json({ error: 'colegaId o colegaNuevo requerido' }, { status: 400 })
  }

  try {
    const result = await crearFicha({
      propertyId,
      colega,
      notas: body.notas || '',
      ip: getClientIp(req),
      userAgent: req.headers.get('user-agent') || 'unknown',
    })
    return NextResponse.json({
      ok: true,
      slug: result.slug,
      url: result.url,
      expiresAt: result.expiresAt,
      ficha: result.ficha,
    }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error creando ficha'
    // Errores típicos: Tokko 404 (propiedad no encontrada) o 403 (rate limit).
    const status = msg.includes('not found') ? 404 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
