'use client'

import PropiedadCardGrid from '@/components/PropiedadCardGrid'
import type { TokkoProperty } from '@/lib/tokko'

interface Props {
  properties: TokkoProperty[]
  selectedId: number | null
  onHover: (id: number | null) => void
  onCardClick: (p: TokkoProperty) => void
}

export default function PropiedadesViewDesktopGrid({
  properties,
  selectedId,
  onHover,
  onCardClick,
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
            onClick={e => { e.preventDefault(); onCardClick(p) }}
          />
        </div>
      ))}
    </div>
  )
}
