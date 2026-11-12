// GET /api/propiedades/agentes?ids=1,2,3 — agente (nombre + foto) de cada
// propiedad, para la pastilla de las tarjetas de /propiedades. El listado no lo
// trae; acá se resuelve por tandas desde el detalle cacheado.
import { NextResponse } from 'next/server'
import { getAgentesPorIds } from '@/lib/agentes-por-propiedad'

const MAX_IDS = 60

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get('ids') ?? ''
  const ids = Array.from(new Set(raw.split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0))).slice(0, MAX_IDS)
  if (!ids.length) return NextResponse.json({})
  const agentes = await getAgentesPorIds(ids)
  return NextResponse.json(Object.fromEntries(agentes), {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
