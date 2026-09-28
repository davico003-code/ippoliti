// POST /api/autorizaciones/admin   valida la clave de eliminación (team-code + delete_code)
//
// No borra nada: sólo confirma que la clave es correcta para que el panel
// active el modo administrador (botones de borrar en la lista).

import { NextResponse } from 'next/server'
import { assertTeamCode } from '@/lib/team-auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  const expected = process.env.SI_DELETE_CODE
  if (!expected) {
    return NextResponse.json(
      { error: 'SI_DELETE_CODE no configurada en el server' },
      { status: 500 },
    )
  }

  let body: { delete_code?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const provided = (body.delete_code || '').trim()
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: 'Clave incorrecta' }, { status: 403 })
  }
  return NextResponse.json({ ok: true })
}
