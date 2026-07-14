import { NextResponse } from 'next/server'
import { getProperties, sanitizeProperty, type TokkoListResponse } from '@/lib/tokko'
import { enrichCardsWithAudio, projectToCard } from '@/lib/projections'

// Devuelve TODAS las propiedades disponibles proyectadas a card-shape
// (sin description, photos array, tags, videos, etc.). Lo consumen los
// paneles client que necesitan listar propiedades sin pagar el costo
// de serializar la data full.
//
// Este endpoint alimenta cards internas/listados rápidos. Cuando el origen es
// Hilo/Supabase no conviene servir blobs viejos de Vercel: las fotos llegan con
// URLs firmadas y, si vencen, el cache puede dejar cards sin imagen aunque el
// feed principal ya esté sano.

export const dynamic = 'force-dynamic'
export const revalidate = 0

const HILO_BASE = process.env.HILO_FEED_URL || 'https://meethilo.com'

async function getFreshProperties(): Promise<TokkoListResponse> {
  if ((process.env.DATA_SOURCE || '').toLowerCase() !== 'hilo') {
    return getProperties()
  }

  const res = await fetch(`${HILO_BASE}/api/public/propiedades?limit=1000`, {
    cache: 'no-store',
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
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
