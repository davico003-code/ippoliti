'use client'

import PropiedadCardGrid from '@/components/PropiedadCardGrid'
import type { TokkoProperty } from '@/lib/tokko'
import { distanceToProperty } from '@/lib/geo'

interface Props {
  properties: TokkoProperty[]
  selectedId: number | null
  /** Sync con mapa: cuando el mouse hover un pin del mapa, el padre setea
   *  hoveredId y este componente highlightea la card correspondiente. */
  hoveredId?: number | null
  onHover: (id: number | null) => void
  onCardClick: (p: TokkoProperty) => void
  /** Si está seteado, cada card muestra "a X m/km" calculado desde este origen. */
  nearbyOrigin?: { lat: number; lng: number } | null
}

export default function PropiedadesViewDesktopGrid({
  properties,
  selectedId,
  hoveredId = null,
  onHover,
  onCardClick,
  nearbyOrigin = null,
}: Props) {
  return (
    <div className="grid p-4 grid-cols-1 xl:grid-cols-2 gap-4">
      {properties.map(p => (
        <div
          key={p.id}
          data-property-id={p.id}
          onMouseEnter={() => onHover(p.id)}
          onMouseLeave={() => onHover(null)}
        >
          <PropiedadCardGrid
            property={p}
            isSelected={p.id === selectedId}
            isHovered={p.id === hoveredId}
            onClick={e => { e.preventDefault(); onCardClick(p) }}
            distanceKm={nearbyOrigin ? distanceToProperty(p, nearbyOrigin.lat, nearbyOrigin.lng) : null}
          />
        </div>
      ))}
    </div>
  )
}
