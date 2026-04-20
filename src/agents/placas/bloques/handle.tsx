// Bloque handle — el handle de Instagram dentro del body de una placa
// (típicamente la CTA final). Raleway bold 34px. Color ink estándar.
//
// Distinto del meta_foot del chrome: meta_foot es pequeño abajo a la
// derecha del logo. Este handle es un texto destacado dentro del body.

import type { ReactNode } from 'react'
import type { Bloque } from '../types'
import type { RenderContext } from '../config/bloques-config'
import { FUENTES } from '../config/estilos-marca'

type HandleBloque = Extract<Bloque, { tipo: 'handle' }>

export function renderHandle(bloque: HandleBloque, ctx: RenderContext): ReactNode {
  return (
    <div style={{ display: 'flex' }}>
      <span
        style={{
          display: 'flex',
          fontFamily: FUENTES.raleway,
          fontWeight: 700,
          fontSize: '34px',
          letterSpacing: '0.02em',
          color: ctx.tema.acento,
        }}
      >
        {bloque.texto}
      </span>
    </div>
  )
}
