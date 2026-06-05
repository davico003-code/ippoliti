// Acentos de título de sección — Edición Mundial 2026.
// Ambos devuelven null fuera de esEdicionMundial() → la sección vuelve a su
// estado original (sin kicker, sin separador). Sin hooks: sirven en server y
// client components.

import { esEdicionMundial } from '@/lib/mundial'

const POPPINS = 'var(--font-poppins), Poppins, sans-serif'
const GOLD = '#D4A24C'
const CELESTE = '#75AADB'

// Kicker chico arriba del título: rayita dorada de 22px + label en Poppins.
export function KickerMundial({ label = 'EDICIÓN MUNDIAL 2026' }: { label?: string }) {
  if (!esEdicionMundial()) return null
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        fontFamily: POPPINS,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: GOLD,
      }}
    >
      <span aria-hidden="true" style={{ width: 22, height: 2, background: GOLD, borderRadius: 2 }} />
      {label}
    </span>
  )
}

// Separador franja-bandera debajo del título (celeste / blanco / celeste).
export function SeparadorMundial({ marginTop = 12 }: { marginTop?: number }) {
  if (!esEdicionMundial()) return null
  return (
    <span
      aria-hidden="true"
      style={{ display: 'flex', width: 120, height: 3, borderRadius: 3, overflow: 'hidden', marginTop }}
    >
      <span style={{ flex: 1, background: CELESTE }} />
      {/* inset shadow .5px para que el segmento blanco se vea sobre fondo claro */}
      <span style={{ flex: 1, background: '#fff', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)' }} />
      <span style={{ flex: 1, background: CELESTE }} />
    </span>
  )
}
