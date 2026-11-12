// POST /api/tiempos-viaje/trabajo  { id, direccion }
//
// "¿Trabajás en otro lado?" de la ficha: minutos en hora pico desde la propiedad
// hasta la dirección que escribió el visitante. Cada dirección nueva es un pedido
// pago a Google: límite por visitante y tope diario general (lib/tiempos-viaje.ts).

import { NextResponse } from 'next/server'
import { getPropertyById } from '@/lib/tokko'
import { getIp, parsePropertyId, rateLimit } from '@/lib/feedback'
import { tiempoATrabajo } from '@/lib/tiempos-viaje'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { id?: unknown; direccion?: unknown } | null
  const id = parsePropertyId(body?.id)
  const direccion = typeof body?.direccion === 'string' ? body.direccion.slice(0, 160) : ''
  if (!id || direccion.trim().length < 4) return NextResponse.json({ error: 'no_encontrada' }, { status: 400 })
  if (!(await rateLimit(getIp(req), 'tiempos-trabajo', 10, 600))) {
    return NextResponse.json({ error: 'demasiados' }, { status: 429 })
  }
  const property = await getPropertyById(Number(id)).catch(() => null)
  const lat = Number(property?.geo_lat)
  const lng = Number(property?.geo_long)
  if (!property || !lat || !lng) return NextResponse.json({ error: 'sin_servicio' }, { status: 503 })
  const res = await tiempoATrabajo(lat, lng, direccion)
  return NextResponse.json(res, { status: 'error' in res ? (res.error === 'no_encontrada' ? 404 : 503) : 200 })
}
