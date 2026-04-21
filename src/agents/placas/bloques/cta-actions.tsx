// Bloque cta-actions — 3 acciones en grid (Like / Compartilo / Seguinos).
// La acción "destacada" (default: seguir, la tercera) se pinta como bloque
// highlight con fondo verde-profundo + textos blancos.
//
// Icons: SVG inline con viewBox 0 0 32 32, stroke-width 1.5 round. Son los
// mismos glifos del HTML de referencia.

import type { ReactNode } from 'react'
import type { Bloque } from '../types'
import type { RenderContext } from '../config/bloques-config'
import { COLORES, LAYOUT, TIPO } from '../config/estilos-marca'

type CtaActionsBloque = Extract<Bloque, { tipo: 'cta-actions' }>

type Accion = {
  id: 'like' | 'compartir' | 'seguir'
  num: string
  titulo: string
  desc: string
}

function HeartIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 27 C 4 19, 4 9, 11 7 C 14 6, 16 9, 16 11 C 16 9, 18 6, 21 7 C 28 9, 28 19, 16 27 Z" />
    </svg>
  )
}

function ShareIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 16 L 28 4 L 22 28 L 14 18 Z" />
      <path d="M14 18 L 28 4" />
    </svg>
  )
}

function FollowIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={13} cy={11} r={5} />
      <path d="M4 27 C 4 21, 8 18, 13 18 C 17 18, 20 19, 22 22" />
      <path d="M24 22 L 24 30 M 20 26 L 28 26" />
    </svg>
  )
}

type AccionSinIcon = Omit<Accion, 'icon'> & {
  renderIcon: (color: string) => ReactNode
}

const ACCIONES_BASE: readonly AccionSinIcon[] = [
  {
    id: 'like',
    num: '01',
    titulo: 'Dale like',
    desc: 'Si te sumó algo.',
    renderIcon: color => <HeartIcon color={color} size={LAYOUT.ctaIconSize} />,
  },
  {
    id: 'compartir',
    num: '02',
    titulo: 'Compartilo',
    desc: 'Con quien le sirva.',
    renderIcon: color => <ShareIcon color={color} size={LAYOUT.ctaIconSize} />,
  },
  {
    id: 'seguir',
    num: '03',
    titulo: 'Seguinos',
    desc: 'Para más data inmobiliaria.',
    renderIcon: color => <FollowIcon color={color} size={LAYOUT.ctaIconSize} />,
  },
] as const

export function renderCtaActions(bloque: CtaActionsBloque, ctx: RenderContext): ReactNode {
  const destacado = bloque.destacado ?? 'seguir'

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        paddingTop: `${LAYOUT.ctaActionsPaddingTop}px`,
        borderTop: `${LAYOUT.borderWidth}px solid ${ctx.tema.linea}`,
      }}
    >
      {ACCIONES_BASE.map((accion, i) => {
        const esHighlight = accion.id === destacado
        const esPrimera = i === 0
        const esUltima = i === ACCIONES_BASE.length - 1

        // Colores dinámicos según fondo + highlight
        const iconColor = esHighlight ? '#ffffff' : ctx.tema.acento
        const numColor = esHighlight ? 'rgba(255,255,255,0.6)' : ctx.tema.muted
        const titleColor = esHighlight ? '#ffffff' : ctx.tema.ink
        const descColor = esHighlight
          ? 'rgba(255,255,255,0.85)'
          : ctx.fondo === 'verde-profundo'
            ? 'rgba(255,255,255,0.72)'
            : '#555555'
        const iconNode = accion.renderIcon(iconColor)

        return (
          <div
            key={accion.id}
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              gap: '16px',
              paddingRight: esUltima ? '0' : `${LAYOUT.ctaActionPadding}px`,
              paddingLeft: esPrimera ? '0' : `${LAYOUT.ctaActionPadding}px`,
              borderRight: esUltima
                ? '0'
                : `${LAYOUT.borderWidth}px solid ${ctx.tema.linea}`,
              // Si es highlight, pintar el fondo (valores del HTML ref x2)
              // En fondo oscuro usamos verdeBrillante para que el bloque contraste.
              ...(esHighlight && {
                background:
                  ctx.fondo === 'verde-profundo'
                    ? COLORES.verdeBrillante
                    : COLORES.verdeProfundo,
                borderRadius: '8px',
                padding: '20px 16px',
                // Margen negativo solo horizontal — no pelea con el vertical
                marginLeft: '-12px',
                marginRight: '-12px',
                borderRight: '0',
              }),
            }}
          >
            <div style={{ display: 'flex' }}>{iconNode}</div>
            <span
              style={{
                display: 'flex',
                fontFamily: TIPO.ctaNumero.fontFamily,
                fontWeight: TIPO.ctaNumero.fontWeight,
                fontSize: `${TIPO.ctaNumero.fontSize}px`,
                letterSpacing: TIPO.ctaNumero.letterSpacing,
                color: numColor,
              }}
            >
              {accion.num}
            </span>
            <span
              style={{
                display: 'flex',
                fontFamily: TIPO.ctaTitulo.fontFamily,
                fontWeight: TIPO.ctaTitulo.fontWeight,
                fontSize: `${TIPO.ctaTitulo.fontSize}px`,
                lineHeight: TIPO.ctaTitulo.lineHeight,
                color: titleColor,
              }}
            >
              {accion.titulo}
            </span>
            <span
              style={{
                display: 'flex',
                fontFamily: TIPO.ctaDesc.fontFamily,
                fontWeight: TIPO.ctaDesc.fontWeight,
                fontSize: `${TIPO.ctaDesc.fontSize}px`,
                lineHeight: TIPO.ctaDesc.lineHeight,
                color: descColor,
              }}
            >
              {accion.desc}
            </span>
          </div>
        )
      })}
    </div>
  )
}
