// POST /api/colegas → crear colega (requiere X-Team-Code)
// GET  /api/colegas → listar todos los colegas guardados (requiere X-Team-Code)

import { NextResponse } from 'next/server'
import { requireTeamCode } from '@/lib/teamAuth'
import { crearColega, listColegas } from '@/lib/colega'

export async function POST(req: Request) {
  const block = requireTeamCode(req)
  if (block) return block

  let body: { nombre?: string; whatsapp?: string; email?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  try {
    const colega = await crearColega({
      nombre: body.nombre || '',
      whatsapp: body.whatsapp || '',
      email: body.email ?? null,
    })
    return NextResponse.json({ ok: true, colega }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error creando colega'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export async function GET(req: Request) {
  const block = requireTeamCode(req)
  if (block) return block

  try {
    const colegas = await listColegas()
    return NextResponse.json({ ok: true, colegas })
  } catch {
    return NextResponse.json({ error: 'Error listando colegas' }, { status: 500 })
  }
}
