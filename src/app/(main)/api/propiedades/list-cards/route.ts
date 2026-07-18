import { NextResponse } from 'next/server'
import { getProperties, sanitizeProperty, type TokkoListResponse } from '@/lib/tokko'
import { enrichCardsWithAudio, projectToCard } from '@/lib/projections'

// Devuelve TODAS las propiedades disponibles proyectadas a card-shape
// (sin description, photos array, tags, videos, etc.). Lo consumen los
// paneles client que necesitan listar propiedades sin pagar el costo
// de serializar la data full.
//
// Este endpoint alimenta cards internas/listados rápidos. Con origen HILO las
// fotos son URLs públicas de static.tokkobroker.com (NO firmadas, no vencen), así
// que es seguro cachearlo: antes iba no-store y CADA ficha desktop re-bajaba el
// feed completo (~1MB, ~5s). Ahora cachea en el CDN 5 min y participa de la
// revalidación por tag 'tokko-properties' (propagación instantánea al cargar).

export const dynamic = 'force-dynamic'

const HILO_BASE = process.env.HILO_FEED_URL || 'https://meethilo.com'

async function getFreshProperties(): Promise<TokkoListResponse> {
  if ((process.env.DATA_SOURCE || '').toLowerCase() !== 'hilo') {
    return getProperties()
  }

  const res = await fetch(`${HILO_BASE}/api/public/propiedades?limit=1000`, {
    next: { revalidate: 300, tags: ['tokko-properties'] },
  })
  if (!res.ok) throw new Error(`Hilo feed error: ${res.status} ${res.statusText}`)
  return (await res.json()) as TokkoListResponse
}

export async function GET() {
  try {
    const data = await getFreshProperties()
    const sanitized = (data.objects ?? []).map(sanitizeProperty)
    const objects = sanitized.map(projectToCard)
    await enrichCardsWithAudio(objects)
    return NextResponse.json(
      { objects, meta: { total_count: objects.length } },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
        },
      },
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
