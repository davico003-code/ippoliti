// POST /api/audio/generar-audio
//
// Body: { propertyId: number }
// Returns: { ok: true, url: string }
//
// Requiere header x-team-code (validado contra SI_TEAM_CODE). La generación
// quema créditos de ElevenLabs, así que el endpoint quedó restringido al
// panel interno /admin/audio. El front público consume el cache vía
// /api/audio/check (que es público).

import { NextResponse } from 'next/server'
import { generateAudio } from '@/lib/audio'
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
    const url = await generateAudio(propertyId)
    return NextResponse.json({ ok: true, url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error generando audio'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
