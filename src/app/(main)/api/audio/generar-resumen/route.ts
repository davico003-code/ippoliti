// POST /api/audio/generar-resumen
//
// Body: { propertyId: number }
// Returns: { ok: true, text: string }
//
// Requiere header x-team-code (validado contra SI_TEAM_CODE). Endpoint chico
// que sirve para debugging / preview en /admin/audio — el flujo principal usa
// /api/audio/generar-audio que ya incluye el resumen.

import { NextResponse } from 'next/server'
import { generateResumen } from '@/lib/audio'
import { assertTeamCode } from '@/lib/team-auth'

export const maxDuration = 60

export async function POST(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  let body: { propertyId?: number | string } = {}
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
    const text = await generateResumen(propertyId)
    return NextResponse.json({ ok: true, text })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error generando resumen'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
