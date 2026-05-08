import { NextRequest, NextResponse } from 'next/server'
import { getProperties, getPropertyById, sanitizeProperty, type TokkoProperty } from '@/lib/tokko'
import { haversineDistance } from '@/lib/geo'
import { projectToCard } from '@/lib/projections'

// Replica el algoritmo de PropertyDetailSimilars.tsx:18-57 server-side.
// Filtros duros: misma operation_type + mismo type.name (case-insensitive).
// Score: precio (ratio), beds (igual o ±1), distancia haversine.
// Default top 4 (paridad con UI actual). ?limit=N opcional.
//
// Cache: 15 min en CDN + swr 24h. Cada (id, limit) tiene su propia entry.

export async function GET(request: NextRequest) {
  const idStr = request.nextUrl.searchParams.get('id')
  const id = Number(idStr)
  if (!idStr || isNaN(id)) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const limit = Number(request.nextUrl.searchParams.get('limit') ?? '4')

  try {
    const [current, allData] = await Promise.all([
      getPropertyById(id),
      getProperties(),
    ])
    const all = (allData.objects ?? []).map(sanitizeProperty)

    const currentLat = current.geo_lat ? parseFloat(current.geo_lat) : null
    const currentLng = current.geo_long ? parseFloat(current.geo_long) : null
    const hasCoords = currentLat != null && !isNaN(currentLat)
                   && currentLng != null && !isNaN(currentLng)
    const currentOp       = current.operations?.[0]?.operation_type
    const currentTypeName = current.type?.name?.toLowerCase() ?? ''
    const currentPrice    = current.operations?.[0]?.prices?.[0]?.price ?? 0
    const currentBeds     = current.suite_amount || current.room_amount || 0

    const ranked = all
      .map(p => {
        if (p.id === current.id) return null
        if (p.operations?.[0]?.operation_type !== currentOp) return null
        if ((p.type?.name?.toLowerCase() ?? '') !== currentTypeName) return null

        let score = 0

        const pPrice = p.operations?.[0]?.prices?.[0]?.price ?? 0
        if (currentPrice > 0 && pPrice > 0) {
          const ratio = pPrice / currentPrice
          if (ratio >= 0.7 && ratio <= 1.3) score += 3
          else if (ratio >= 0.5 && ratio <= 1.5) score += 1
        }

        const pBeds = p.suite_amount || p.room_amount || 0
        if (currentBeds > 0 && pBeds === currentBeds) score += 2
        else if (currentBeds > 0 && Math.abs(pBeds - currentBeds) === 1) score += 1

        if (hasCoords && p.geo_lat && p.geo_long) {
          const lat = parseFloat(p.geo_lat); const lng = parseFloat(p.geo_long)
          if (!isNaN(lat) && !isNaN(lng)) {
            const d = haversineDistance(currentLat!, currentLng!, lat, lng)
            if (d < 2)       score += 4
            else if (d < 5)  score += 2
            else if (d < 15) score += 1
          }
        }

        return score > 0 ? { p, score } : null
      })
      .filter((x): x is { p: TokkoProperty; score: number } => x != null)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(x => projectToCard(x.p))

    return NextResponse.json(
      { objects: ranked },
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
