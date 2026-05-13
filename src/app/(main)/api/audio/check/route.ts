// GET /api/audio/check?propertyId=...
//
// Público (sin auth). Devuelve si ya existe audio cacheado para una propiedad.
// El front lo consume al mount de AudioSummary / AudioSummaryNeutral para
// decidir si renderiza el player o nada.
//
// 200 { hasAudio: true, url: "..." }   → hay audio cacheado en Redis
// 200 { hasAudio: false }              → no hay (no se renderiza el player)
// 400 { error }                        → propertyId faltante o inválido

import { NextResponse } from 'next/server'
import { getCachedAudioUrl } from '@/lib/audio'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const raw = searchParams.get('propertyId')
  const propertyId = Number(raw)
  if (!propertyId || Number.isNaN(propertyId)) {
    return NextResponse.json({ error: 'propertyId requerido' }, { status: 400 })
  }

  const url = await getCachedAudioUrl(propertyId)
  if (url) return NextResponse.json({ hasAudio: true, url })
  return NextResponse.json({ hasAudio: false })
}
