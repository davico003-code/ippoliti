'use client'

// Card de media para "Proyectos destacados" del home (desktop).
//
// Comportamiento:
//   - Mobile (< 768px): siempre <Image fill>. NO se descarga ningún video.
//   - Desktop (>= 768px) + videoUrl: <video muted loop preload="metadata">
//     PAUSADO por default, mostrando el poster. Reproduce solo durante el
//     hover del card (controlado por el padre via prop isHovering); al
//     salir el mouse, pausa y vuelve a currentTime=0.
//   - Desktop sin videoUrl: fallback a <Image>.
//
// Sin teaser visual: el hover es la única señal. La sorpresa es parte
// del diseño.

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface Props {
  imageUrl: string
  videoUrl?: string
  alt: string
  sizes?: string
  /** Hover del card padre. El padre lo controla con onMouseEnter/Leave. */
  isHovering?: boolean
}

export default function ProjectMediaCard({
  imageUrl,
  videoUrl,
  alt,
  sizes = '320px',
  isHovering = false,
}: Props) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const useVideo = isDesktop && !!videoUrl

  // Play/pause según hover del padre. Al salir, reset a frame 0.
  useEffect(() => {
    if (!useVideo) return
    const el = videoRef.current
    if (!el) return
    if (isHovering) {
      // muted + playsInline garantizan que play() no rechace en
      // Chrome/Safari sin gesture explícito.
      void el.play().catch(() => {})
    } else {
      el.pause()
      try { el.currentTime = 0 } catch { /* seek puede tirar si no hay metadata aún */ }
    }
  }, [useVideo, isHovering])

  if (useVideo && videoUrl) {
    return (
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        poster={imageUrl}
        aria-label={alt}
        className="absolute inset-0 w-full h-full object-cover emp-card-img"
      >
        <source src={`${videoUrl}.webm`} type="video/webm" />
        <source src={`${videoUrl}.mp4`} type="video/mp4" />
      </video>
    )
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      className="object-cover emp-card-img"
      sizes={sizes}
    />
  )
}
