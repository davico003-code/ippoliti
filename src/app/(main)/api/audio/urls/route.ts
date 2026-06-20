// POST /api/audio/urls
//
// Devuelve las URLs de audio (resumen narrado) para un lote de propertyIds.
// Se usa desde el cliente para cards que NO tienen el audioUrl enriquecido
// server-side (ej. la home "Nuestra selección", que es ISR y no puede tocar
// Redis en el render). El play se muestra solo donde hay audio.
//
// Body: { ids: number[] } → { urls: { [id]: string | null } }

import { NextResponse } from 'next/server'
import { getAudioUrlsBulk } from '@/lib/audio'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const CAP = 100

export async function POST(req: Request) {
  let body: { ids?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const ids = (Array.isArray(body.ids) ? body.ids : [])
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n) && n > 0)
    .slice(0, CAP)

  if (ids.length === 0) return NextResponse.json({ urls: {} })

  try {
    const urls = await getAudioUrlsBulk(ids)
    return NextResponse.json(
      { urls },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } },
    )
  } catch {
    return NextResponse.json({ urls: {} })
  }
}
