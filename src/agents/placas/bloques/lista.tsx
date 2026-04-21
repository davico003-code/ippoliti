// Bloque lista — headline opcional + items numerados o con bullets.
//
// Estructura:
//   [titulo (Raleway 300 56px con inline markdown)]
//   ─────────
//   01  texto del item (Raleway 400 30px, inline markdown, strong=700 ink)
//   ─────────
//   02  texto del item
//   ...
//
// Separadores finos entre items (no después del último).
// Los números van en Poppins 700 32px color acento.
// Bullets (si estilo='bullets') son círculos pequeños color acento.

import type { ReactNode } from 'react'
import type { Bloque } from '../types'
import type { RenderContext } from '../config/bloques-config'
import { LAYOUT, TIPO } from '../config/estilos-marca'
import { parseInlineMarkdown, type Fragmento } from '../lib/inline-markdown'

type ListaBloque = Extract<Bloque, { tipo: 'lista' }>

function renderFragmentos(
  fragmentos: Fragmento[],
  ctx: RenderContext,
  italicEnfasis = true,
): ReactNode[] {
  return fragmentos.map((f, i) => {
    if (f.kind === 'bold') {
      return (
        <span
          key={i}
          style={{
            display: 'flex',
            fontWeight: 700,
            color: ctx.tema.ink,
            whiteSpace: 'pre-wrap',
          }}
        >
          {f.texto}
        </span>
      )
    }
    if (f.kind === 'italic') {
      return (
        <span
          key={i}
          style={{
            display: 'flex',
            fontStyle: 'italic',
            fontWeight: 400,
            color: italicEnfasis ? ctx.tema.enfasis : ctx.tema.ink,
            whiteSpace: 'pre-wrap',
          }}
        >
          {f.texto}
        </span>
      )
    }
    return (
      <span key={i} style={{ display: 'flex', whiteSpace: 'pre-wrap' }}>
        {f.texto}
      </span>
    )
  })
}

export function renderLista(bloque: ListaBloque, ctx: RenderContext): ReactNode {
  const esNumerada = (bloque.estilo ?? 'numerada') === 'numerada'
  const colorTextoItem = ctx.fondo === 'verde-profundo' ? '#ffffff' : '#2a2a2a'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Headline opcional */}
      {bloque.titulo && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            marginBottom: '40px',
            fontFamily: TIPO.tituloMedio.fontFamily,
            fontWeight: TIPO.tituloMedio.fontWeight,
            fontSize: `${TIPO.tituloMedio.fontSize}px`,
            lineHeight: TIPO.tituloMedio.lineHeight,
            letterSpacing: TIPO.tituloMedio.letterSpacing,
            color: ctx.tema.ink,
          }}
        >
          {renderFragmentos(parseInlineMarkdown(bloque.titulo), ctx)}
        </div>
      )}

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {bloque.items.map((item, i) => {
          const esUltimo = i === bloque.items.length - 1
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: `${LAYOUT.listaItemGap}px`,
                padding: `${LAYOUT.listaItemPadding}px 0`,
                borderBottom: esUltimo
                  ? 'none'
                  : `${LAYOUT.borderWidth}px solid ${ctx.tema.linea}`,
              }}
            >
              {/* Marcador (número o bullet) */}
              <div
                style={{
                  display: 'flex',
                  minWidth: `${LAYOUT.listaItemNumWidth}px`,
                  paddingTop: esNumerada ? '6px' : '14px',
                }}
              >
                {esNumerada ? (
                  <span
                    style={{
                      display: 'flex',
                      fontFamily: TIPO.listaNumero.fontFamily,
                      fontWeight: TIPO.listaNumero.fontWeight,
                      fontSize: `${TIPO.listaNumero.fontSize}px`,
                      letterSpacing: TIPO.listaNumero.letterSpacing,
                      lineHeight: 1,
                      color: ctx.tema.acento,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: ctx.tema.acento,
                    }}
                  />
                )}
              </div>

              {/* Texto del item (inline markdown soportado) */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'baseline',
                  flex: 1,
                  fontFamily: TIPO.listaTexto.fontFamily,
                  fontWeight: TIPO.listaTexto.fontWeight,
                  fontSize: `${TIPO.listaTexto.fontSize}px`,
                  lineHeight: TIPO.listaTexto.lineHeight,
                  color: colorTextoItem,
                }}
              >
                {renderFragmentos(parseInlineMarkdown(item), ctx, false)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
