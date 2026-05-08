import { NextResponse } from 'next/server'
import { getProperties, sanitizeProperty } from '@/lib/tokko'
import { projectToCard } from '@/lib/projections'

// Devuelve TODAS las propiedades disponibles proyectadas a card-shape
// (sin description, photos array, tags, videos, etc.). Lo consumen los
// paneles client que necesitan listar propiedades sin pagar el costo
// de serializar la data full.
//
// Cache: 15 min en Vercel CDN + stale-while-revalidate 24h.
// El primer request paga ~500ms (Tokko fetch + projection); los
// siguientes hit edge en ~50ms hasta que pase el TTL.

export async function GET() {
  try {
    const data = await getProperties()
    const sanitized = (data.objects ?? []).map(sanitizeProperty)
    const objects = sanitized.map(projectToCard)
    return NextResponse.json(
      { objects, meta: { total_count: objects.length } },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
        },
      },
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
