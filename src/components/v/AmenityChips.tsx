'use client'

// Características / amenities como chips en renglón (wrap). Mapeo name → icono
// lucide para los amenities más comunes; el resto sin icono. Con muchas (hay
// fichas con 22) se muestran 8 y un chip "Ver las N".

import { useState, type ReactNode } from 'react'
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
import { coloresFicha, tituloSeccion } from './estilos'

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

function pickIcon(name: string, color: string): ReactNode {
  const low = name.toLowerCase()
  for (const r of ICON_RULES) {
    if (low.includes(r.keyword)) {
      return <r.Icon size={15} strokeWidth={1.7} color={color} aria-hidden />
    }
  }
  return null
}

export default function AmenityChips({
  caracteristicas,
  extras,
  oscuro = false,
}: {
  caracteristicas: string[]
  extras?: Array<{ name: string; value: string }>
  /** Sobre el negro del Tinder (Ver detalles). */
  oscuro?: boolean
}) {
  const { FONDO, FONDO_SUAVE, TINTA } = coloresFicha(oscuro)
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

  const [todas, setTodas] = useState(false)
  if (all.length === 0) return null
  const plegar = all.length > 10 && !todas
  const visibles = plegar ? all.slice(0, 8) : all

  return (
    <section style={{ marginTop: 32 }}>
      <h2 style={{ ...tituloSeccion, color: TINTA }}>Características</h2>

      <ul
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {visibles.map(name => (
          <li
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 12px',
              background: FONDO_SUAVE,
              borderRadius: 999,
              fontSize: 14,
              color: TINTA,
              lineHeight: 1.3,
            }}
          >
            {pickIcon(name, TINTA)}
            <span>{name}</span>
          </li>
        ))}
        {plegar && (
          <li>
            <button
              type="button"
              onClick={() => setTodas(true)}
              style={{
                minHeight: 36,
                padding: '8px 12px',
                background: FONDO,
                border: `1px solid ${TINTA}`,
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600,
                color: TINTA,
                lineHeight: 1.3,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Ver las {all.length}
            </button>
          </li>
        )}
      </ul>
    </section>
  )
}
