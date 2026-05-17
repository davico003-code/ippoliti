// GET    /api/visitas/[id]  detalle (team-code)
// PATCH  /api/visitas/[id]  cambiar status + notas_internas (team-code)
// DELETE /api/visitas/[id]  eliminar (team-code + delete_code)

import { NextResponse } from 'next/server'
import { assertTeamCode } from '@/lib/team-auth'
import {
  actualizarVisita,
  eliminarVisita,
  getVisita,
  type UpdateVisitaInput,
  type VisitaStatus,
} from '@/lib/visitas'

export const dynamic = 'force-dynamic'

const ID_RE = /^[A-Za-z0-9_-]{6,32}$/  // nanoid alfabeto + tamaños razonables
const STATUSES: VisitaStatus[] = ['pendiente', 'confirmada', 'realizada', 'cancelada']

function badId() {
  return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  if (!params.id || !ID_RE.test(params.id)) return badId()

  const visita = await getVisita(params.id)
  if (!visita) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  return NextResponse.json({ ok: true, item: visita })
}

// ── PATCH ───────────────────────────────────────────────────────────────────

interface PatchBody {
  status?: VisitaStatus
  notas_internas?: string | null
}

function validatePatch(body: PatchBody): { ok: true; data: UpdateVisitaInput } | { ok: false; error: string } {
  const out: UpdateVisitaInput = {}
  if (body.status !== undefined) {
    if (!(STATUSES as readonly string[]).includes(body.status)) {
      return { ok: false, error: 'status inválido' }
    }
    out.status = body.status
  }
  if (body.notas_internas !== undefined) {
    if (body.notas_internas === null) {
      out.notas_internas = null
    } else if (typeof body.notas_internas === 'string') {
      out.notas_internas = body.notas_internas.slice(0, 2000)
    } else {
      return { ok: false, error: 'notas_internas inválido' }
    }
  }
  return { ok: true, data: out }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  if (!params.id || !ID_RE.test(params.id)) return badId()

  let body: PatchBody = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const v = validatePatch(body)
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  try {
    const updated = await actualizarVisita(params.id, v.data)
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  if (!params.id || !ID_RE.test(params.id)) return badId()

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
    const existed = await eliminarVisita(params.id)
    if (!existed) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error eliminando'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
