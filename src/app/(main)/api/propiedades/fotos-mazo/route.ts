import { NextRequest, NextResponse } from 'next/server'
import { getAllPhotos, getPropertyById } from '@/lib/tokko'
import { MAX_FOTOS_MAZO } from '@/lib/mazo-items'
import { rateLimit } from '@/lib/feedback'

// GET /api/propiedades/fotos-mazo?ids=123,456 → { fotos: { "123": [url, …] } }
//
// El Tinder muestra hasta 10 fotos por casa, de a 3 (David, 4/6-oct-2026). El
// listado de la web trae solo las 5 de la tarjeta (más liviano para todas las
// páginas), así que el mazo pide aparte las del álbum de SUS casas nuestras
// (≤16). Cada una sale del mismo cache que la ficha (getPropertyById).

export async function GET(request: NextRequest) {
  const ids = Array.from(
    new Set(
      (request.nextUrl.searchParams.get('ids') ?? '')
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isInteger(n) && n > 0),
    ),
  ).slice(0, 16)
  if (!ids.length) return NextResponse.json({ error: 'ids requeridos' }, { status: 400 })
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'fotos-mazo', 40, 60))) {
    return NextResponse.json({ error: 'Demasiados pedidos seguidos' }, { status: 429, headers: { 'Cache-Control': 'no-store' } })
  }
  const pares = await Promise.all(
    ids.map(async (id): Promise<[number, string[]] | null> => {
      try {
        const fotos = getAllPhotos(await getPropertyById(id)).slice(0, MAX_FOTOS_MAZO)
        return fotos.length ? [id, fotos] : null
      } catch {
        // Una que ya no está (vendida, despublicada) no tumba a las demás.
        return null
      }
    }),
  )
  const fotos = Object.fromEntries(pares.filter((p): p is [number, string[]] => p !== null))
  return NextResponse.json({ fotos }, { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400' } })
}
