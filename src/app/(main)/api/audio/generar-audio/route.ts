// POST /api/audio/generar-audio
//
// Body: { propertyId: number, regenerate?: boolean }
// Returns: { ok: true, url: string, text: string, meta: AudioMeta }
//
// Requiere header x-team-code (validado contra SI_TEAM_CODE). La generación
// quema créditos de ElevenLabs, así que el endpoint quedó restringido al
// panel interno /admin/audio. El front público consume el cache vía
// /api/audio/check (que es público).
//
// `regenerate: true` pisa el cache (la URL del cache queda obsoleta).

import { NextResponse } from 'next/server'
import { generateAudio } from '@/lib/audio'
import { assertTeamCode } from '@/lib/team-auth'

export const maxDuration = 60

export async function POST(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  let body: { propertyId?: number | string; regenerate?: boolean } = {}
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
    const result = await generateAudio(propertyId, { regenerate: body.regenerate === true })
    return NextResponse.json({
      ok: true,
      url: result.url,
      text: result.text,
      meta: result.meta,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error generando audio'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
