// PIEZA 2 — Franja bandera bajo el logo del header. Gateada por esEdicionMundial.
// Se inserta en Navbar.tsx debajo del logo (la marca pasa a flex-col items-center).
//
// `scrolled`: cuando el header tiene fondo blanco (estado scrolled) el segmento
// blanco de la franja se pierde → se agrega un borde fino. Sobre el hero
// (transparent) el borde queda transparente y la franja se ve limpia.

import { esEdicionMundial } from '@/lib/mundial'

const CELESTE = '#75AADB'

export default function FranjaMundial({ scrolled }: { scrolled: boolean }) {
  if (!esEdicionMundial()) return null
  return (
    <span
      aria-hidden="true"
      style={{
        // Absoluta: cuelga bajo el logo SIN sumar altura al header (el contenedor
        // de la marca ya es contexto posicionado por su transform de centrado).
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: 4,
        display: 'flex',
        width: 92,
        height: 4,
        borderRadius: 3,
        overflow: 'hidden',
        // Borde solo sobre fondo blanco (scrolled); transparente sobre el hero.
        border: `1px solid ${scrolled ? 'rgba(0,0,0,0.10)' : 'transparent'}`,
        boxSizing: 'content-box',
        pointerEvents: 'none',
      }}
    >
      <span style={{ flex: 1, background: CELESTE }} />
      <span style={{ flex: 1, background: '#fff' }} />
      <span style={{ flex: 1, background: CELESTE }} />
    </span>
  )
}
