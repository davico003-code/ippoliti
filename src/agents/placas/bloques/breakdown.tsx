// Bloque breakdown — tabla de 2 a 4 columnas con label uppercase + valor
// Poppins 600. Divisores verticales finos entre columnas, línea superior
// horizontal como separador de la sección anterior.
//
// Satori no soporta CSS grid, armamos con flex horizontal distribuido
// con `flex: 1` por columna.

import type { ReactNode } from 'react'
import type { Bloque } from '../types'
import type { RenderContext } from '../config/bloques-config'
import { LAYOUT, TIPO } from '../config/estilos-marca'

type BreakdownBloque = Extract<Bloque, { tipo: 'breakdown' }>

export function renderBreakdown(bloque: BreakdownBloque, ctx: RenderContext): ReactNode {
  const items = bloque.items
  return (
    <div
      style={{
        display: 'flex',
        paddingTop: `${LAYOUT.breakdownColsPaddingTop}px`,
        borderTop: `${LAYOUT.borderWidth}px solid ${ctx.tema.linea}`,
        width: '100%',
      }}
    >
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            gap: '12px',
            paddingRight: i < items.length - 1 ? '24px' : '0',
            paddingLeft: i > 0 ? '24px' : '0',
            borderRight:
              i < items.length - 1
                ? `${LAYOUT.borderWidth}px solid ${ctx.tema.linea}`
                : '0',
          }}
        >
          <span
            style={{
              display: 'flex',
              fontFamily: TIPO.breakdownLabel.fontFamily,
              fontWeight: TIPO.breakdownLabel.fontWeight,
              fontSize: `${TIPO.breakdownLabel.fontSize}px`,
              letterSpacing: TIPO.breakdownLabel.letterSpacing,
              textTransform: 'uppercase',
              color: ctx.tema.muted,
            }}
          >
            {it.label}
          </span>
          <span
            style={{
              display: 'flex',
              fontFamily: TIPO.breakdownValor.fontFamily,
              fontWeight: TIPO.breakdownValor.fontWeight,
              fontSize: `${TIPO.breakdownValor.fontSize}px`,
              lineHeight: TIPO.breakdownValor.lineHeight,
              color: ctx.tema.ink,
            }}
          >
            {it.valor}
          </span>
        </div>
      ))}
    </div>
  )
}
