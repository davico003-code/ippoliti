// Bloque bajada — frase italic complementaria al título, con línea superior
// fina de separación. Raleway italic 300 a 38px.

import type { ReactNode } from 'react'
import type { Bloque } from '../types'
import type { RenderContext } from '../config/bloques-config'
import { LAYOUT, TIPO } from '../config/estilos-marca'

type BajadaBloque = Extract<Bloque, { tipo: 'bajada' }>

export function renderBajada(bloque: BajadaBloque, ctx: RenderContext): ReactNode {
  const color = ctx.fondo === 'verde-profundo' ? 'rgba(255,255,255,0.88)' : '#3a3a3a'

  return (
    <div
      style={{
        display: 'flex',
        marginTop: `${LAYOUT.bajadaMarginTop}px`,
        paddingTop: `${LAYOUT.bajadaPaddingTop}px`,
        borderTop: `1px solid ${ctx.tema.linea}`,
        maxWidth: '96%',
      }}
    >
      <span
        style={{
          display: 'flex',
          fontFamily: TIPO.bajada.fontFamily,
          fontStyle: 'italic',
          fontWeight: TIPO.bajada.fontWeight,
          fontSize: `${TIPO.bajada.fontSize}px`,
          lineHeight: TIPO.bajada.lineHeight,
          color,
        }}
      >
        {bloque.texto}
      </span>
    </div>
  )
}
