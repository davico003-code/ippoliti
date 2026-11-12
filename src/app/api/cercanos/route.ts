// /api/cercanos?lat=-32.8953&lng=-60.8889
//
// Lugares cercanos de una coordenada (escuelas, súper, salud, plazas…) para la
// ficha de la web y la de verficha.casa. El trabajo pesado y el caché de un año
// están en lib/cercanos.ts; acá solo se valida y se cachea en el CDN.

import { NextResponse } from 'next/server'
import { lugaresCercanos } from '@/lib/cercanos'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
// Fuera de la zona copiada (lib/cercanos.ts), Overpass puede tardar hasta ~20 s
// la primera vez de una coordenada.
export const maxDuration = 60

// Argentina, Uruguay y Paraguay: donde hay propiedades. Fuera de eso no se consulta.
const enZona = (lat: number, lng: number) => lat >= -56 && lat <= -19 && lng >= -74 && lng <= -53

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get('lat'))
  const lng = Number(searchParams.get('lng'))
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !enZona(lat, lng)) {
    return NextResponse.json({ error: 'coordenadas' }, { status: 400 })
  }
  const res = await lugaresCercanos(lat, lng)
  if (!res) {
    return NextResponse.json({ error: 'sin_datos' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
  return NextResponse.json(res, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
  })
}
