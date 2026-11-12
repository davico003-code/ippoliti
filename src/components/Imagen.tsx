'use client'

import NextImage, { type ImageProps } from 'next/image'
import { forwardRef } from 'react'
import { esFotoR2, loaderFotoR2 } from '@/lib/fotos-fijas'

/**
 * next/image con una sola diferencia: una foto que ya está achicada en R2
 * (lib/fotos-fijas.ts) se pide directo al ancho guardado, sin pasar por el
 * optimizador de Vercel. Todo lo demás (logos, fotos de Tokko o de portales,
 * imágenes del sitio) sigue exactamente igual. Toda la web importa Image de
 * acá en vez de 'next/image'.
 */
const Imagen = forwardRef<HTMLImageElement, ImageProps>(function Imagen(props, ref) {
  return <NextImage ref={ref} {...props} {...(esFotoR2(props.src) ? { loader: loaderFotoR2 } : {})} />
})

export default Imagen
