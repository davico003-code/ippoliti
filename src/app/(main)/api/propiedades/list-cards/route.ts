import { NextResponse } from 'next/server'
import { getProperties, sanitizeProperty } from '@/lib/tokko'
import { enrichCardsWithAudio, fotosExtraDeCards, projectToCard } from '@/lib/projections'

// Devuelve TODAS las propiedades disponibles proyectadas a card-shape
// (sin description, photos array, tags, videos, etc.). Lo consumen los
// paneles client que necesitan listar propiedades sin pagar el costo
// de serializar la data full.
//
// Este endpoint alimenta cards internas/listados rápidos. Con origen HILO las
// fotos van con URL fija (/fotos/…, lib/fotos-fijas.ts: no vencen), así que es
// seguro cachearlo: antes iba no-store y CADA ficha desktop re-bajaba el
// feed completo (~1MB, ~5s). Ahora cachea en el CDN 5 min y participa de la
// revalidación por tag 'tokko-properties' (propagación instantánea al cargar).
// Lee el mismo listado que /propiedades (getProperties: oportunidades sin
// monto, fotos con URL fija y el feed por páginas que entran en el Data Cache).

export const dynamic = 'force-dynamic'

const CACHE = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' }

export async function GET(req: Request) {
  try {
    const data = await getProperties()
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
