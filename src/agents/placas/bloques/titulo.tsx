// Bloque titulo — Raleway ultra-light (200) grande, con soporte de inline
// `*italic*` (pintado con color enfasis del tema) y `**bold**` (weight 700).
//
// Tamaños:
//   xl: 136px (default, portada)
//   lg: 112px
//   md:  92px

import type { ReactNode } from 'react'
import type { Bloque } from '../types'
import type { RenderContext } from '../config/bloques-config'
import { TIPO } from '../config/estilos-marca'
import { parseInlineMarkdown } from '../lib/inline-markdown'

type TituloBloque = Extract<Bloque, { tipo: 'titulo' }>

const TAMAÑO_PX: Record<NonNullable<TituloBloque['tamaño']>, number> = {
  xl: TIPO.titulo.fontSize, // 136
  lg: 112,
  md: 92,
}

export function renderTitulo(bloque: TituloBloque, ctx: RenderContext): ReactNode {
  const fontSize = TAMAÑO_PX[bloque.tamaño ?? 'xl']
  const fragmentos = parseInlineMarkdown(bloque.texto)

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        fontFamily: TIPO.titulo.fontFamily,
        fontWeight: 200,
        fontStyle: bloque.italica ? 'italic' : 'normal',
        fontSize: `${fontSize}px`,
        lineHeight: TIPO.titulo.lineHeight,
        letterSpacing: TIPO.titulo.letterSpacing,
        color: ctx.tema.ink,
      }}
    >
      {fragmentos.map((f, i) => {
        if (f.kind === 'bold') {
          return (
            <span
              key={i}
              style={{
                display: 'flex',
                fontWeight: 700,
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
                fontWeight: 300,
                color: ctx.tema.enfasis,
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
      })}
    </div>
  )
}
