'use client'

// Fotos de la vista previa del mapa de /propiedades (popup de la compu y
// tarjeta de abajo en el celu): se pasan con las flechas, siempre visibles, o
// con swipe, sin abrir la ficha. Es el mismo carrusel de las tarjetas del
// listado, con las mismas fotos (portada + las 2-5 del provider).
import type { CSSProperties, ReactNode } from 'react'
import FotosDeslizables from '@/components/FotosDeslizables'
import { SIZES_FOTO_LISTADO, useFotosDeLaPropiedad } from '@/components/FotosExtraCards'
import type { TokkoProperty } from '@/lib/tokko'

export default function FotosVistaPrevia({ property, alt, className, style, children }: {
  property: TokkoProperty
  alt: string
  className?: string
  style?: CSSProperties
  /** Lo que va encima de la foto (badges, cerrar, compartir). */
  children?: ReactNode
}) {
  const images = useFotosDeLaPropiedad(property)
  return (
    <FotosDeslizables
      images={images}
      alt={alt}
      sizes={SIZES_FOTO_LISTADO}
      flechasSiempre
      className={className}
      style={style}
    >
      {children}
    </FotosDeslizables>
  )
}
