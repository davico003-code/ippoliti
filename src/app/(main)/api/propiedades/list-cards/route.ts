import { NextResponse } from 'next/server'
import { getProperties, sanitizeProperty, ocultarPrecioOportunidad, type TokkoListResponse } from '@/lib/tokko'
import { enrichCardsWithAudio, fotosExtraDeCards, projectToCard } from '@/lib/projections'

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
  const data = (await res.json()) as TokkoListResponse
  // Mismo criterio que getProperties: las oportunidades "Consultanos" van sin monto.
  data.objects = (data.objects ?? []).map(ocultarPrecioOportunidad)
  return data
}

const CACHE = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' }

export async function GET(req: Request) {
  try {
    const data = await getFreshProperties()
    const sanitized = (data.objects ?? []).map(sanitizeProperty)
    const objects = sanitized.map(projectToCard)
    // ?fotos=extra → solo las fotos 2-5 de cada card ({ id: [urls] }): el listado
    // /propiedades las pide después de cargar (su HTML lleva solo la portada).
    if (new URL(req.url).searchParams.get('fotos') === 'extra') {
      return NextResponse.json({ fotos: fotosExtraDeCards(objects) }, { headers: CACHE })
    }
    await enrichCardsWithAudio(objects)
    return NextResponse.json(
      { objects, meta: { total_count: objects.length } },
      { headers: CACHE },
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
