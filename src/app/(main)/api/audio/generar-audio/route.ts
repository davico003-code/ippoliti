// POST /api/audio/generar-audio
//
// Body: { propertyId: number }
// Returns: { ok: true, url: string }
//
// Sin auth. Es el endpoint que consume el componente AudioSummary al hacer
// click en "Escuchá esta propiedad". Devuelve la URL del MP3 servido por
// Vercel Blob. Si ya existe en cache, devuelve inmediato; si no, genera
// resumen → TTS → upload → cachea (tarda 3-5s la primera vez por propiedad).

import { NextResponse } from 'next/server'
import { generateAudio } from '@/lib/audio'

export const maxDuration = 60

export async function POST(req: Request) {
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
