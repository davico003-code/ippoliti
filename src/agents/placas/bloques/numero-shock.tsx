// Bloque numero-shock — número extremo Poppins 800 a 360px. Siempre color
// verde brillante (pensado para fondo verde-profundo pero no lo forzamos:
// sobre claros se mantiene el acento verde marca).

import type { ReactNode } from 'react'
import type { Bloque } from '../types'
import type { RenderContext } from '../config/bloques-config'
import { FUENTES, TIPO } from '../config/estilos-marca'

type NumeroShockBloque = Extract<Bloque, { tipo: 'numero-shock' }>

export function renderNumeroShock(bloque: NumeroShockBloque, ctx: RenderContext): ReactNode {
  const isDark = ctx.fondo === 'verde-profundo'
  const color = isDark ? ctx.tema.acento : ctx.tema.enfasis
  const tamañoSup = TIPO.numeroShock.fontSize * 0.3

  // line-height 0.82 + Poppins 800 hace que los glifos asciendan mucho más
  // arriba del box CSS. Compensación empírica: 18% del fontSize.
  const compensacion = TIPO.numeroShock.fontSize * 0.18

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: `${compensacion}px` }}>
      <span
        style={{
          display: 'flex',
          fontFamily: TIPO.numeroShock.fontFamily,
          fontWeight: 800,
          fontSize: `${TIPO.numeroShock.fontSize}px`,
          lineHeight: TIPO.numeroShock.lineHeight,
          letterSpacing: TIPO.numeroShock.letterSpacing,
          color,
        }}
      >
        {bloque.valor}
      </span>
      {bloque.sup && (
        <span
          style={{
            display: 'flex',
            fontFamily: FUENTES.poppins,
            fontWeight: 700,
            fontSize: `${tamañoSup}px`,
            color,
            // Empuje chico hacia arriba
            paddingTop: `${tamañoSup * 0.06}px`,
          }}
        >
          {bloque.sup}
        </span>
      )}
    </div>
  )
}
