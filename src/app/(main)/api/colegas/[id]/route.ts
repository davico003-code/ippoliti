// DELETE /api/colegas/[id] → borrar un colega (requiere X-Team-Code)
// PATCH  /api/colegas/[id] → editar nombre / whatsapp / email (requiere X-Team-Code)
//
// No expongo GET de detalle porque listColegas ya devuelve todos los datos
// y el panel filtra client-side. Si en el futuro se necesita, agregar acá
// con requireTeamCode también.

import { NextResponse } from 'next/server'
import { requireTeamCode } from '@/lib/teamAuth'
import { deleteColega, updateColega } from '@/lib/colega'

interface Ctx {
  params: { id: string }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const block = requireTeamCode(req)
  if (block) return block

  try {
    const ok = await deleteColega(params.id)
    if (!ok) return NextResponse.json({ error: 'Colega no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error borrando colega' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  const block = requireTeamCode(req)
  if (block) return block

  let body: { nombre?: string; whatsapp?: string; email?: string | null } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  try {
    const colega = await updateColega(params.id, body)
    if (!colega) return NextResponse.json({ error: 'Colega no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, colega })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error actualizando colega'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
