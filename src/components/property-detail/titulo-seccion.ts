import type { CSSProperties } from 'react'

// UN tamaño para todos los títulos de sección de la ficha (21-oct-2026): antes
// había cuatro (Descripción 28, Similares 24, el resto 18 y Servicios 15) y no
// se sabía qué era sección y qué era detalle. 22 px en el celu, 24 en la compu.
export const TITULO_SECCION = 'text-[22px] lg:text-[24px]'
export const ESTILO_TITULO_SECCION: CSSProperties = {
  fontFamily: "'Raleway', system-ui, sans-serif",
  fontWeight: 800,
  letterSpacing: '-0.01em',
  lineHeight: 1.2,
  color: 'var(--foreground)',
}
