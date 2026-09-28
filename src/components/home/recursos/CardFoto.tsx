// Foto de cabecera de cada card de la Sección 4 + pastilla de tiempo encima.
// El cuerpo blanco de la card se monta sobre el borde inferior de la foto
// (margin negativo en .body), por eso la foto lleva un poco de alto extra.

import Image from 'next/image'
import type { ReactNode } from 'react'

type Props = {
  src: string
  alt: string
  minutos: number
  /** Posición del recorte (object-position). */
  foco?: string
  /** Extra encima de la foto (ej. la tapa de la guía). */
  children?: ReactNode
}

export default function CardFoto({ src, alt, minutos, foco = 'center', children }: Props) {
  return (
    <div className="foto">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 900px) 100vw, 33vw"
        style={{ objectFit: 'cover', objectPosition: foco }}
      />
      <span className="clock">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        {minutos} min
      </span>
      {children}
    </div>
  )
}
