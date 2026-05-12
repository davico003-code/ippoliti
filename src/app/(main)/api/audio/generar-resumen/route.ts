// POST /api/audio/generar-resumen
//
// Body: { propertyId: number }
// Returns: { ok: true, text: string }
//
// Sin auth (uso público en /propiedades/[slug] y /v/[slug]). Endpoint chico
// que sirve sobre todo para debugging/inspección — el componente del front
// usa /api/audio/generar-audio que ya incluye el resumen.

import { NextResponse } from 'next/server'
import { generateResumen } from '@/lib/audio'

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
    const text = await generateResumen(propertyId)
    return NextResponse.json({ ok: true, text })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error generando resumen'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
