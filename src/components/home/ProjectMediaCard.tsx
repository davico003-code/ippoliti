'use client'

// Card de media para "Proyectos destacados" del home (desktop).
//
// Comportamiento:
//   - Mobile (< 768px): siempre <Image fill>. NO se descarga ningún video.
//   - Desktop (>= 768px) + videoUrl: <video muted loop autoplay> con
//     fuentes WebM + MP4. IntersectionObserver pausa cuando sale del
//     viewport para no reproducir las 4 placas al mismo tiempo.
//   - Desktop sin videoUrl: fallback a <Image>.
//
// La detección usa useMediaQuery (matchMedia + resize). SSR/hydration
// inicial siempre arranca como mobile (`isDesktop=false`) y recién
// después del mount evalúa el viewport — esto previene flash y
// garantiza zero-download en mobile real.
//
// videoUrl viene sin extensión: el componente arma `${url}.webm` + `${url}.mp4`.

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface Props {
  imageUrl: string
  videoUrl?: string
  alt: string
  sizes?: string
}

export default function ProjectMediaCard({
  imageUrl,
  videoUrl,
  alt,
  sizes = '320px',
}: Props) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const useVideo = isDesktop && !!videoUrl

  useEffect(() => {
    if (!useVideo) return
    const el = videoRef.current
    if (!el) return

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // play() puede rechazar si el navegador bloquea (raro con muted).
            // Silencioso: el poster sigue visible y nadie nota el "fallo".
            void el.play().catch(() => {})
          } else {
            el.pause()
          }
        }
      },
      { rootMargin: '100px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [useVideo])

  if (useVideo && videoUrl) {
    return (
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        autoPlay
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
