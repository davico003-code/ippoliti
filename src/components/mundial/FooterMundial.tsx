// Acentos de footer — Edición Mundial 2026. Gateados por esEdicionMundial():
// fuera del rango devuelven null y el footer vuelve a su estado original.

import { esEdicionMundial } from '@/lib/mundial'

const POPPINS = 'var(--font-poppins), Poppins, sans-serif'
const CELESTE = '#75AADB'
const GOLD = '#D4A24C'

// Franja-bandera de 4px pegada al borde superior del footer (absolute → no altera
// el flujo ni el padding del pie). El footer contenedor debe ser position:relative.
export function FranjaFooterMundial() {
  if (!esEdicionMundial()) return null
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', height: 4 }}
    >
      <span style={{ flex: 1, background: CELESTE }} />
      <span style={{ flex: 1, background: '#fff' }} />
      <span style={{ flex: 1, background: CELESTE }} />
    </div>
  )
}

// Sol de mayo simple (dorado tenue).
function SolDeMayo({ size = 14 }: { size?: number }) {
  const rays = Array.from({ length: 8 }, (_, i) => i * 45)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ opacity: 0.75, flexShrink: 0 }}>
      <circle cx="12" cy="12" r="4.5" fill={GOLD} />
      {rays.map(deg => (
        <line
          key={deg}
          x1="12" y1="12" x2="12" y2="3"
          stroke={GOLD}
          strokeWidth="1.6"
          strokeLinecap="round"
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
    </svg>
  )
}

// Línea "Edición Mundial 2026" en celeste + sol de mayo. Se ubica en el pie.
export function LineaMundial() {
  if (!esEdicionMundial()) return null
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        color: CELESTE,
        fontFamily: POPPINS,
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.4px',
      }}
    >
      <SolDeMayo />
      Edición Mundial 2026
    </span>
  )
}
