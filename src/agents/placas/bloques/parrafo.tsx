// Bloque parrafo — texto corrido con 4 tamaños y soporte inline de
// **bold** / *italic*. Los *italic* se pintan con ctx.tema.enfasis (verde
// de marca) como marca editorial — mismo patrón del título.
//
// Tamaños:
//   sm: 24px  Raleway 400 — texto secundario, notas
//   md: 30px  Raleway 400 — cuerpo default (TIPO.cuerpo)
//   lg: 38px  Raleway 300 italic — bajada tipo "Comprás un terreno..."
//   xl: 56px  Raleway 300 — texto-desc, acompaña dato shock

import type { ReactNode } from 'react'
import type { Bloque } from '../types'
import type { RenderContext } from '../config/bloques-config'
import { FUENTES } from '../config/estilos-marca'
import { parseInlineMarkdown } from '../lib/inline-markdown'

type ParrafoBloque = Extract<Bloque, { tipo: 'parrafo' }>

type Preset = {
  fontSize: number
  lineHeight: number
  fontWeight: 200 | 300 | 400 | 500 | 600
  letterSpacing?: string
  italicaDefault?: boolean
}

const PRESETS: Record<NonNullable<ParrafoBloque['tamaño']>, Preset> = {
  sm: { fontSize: 24, lineHeight: 1.5, fontWeight: 400 },
  md: { fontSize: 30, lineHeight: 1.45, fontWeight: 400 },
  lg: { fontSize: 38, lineHeight: 1.38, fontWeight: 300, italicaDefault: true },
  xl: { fontSize: 56, lineHeight: 1.22, fontWeight: 300, letterSpacing: '-0.012em' },
}

export function renderParrafo(bloque: ParrafoBloque, ctx: RenderContext): ReactNode {
  const preset = PRESETS[bloque.tamaño ?? 'md']
  const italicaBase = bloque.italica ?? preset.italicaDefault ?? false
  const fragmentos = parseInlineMarkdown(bloque.texto)
  const colorBase =
    ctx.fondo === 'verde-profundo' ? '#ffffff' : '#2a2a2a'

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        maxWidth: '96%',
        fontFamily: FUENTES.raleway,
        fontWeight: preset.fontWeight,
        fontStyle: italicaBase ? 'italic' : 'normal',
        fontSize: `${preset.fontSize}px`,
        lineHeight: preset.lineHeight,
        letterSpacing: preset.letterSpacing ?? 'normal',
        color: colorBase,
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
                // Si el párrafo base es italic, el bold vuelve a normal (patrón
                // editorial: "Comprás un **terreno en Funes**" = normal weight 700)
                fontStyle: italicaBase ? 'normal' : 'normal',
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
