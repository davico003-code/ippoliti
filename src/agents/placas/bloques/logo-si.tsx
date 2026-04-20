// Logo SI Inmobiliaria — componente JSX compatible con Satori.
// Valores escalados del HTML de referencia (x2 porque el HTML estaba a 50%).
//
// Estructura: [caja verde cuadrada con "SI"] [gap] [INMOBILIARIA uppercase]
//
// Centrado óptico del "SI":
//   - Audiowide tiene baseline alto → queda un "hueco" visual abajo.
//   - Se compensa con `translateY(-0.05em)` en el span interno.
//   - La caja tiene `min-height` y `min-width` para que no se encoja con
//     glifos angostos y mantenga la proporción del HTML de referencia.

import type { ReactNode } from 'react'
import { COLORES, FUENTES, LOGO_BASE } from '../config/estilos-marca'

export interface LogoSIProps {
  /** Multiplicador sobre LOGO_BASE. Default 1 (tamaño pie de placa). */
  scale?: number
  /** true cuando la placa tiene fondo oscuro. Cambia el verde de la caja
   *  y el peso/color de INMOBILIARIA. */
  onDark?: boolean
}

export function LogoSI({ scale = 1, onDark = false }: LogoSIProps): ReactNode {
  const siFontSize = LOGO_BASE.siFontSize * scale
  const padY = LOGO_BASE.siPaddingY * scale
  const padX = LOGO_BASE.siPaddingX * scale
  const radius = LOGO_BASE.siBorderRadius * scale
  const minHeight = LOGO_BASE.siMinHeight * scale
  const minWidth = LOGO_BASE.siMinWidth * scale
  const inmoFontSize = LOGO_BASE.inmoFontSize * scale
  const gap = LOGO_BASE.gap * scale

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: `${gap}px`,
        lineHeight: 1,
      }}
    >
      {/* Caja verde con "SI" */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: onDark ? COLORES.verdeBrillante : COLORES.verdeMarca,
          padding: `${padY}px ${padX}px`,
          borderRadius: `${radius}px`,
          minHeight: `${minHeight}px`,
          minWidth: `${minWidth}px`,
          lineHeight: 1,
        }}
      >
        <span
          style={{
            display: 'flex',
            fontFamily: FUENTES.audiowide,
            fontWeight: 400,
            fontSize: `${siFontSize}px`,
            color: '#ffffff',
            lineHeight: 1,
            letterSpacing: '0.02em',
            transform: `translateY(${LOGO_BASE.siTranslateY})`,
          }}
        >
          SI
        </span>
      </div>

      {/* INMOBILIARIA */}
      <span
        style={{
          display: 'flex',
          fontFamily: FUENTES.montserrat,
          fontWeight: onDark ? 600 : 700,
          fontSize: `${inmoFontSize}px`,
          letterSpacing: LOGO_BASE.inmoLetterSpacing,
          textTransform: 'uppercase',
          color: onDark ? '#ffffff' : COLORES.ink,
          lineHeight: 1,
        }}
      >
        INMOBILIARIA
      </span>
    </div>
  )
}
