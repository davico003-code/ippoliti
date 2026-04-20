'use client'

// Full-width "Otras opciones para vos" block. Extracted from PropertyDetailBody
// so the parent (modal / full page) can render it outside the 2-col grid and
// let it span the entire panel width.
import type { TokkoProperty } from '@/lib/tokko'
import SimilarProperties from '../SimilarProperties'
import SectionBoundary from './SectionBoundary'

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function computeSimilar(property: TokkoProperty, allProperties: TokkoProperty[]): TokkoProperty[] {
  const currentLat = property.geo_lat ? parseFloat(property.geo_lat) : null
  const currentLng = property.geo_long ? parseFloat(property.geo_long) : null
  const hasCoords = currentLat != null && !isNaN(currentLat) && currentLng != null && !isNaN(currentLng)
  const currentOp = property.operations?.[0]?.operation_type
  const currentTypeName = property.type?.name?.toLowerCase() ?? ''
  const currentPrice = property.operations?.[0]?.prices?.[0]?.price ?? 0
  const currentBeds = property.suite_amount || property.room_amount || 0

  return allProperties
    .map(p => {
      if (p.id === property.id) return null
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
          const d = haversineKm(currentLat!, currentLng!, lat, lng)
          if (d < 2) score += 4
          else if (d < 5) score += 2
          else if (d < 15) score += 1
        }
      }
      return score > 0 ? { p, score } : null
    })
    .filter((x): x is { p: TokkoProperty; score: number } => x != null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(x => x.p)
}

export default function PropertyDetailSimilars({
  property,
  allProperties,
}: {
  property: TokkoProperty
  allProperties: TokkoProperty[]
}) {
  const list = computeSimilar(property, allProperties)
  if (list.length === 0) return null
  return (
    <SectionBoundary name="similares">
      <section
        id="similares"
        className="bg-white rounded-2xl px-5 md:px-8 pt-2 pb-8 shadow-sm border border-gray-100"
      >
        <SimilarProperties properties={list} currentPropertyId={property.id} />
      </section>
    </SectionBoundary>
  )
}
