import { NextRequest, NextResponse } from 'next/server'
import {
  getProperties,
  sanitizeProperty,
  formatPrice,
  generatePropertySlug,
} from '@/lib/tokko'
import { haversineDistance, GEO_NEARBY_RADIUS_KM } from '@/lib/geo'
import type { NearbyProperty } from '@/lib/projections'

// Replica el algoritmo de PropertyDetailBody.tsx:148-166 server-side.
// Default radio: 5 km (GEO_NEARBY_RADIUS_KM). Default max: 40.
//
// Cache: 15 min en CDN + swr 24h. Cada (lat, lng, radius, exclude)
// tiene su propia entry. Misma propiedad → mismo cache key → HIT.

const MAX_RESULTS = 40

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const latStr = sp.get('lat')
  const lngStr = sp.get('lng')
  const lat = Number(latStr)
  const lng = Number(lngStr)
  if (!latStr || !lngStr || isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
  }

  const radius = Number(sp.get('radius') ?? String(GEO_NEARBY_RADIUS_KM))
  const excludeRaw = sp.get('exclude')
  const excludeId = excludeRaw ? Number(excludeRaw) : null

  try {
    const data = await getProperties()
    const all = (data.objects ?? []).map(sanitizeProperty)

    const objects: NearbyProperty[] = all
      .filter(p => p.id !== excludeId && p.geo_lat && p.geo_long)
      .map(p => {
        const pLat = parseFloat(p.geo_lat!); const pLng = parseFloat(p.geo_long!)
        if (isNaN(pLat) || isNaN(pLng)) return null
        if (haversineDistance(lat, lng, pLat, pLng) > radius) return null
        return {
          id: p.id,
          lat: pLat,
          lng: pLng,
          title: p.publication_title || p.address,
          price: formatPrice(p),
          slug: generatePropertySlug(p),
        }
      })
      .filter((x): x is NearbyProperty => x != null)
      .slice(0, MAX_RESULTS)

    return NextResponse.json(
      { objects },
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
