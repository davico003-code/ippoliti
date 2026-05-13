'use client'

import { useState } from 'react'
import Image from 'next/image'
import BarrioPlaceholderImg from './BarrioPlaceholderImg'

interface Props {
  src?: string
  nombre: string
  alt?: string
  className?: string
  priority?: boolean
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
}

export default function BarrioImage({
  src,
  nombre,
  alt,
  className,
  priority,
  fill = true,
  width,
  height,
  sizes,
}: Props) {
  const [errored, setErrored] = useState(false)
  if (!src || errored) {
    return <BarrioPlaceholderImg nombre={nombre} className={className} />
  }

  const altText = alt ?? `Vista de ${nombre} — barrio privado en Funes`
  const isSvg = src.toLowerCase().endsWith('.svg')

  // SVG placeholders provisorios: usar <img> nativo. next/image local con SVG
  // sin width/height intrínsecos rompe el optimizer; además los SVGs ya son
  // chicos y no necesitan optimización.
  if (isSvg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={altText}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`${className ?? ''} ${fill ? 'absolute inset-0 h-full w-full' : ''}`.trim()}
        onError={() => setErrored(true)}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={altText}
      className={className}
      priority={priority}
      fill={fill && !width}
      width={width}
      height={height}
      sizes={sizes ?? '(min-width: 1024px) 33vw, 100vw'}
      onError={() => setErrored(true)}
    />
  )
}
