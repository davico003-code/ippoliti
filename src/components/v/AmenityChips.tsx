// Sección 5: características / amenities como chips. Mapeo name → icono lucide
// para los amenities más comunes; el resto sin icono.

import type { ReactNode } from 'react'
import {
  AirVent,
  Bath,
  Beef,
  Car,
  Flame,
  Flower2,
  Lamp,
  type LucideIcon,
  TreePalm,
  Trees,
  Tv,
  Waves,
  Wifi,
  Zap,
} from 'lucide-react'

type IconC = LucideIcon

// Mapeo simple por palabra clave (case-insensitive, partial match).
// Si no matchea, no se renderiza icono — solo el texto.
const ICON_RULES: Array<{ keyword: string; Icon: IconC }> = [
  { keyword: 'pileta', Icon: Waves },
  { keyword: 'piscina', Icon: Waves },
  { keyword: 'parrilla', Icon: Flame },
  { keyword: 'asador', Icon: Flame },
  { keyword: 'quincho', Icon: Beef },
  { keyword: 'cochera', Icon: Car },
  { keyword: 'garage', Icon: Car },
  { keyword: 'aire', Icon: AirVent },
  { keyword: 'wifi', Icon: Wifi },
  { keyword: 'internet', Icon: Wifi },
  { keyword: 'tv', Icon: Tv },
  { keyword: 'cable', Icon: Tv },
  { keyword: 'jardín', Icon: Flower2 },
  { keyword: 'jardin', Icon: Flower2 },
  { keyword: 'parque', Icon: Trees },
  { keyword: 'arboleda', Icon: Trees },
  { keyword: 'palmera', Icon: TreePalm },
  { keyword: 'baño', Icon: Bath },
  { keyword: 'iluminación', Icon: Lamp },
  { keyword: 'iluminacion', Icon: Lamp },
  { keyword: 'electric', Icon: Zap },
  { keyword: 'energía', Icon: Zap },
  { keyword: 'energia', Icon: Zap },
]

function pickIcon(name: string): ReactNode {
  const low = name.toLowerCase()
  for (const r of ICON_RULES) {
    if (low.includes(r.keyword)) {
      return <r.Icon size={15} strokeWidth={1.6} color="#4A4A4A" />
    }
  }
  return null
}

export default function AmenityChips({
  caracteristicas,
  extras,
}: {
  caracteristicas: string[]
  extras?: Array<{ name: string; value: string }>
}) {
  // Combino tags + extras (estos son atributos custom de Tokko que pueden ser
  // amenities adicionales como "Pileta", "Quincho", etc., con value "Sí").
  const all: string[] = []
  for (const c of caracteristicas) {
    const t = c.trim()
    if (t && !all.includes(t)) all.push(t)
  }
  for (const e of extras || []) {
    const label = e.value && e.value !== 'Sí' && e.value !== 'Si'
      ? `${e.name}: ${e.value}`
      : e.name
    if (label && !all.includes(label)) all.push(label)
  }

  if (all.length === 0) return null

  return (
    <section style={{ marginTop: 36 }}>
      <h2
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#1A1A1A',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 14,
        }}
      >
        Características
      </h2>

      <ul
        className="amenity-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {all.map(name => (
          <li
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              background: '#F3F4F6',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: '#1A1A1A',
              lineHeight: 1.3,
            }}
          >
            {pickIcon(name)}
            <span>{name}</span>
          </li>
        ))}
      </ul>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          .amenity-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      ` }} />
    </section>
  )
}
