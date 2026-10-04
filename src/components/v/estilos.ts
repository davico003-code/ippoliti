// Tokens compartidos de la ficha neutra (verficha.casa). Paleta blanco /
// carbón / gris — sin ningún color de marca SI.

import type { CSSProperties } from 'react'

export const TINTA = '#1A1A1A'
export const TEXTO = '#3A3A3A'
// Gris de apoyo no más claro que #555 (regla de David 3-oct, letra legible
// para mayores: el #6B6B6B de antes se leía lavado sobre blanco).
export const APAGADO = '#555555'
export const SUAVE = '#9A9A9A'
export const LINEA = '#ECECEC'
export const FONDO_SUAVE = '#F6F6F4'

export const tituloSeccion: CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: TINTA,
  letterSpacing: '-0.01em',
  margin: '0 0 12px',
}

export const volanta: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}
