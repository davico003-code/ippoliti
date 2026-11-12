'use client'

import PropiedadCardGrid from '@/components/PropiedadCardGrid'
import MotivosFit from '@/components/MotivosFit'
import type { TokkoProperty } from '@/lib/tokko'
import type { SmartProfile } from '@/lib/property-fit'
import { distanceToProperty } from '@/lib/geo'

interface Props {
  properties: TokkoProperty[]
  selectedId: number | null
  onHover: (id: number | null) => void
  onCardClick: (p: TokkoProperty) => void
  /** Si está seteado, cada card muestra "a X m/km" calculado desde este origen. */
  nearbyOrigin?: { lat: number; lng: number } | null
  /** Con el asistente activo, cada card explica por qué entra en la búsqueda. */
  smartProfile?: SmartProfile | null
}

// El panel de la ficha se baja recién cuando hace falta (PropiedadesView lo
// importa con dynamic): al pasar el mouse por una tarjeta se adelanta la
// descarga, así el click lo abre al instante. Una sola vez por carga.
let panelPrecargado = false
function precargarPanel() {
  if (panelPrecargado) return
  panelPrecargado = true
  void import('./PropertyPanel').catch(() => { panelPrecargado = false })
}

export default function PropiedadesViewDesktopGrid({
  properties,
  selectedId,
  onHover,
  onCardClick,
  nearbyOrigin = null,
  smartProfile = null,
}: Props) {
  return (
    <div className="grid p-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      {properties.map((p, i) => (
        <div
          key={p.id}
          data-property-id={p.id}
          onMouseEnter={() => { onHover(p.id); precargarPanel() }}
          onMouseLeave={() => onHover(null)}
          onFocus={precargarPanel}
        >
          <PropiedadCardGrid
            property={p}
            isSelected={p.id === selectedId}
            // Cmd/Ctrl/Shift/Alt+click (o cualquier botón que no sea el
            // principal) es "abrí esto en otra pestaña/ventana": se deja al
            // navegador con el href real de la tarjeta. Antes el preventDefault
            // incondicional lo cancelaba y abría el panel encima del listado,
            // así no se podían comparar dos fichas en pestañas.
            onClick={e => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
              e.preventDefault()
              onCardClick(p)
            }}
            priority={i < 2}
            distanceKm={nearbyOrigin ? distanceToProperty(p, nearbyOrigin.lat, nearbyOrigin.lng) : null}
          />
          {smartProfile && <MotivosFit property={p} profile={smartProfile} />}
        </div>
      ))}
    </div>
  )
}
