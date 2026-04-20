// Bloque numero-hero — número gigante Poppins 800 con:
//   - sup opcional (fracción decimal o %)
//   - anotación lateral opcional (valor + label uppercase)
//
// El HTML de referencia tiene baseline alignment: el número y el anotador
// empiezan en la misma línea horizontal. El sup NO hace superscript (tiene
// vertical-align:0 en el CSS original), queda como texto más chico al
// costado del número.

import type { ReactNode } from 'react'
import type { Bloque } from '../types'
import type { RenderContext } from '../config/bloques-config'
import { FUENTES, LAYOUT, TIPO } from '../config/estilos-marca'

type NumeroHeroBloque = Extract<Bloque, { tipo: 'numero-hero' }>

export function renderNumeroHero(bloque: NumeroHeroBloque, ctx: RenderContext): ReactNode {
  const isDark = ctx.fondo === 'verde-profundo'
  const colorNumero = isDark ? ctx.tema.acento : ctx.tema.ink
  const colorSup = isDark ? '#ffffff' : ctx.tema.acento
  const tamañoSup = TIPO.numeroHero.fontSize * 0.32 // 0.32em del HTML

  // line-height 0.85 + Poppins 800 hace overshoot arriba. Compensación 15%.
  const compensacion = TIPO.numeroHero.fontSize * 0.15

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: `${LAYOUT.numeroHeroGap}px`,
        paddingTop: `${compensacion}px`,
      }}
    >
      {/* Número + sup pegados */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <span
          style={{
            display: 'flex',
            fontFamily: TIPO.numeroHero.fontFamily,
            fontWeight: 800,
            fontSize: `${TIPO.numeroHero.fontSize}px`,
            lineHeight: TIPO.numeroHero.lineHeight,
            letterSpacing: TIPO.numeroHero.letterSpacing,
            color: colorNumero,
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
              letterSpacing: '-0.02em',
              color: colorSup,
              // Empuja el sup un poco hacia arriba pero sin sacarlo del baseline
              paddingTop: `${tamañoSup * 0.08}px`,
            }}
          >
            {bloque.sup}
          </span>
        )}
      </div>

      {/* Anotación lateral opcional */}
      {(bloque.anotacion_valor || bloque.anotacion_label) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingTop: `${LAYOUT.numeroHeroAnotacionPaddingTop}px`,
          }}
        >
          {bloque.anotacion_valor && (
            <span
              style={{
                display: 'flex',
                fontFamily: TIPO.numeroAnotacionValor.fontFamily,
                fontWeight: TIPO.numeroAnotacionValor.fontWeight,
                fontSize: `${TIPO.numeroAnotacionValor.fontSize}px`,
                letterSpacing: TIPO.numeroAnotacionValor.letterSpacing,
                lineHeight: 1,
                color: isDark ? '#ffffff' : ctx.tema.enfasis,
              }}
            >
              {bloque.anotacion_valor}
            </span>
          )}
          {bloque.anotacion_label && (
            <span
              style={{
                display: 'flex',
                fontFamily: TIPO.numeroAnotacionLabel.fontFamily,
                fontWeight: TIPO.numeroAnotacionLabel.fontWeight,
                fontSize: `${TIPO.numeroAnotacionLabel.fontSize}px`,
                letterSpacing: TIPO.numeroAnotacionLabel.letterSpacing,
                textTransform: 'uppercase',
                color: ctx.tema.muted,
              }}
            >
              {bloque.anotacion_label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
