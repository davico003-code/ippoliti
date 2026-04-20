// Bloque eyebrow — etiqueta corta con línea decorativa al frente.
// "Inversión en Funes", "Conclusión", "Si llegaste hasta acá".

import type { ReactNode } from 'react'
import type { Bloque } from '../types'
import type { RenderContext } from '../config/bloques-config'
import { LAYOUT, TIPO } from '../config/estilos-marca'

type EyebrowBloque = Extract<Bloque, { tipo: 'eyebrow' }>

export function renderEyebrow(bloque: EyebrowBloque, ctx: RenderContext): ReactNode {
  const color = ctx.tema.enfasis // verde-profundo sobre claros, verde-brillante sobre oscuros

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: `${LAYOUT.eyebrowGap}px`,
        color,
        ...TIPO.eyebrow,
      }}
    >
      {/* Línea decorativa al frente — 56×2 px */}
      <div
        style={{
          display: 'flex',
          width: `${LAYOUT.eyebrowLineWidth}px`,
          height: `${LAYOUT.eyebrowLineHeight}px`,
          backgroundColor: color,
        }}
      />
      <span style={{ display: 'flex' }}>{bloque.texto}</span>
    </div>
  )
}
