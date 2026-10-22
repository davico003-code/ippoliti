// /api/tiempos-viaje?id=8153191
//
// "¿Cuánto tardás desde acá?" de una propiedad publicada: minutos en auto en hora
// pico a sus destinos fijos (o sin tránsito, de OpenStreetMap, mientras Google no ande). Va por id (no por coordenadas sueltas) para que nadie
// pueda hacernos pagar rutas a Google desde cualquier punto: como mucho, una por
// propiedad, y queda guardada medio año (lib/tiempos-viaje.ts).

import { NextResponse } from 'next/server'
import { getPropertyById } from '@/lib/tokko'
import { parsePropertyId } from '@/lib/feedback'
import { tiemposDeViaje } from '@/lib/tiempos-viaje'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

const sinDatos = () => NextResponse.json({ error: 'sin_datos' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })

export async function GET(req: Request) {
  const id = parsePropertyId(new URL(req.url).searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'id' }, { status: 400 })
  const property = await getPropertyById(Number(id)).catch(() => null)
  const lat = Number(property?.geo_lat)
  const lng = Number(property?.geo_long)
  if (!property || !lat || !lng) return sinDatos()
  const res = await tiemposDeViaje(lat, lng)
  if (!res) return sinDatos()
  // Los de OpenStreetMap (sin tránsito) duran poco en el CDN: cuando Google ande,
  // la ficha pasa a hora pico en menos de una hora.
  const cache = res.fuente === 'osm'
    ? 'public, s-maxage=3600, stale-while-revalidate=3600'
    : 'public, s-maxage=86400, stale-while-revalidate=604800'
  return NextResponse.json(res, { headers: { 'Cache-Control': cache } })
}
