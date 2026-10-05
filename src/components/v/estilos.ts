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

/**
 * Las piezas de la ficha también van adentro del Tinder (Ver detalles), que
 * desde el 5-oct es NEGRO (David: "pasalo todo a negro"). `oscuro` las pinta
 * sobre negro; sin eso, la ficha neutra queda como siempre.
 */
export type ColoresFicha = { TINTA: string; TEXTO: string; APAGADO: string; LINEA: string; FONDO_SUAVE: string; FONDO: string; FONDO_RGB: string }
const CLAROS: ColoresFicha = { TINTA, TEXTO, APAGADO, LINEA, FONDO_SUAVE, FONDO: '#FFFFFF', FONDO_RGB: '255,255,255' }
const OSCUROS: ColoresFicha = {
  TINTA: '#FFFFFF',
  TEXTO: 'rgba(255,255,255,0.86)',
  APAGADO: 'rgba(255,255,255,0.66)',
  LINEA: 'rgba(255,255,255,0.14)',
  FONDO_SUAVE: '#222222',
  FONDO: '#151515',
  FONDO_RGB: '21,21,21',
}
export const coloresFicha = (oscuro?: boolean): ColoresFicha => (oscuro ? OSCUROS : CLAROS)

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
