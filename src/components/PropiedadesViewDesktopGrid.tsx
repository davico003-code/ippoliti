'use client'

import PropiedadCardGrid from '@/components/PropiedadCardGrid'
import type { TokkoProperty } from '@/lib/tokko'
import { distanceToProperty } from '@/lib/geo'
import type { PropertyFit } from '@/lib/property-fit'

interface Props {
  properties: TokkoProperty[]
  selectedId: number | null
  onHover: (id: number | null) => void
  onCardClick: (p: TokkoProperty) => void
  /** Si está seteado, cada card muestra "a X m/km" calculado desde este origen. */
  nearbyOrigin?: { lat: number; lng: number } | null
  fits?: Record<number, PropertyFit>
}

export default function PropiedadesViewDesktopGrid({
  properties,
  selectedId,
  onHover,
  onCardClick,
  nearbyOrigin = null,
  fits = {},
}: Props) {
  return (
    <div className="grid p-4 grid-cols-1 xl:grid-cols-2 gap-4">
      {properties.map((p, i) => (
        <div
          key={p.id}
          data-property-id={p.id}
          onMouseEnter={() => onHover(p.id)}
          onMouseLeave={() => onHover(null)}
        >
          <PropiedadCardGrid
            property={p}
            isSelected={p.id === selectedId}
            onClick={e => { e.preventDefault(); onCardClick(p) }}
            priority={i < 2}
            distanceKm={nearbyOrigin ? distanceToProperty(p, nearbyOrigin.lat, nearbyOrigin.lng) : null}
            fit={fits[p.id] ?? null}
          />
        </div>
      ))}
    </div>
  )
}
