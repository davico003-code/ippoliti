// Bloque fuente — cita de fuente al pie de un dato. Raleway italic 300
// tamaño 28px. Color muted (gris sobre claros, blanco translúcido sobre
// oscuros). El spacing superior ya lo aporta el renderer.

import type { ReactNode } from 'react'
import type { Bloque } from '../types'
import type { RenderContext } from '../config/bloques-config'
import { TIPO } from '../config/estilos-marca'

type FuenteBloque = Extract<Bloque, { tipo: 'fuente' }>

export function renderFuente(bloque: FuenteBloque, ctx: RenderContext): ReactNode {
  return (
    <div
      style={{
        display: 'flex',
        maxWidth: '96%',
      }}
    >
      <span
        style={{
          display: 'flex',
          fontFamily: TIPO.fuente.fontFamily,
          fontStyle: 'italic',
          fontWeight: TIPO.fuente.fontWeight,
          fontSize: `${TIPO.fuente.fontSize}px`,
          letterSpacing: TIPO.fuente.letterSpacing,
          color: ctx.tema.muted,
        }}
      >
        {bloque.texto}
      </span>
    </div>
  )
}
