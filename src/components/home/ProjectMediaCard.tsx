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
// La invitación visual (botón circular play/pause en bottom-right con
// pulse suave) la renderiza este mismo componente, así el padre solo
// pasa isHovering y no se ocupa del overlay interactivo.

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

  return (
    <>
      {useVideo && videoUrl ? (
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
      ) : (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover emp-card-img"
          sizes={sizes}
        />
      )}

      {/* Invitación visual: badge circular bottom-right con play/pause.
          Solo se renderiza si hay video real (no en mobile, no si la card
          es solo imagen). pointer-events: none — es decorativo; el click
          va al Link padre. */}
      {useVideo && (
        <div
          aria-hidden
          className="emp-card-cta absolute bottom-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
            transition: 'opacity 200ms',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          {isHovering ? (
            // Pausa: dos rectángulos verticales finos
            <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden>
              <rect x="0" y="0" width="3.5" height="12" rx="0.5" fill="#1A5C38" />
              <rect x="7.5" y="0" width="3.5" height="12" rx="0.5" fill="#1A5C38" />
            </svg>
          ) : (
            // Play: triángulo verde con ligero offset hacia la derecha para
            // que se vea centrado ópticamente (el centro geométrico de un
            // triángulo apuntando derecha está a la izquierda del óptico).
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden style={{ marginLeft: 1 }}>
              <path d="M2 1 L11 6 L2 11 Z" fill="#1A5C38" />
            </svg>
          )}
        </div>
      )}
    </>
  )
}
