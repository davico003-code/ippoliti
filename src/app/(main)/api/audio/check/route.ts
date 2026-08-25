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

// Cache CDN: este endpoint se pega en CADA vista de ficha (siinmobiliaria +
// verficha) y cada hit era un comando Redis. El audio de una propiedad cambia
// rarísimo (generación opt-in desde /admin/audio), así que 6h de CDN + SWR
// recortan el grueso del consumo de Upstash sin costo funcional.
const CDN_CACHE = 'public, s-maxage=21600, stale-while-revalidate=86400'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const raw = searchParams.get('propertyId')
  const propertyId = Number(raw)
  if (!propertyId || Number.isNaN(propertyId)) {
    return NextResponse.json({ error: 'propertyId requerido' }, { status: 400 })
  }

  // Fail-open: si Redis está caído (p. ej. cuota mensual de Upstash agotada,
  // 25-ago-2026) el player simplemente no se muestra; nunca 500. El error no
  // se cachea en CDN para reintentar cuando Redis vuelva.
  let url: string | null = null
  try {
    url = await getCachedAudioUrl(propertyId)
  } catch (err) {
    console.warn('[audio/check] Redis error (fail-open):', err)
    return NextResponse.json({ hasAudio: false }, { headers: { 'cache-control': 'no-store' } })
  }

  if (url) return NextResponse.json({ hasAudio: true, url }, { headers: { 'cache-control': CDN_CACHE } })
  return NextResponse.json({ hasAudio: false }, { headers: { 'cache-control': CDN_CACHE } })
}
