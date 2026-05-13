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
  return (
    <Image
      src={src}
      alt={alt ?? `Vista de ${nombre} — barrio privado en Funes`}
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
