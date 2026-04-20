// Logo SI Inmobiliaria — componente JSX compatible con Satori.
//
// Estructura:
//   [cuadrado verde con "SI" en Audiowide blanco] [INMOBILIARIA en Montserrat]
//
// Centrado óptico del "SI":
//   - El glifo de Audiowide tiene baseline alto que deja un "hueco" visual
//     en la parte inferior del cuadrado. Lo compensamos con `translateY(-0.05em)`
//     sobre el span interno. Mismo truco que el del HTML de referencia.
//   - El cuadrado usa display:flex + align/justify center + padding simétrico
//     + line-height:1 para eliminar cualquier otro desplazamiento.
//
// Escalado: el componente acepta `scale` (1 = tamaño base del config, 0.5,
// 0.75, 1.5, etc.). Todos los valores numéricos se multiplican; letter-spacing
// y transform quedan relativos.
//
// `onDark` cambia el peso de INMOBILIARIA (700 sobre claro / 600 sobre oscuro)
// y su color de texto (negro / blanco).

import type { ReactNode } from 'react'
import { COLORES, FUENTES, LOGO_BASE } from '../config/estilos-marca'

export interface LogoSIProps {
  /** Multiplicador sobre LOGO_BASE. Default 1. */
  scale?: number
  /** true cuando la placa tiene fondo oscuro (ajusta peso + color INMOBILIARIA) */
  onDark?: boolean
}

export function LogoSI({ scale = 1, onDark = false }: LogoSIProps): ReactNode {
  const siFontSize = LOGO_BASE.siFontSize * scale
  const padY = LOGO_BASE.siPaddingY * scale
  const padX = LOGO_BASE.siPaddingX * scale
  const radius = LOGO_BASE.siBorderRadius * scale
  const inmoFontSize = LOGO_BASE.inmoFontSize * scale
  const gap = LOGO_BASE.gap * scale

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: `${gap}px`,
      }}
    >
      {/* Caja verde con "SI" */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORES.verdeMarca,
          padding: `${padY}px ${padX}px`,
          borderRadius: `${radius}px`,
          lineHeight: 1,
        }}
      >
        <span
          style={{
            display: 'flex',
            fontFamily: FUENTES.audiowide,
            fontWeight: 400, // único peso de Audiowide
            fontSize: `${siFontSize}px`,
            color: '#ffffff',
            lineHeight: 1,
            letterSpacing: '0.02em',
            // Compensación baseline de Audiowide — crítico para centrado óptico
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
