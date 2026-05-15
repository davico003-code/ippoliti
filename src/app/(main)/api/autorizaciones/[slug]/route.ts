// GET    /api/autorizaciones/[slug]   detalle  (team-code)
// PATCH  /api/autorizaciones/[slug]   editar campos internos (team-code)
// DELETE /api/autorizaciones/[slug]   eliminar (team-code + delete_code)

import { NextResponse } from 'next/server'
import { assertTeamCode } from '@/lib/team-auth'
import {
  actualizarAutorizacion,
  eliminarAutorizacion,
  getAutorizacion,
  type UpdateInput,
} from '@/lib/autorizaciones'

export const dynamic = 'force-dynamic'

const SLUG_RE = /^[a-z0-9]{10}$/

function badSlug() {
  return NextResponse.json({ error: 'Slug inválido' }, { status: 400 })
}

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  const slug = params.slug
  if (!slug || !SLUG_RE.test(slug)) return badSlug()

  const auth = await getAutorizacion(slug)
  if (!auth) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  return NextResponse.json({ ok: true, item: auth })
}

// ── PATCH ───────────────────────────────────────────────────────────────────

interface PatchBody {
  precio_venta_usd?: number | null | ''
  notas_internas?: string | null
  expires_at?: string
}

function validatePatch(body: PatchBody): { ok: true; data: UpdateInput } | { ok: false; error: string } {
  const out: UpdateInput = {}

  if (body.precio_venta_usd !== undefined) {
    if (body.precio_venta_usd === null || body.precio_venta_usd === '') {
      out.precio_venta_usd = null
    } else {
      const n = Number(body.precio_venta_usd)
      if (!Number.isFinite(n) || n < 0) {
        return { ok: false, error: 'precio_venta_usd inválido' }
      }
      out.precio_venta_usd = n
    }
  }
  if (body.notas_internas !== undefined) {
    if (body.notas_internas === null) {
      out.notas_internas = null
    } else if (typeof body.notas_internas === 'string') {
      out.notas_internas = body.notas_internas
    } else {
      return { ok: false, error: 'notas_internas inválido' }
    }
  }
  if (body.expires_at !== undefined) {
    if (typeof body.expires_at !== 'string') {
      return { ok: false, error: 'expires_at inválido' }
    }
    const t = new Date(body.expires_at).getTime()
    if (!Number.isFinite(t)) return { ok: false, error: 'expires_at no es una fecha válida' }
    out.expires_at = body.expires_at
  }
  return { ok: true, data: out }
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  const slug = params.slug
  if (!slug || !SLUG_RE.test(slug)) return badSlug()

  let body: PatchBody = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const v = validatePatch(body)
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  try {
    const updated = await actualizarAutorizacion(slug, v.data)
    if (!updated) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    return NextResponse.json({ ok: true, item: updated })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error actualizando'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ── DELETE ──────────────────────────────────────────────────────────────────

interface DeleteBody {
  delete_code?: string
}

export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  const slug = params.slug
  if (!slug || !SLUG_RE.test(slug)) return badSlug()

  const expected = process.env.SI_DELETE_CODE
  if (!expected) {
    return NextResponse.json(
      { error: 'SI_DELETE_CODE no configurada en el server' },
      { status: 500 },
    )
  }

  let body: DeleteBody = {}
  try {
    body = await req.json()
  } catch {
    // Body opcional para DELETE — pero acá lo necesitamos
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const provided = (body.delete_code || '').trim()
  if (!provided) {
    return NextResponse.json({ error: 'Falta la clave de eliminación' }, { status: 400 })
  }
  if (provided !== expected) {
    return NextResponse.json({ error: 'Clave incorrecta' }, { status: 403 })
  }

  try {
    const existed = await eliminarAutorizacion(slug)
    if (!existed) {
      return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error eliminando'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
