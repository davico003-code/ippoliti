'use client'

import { useEffect, useRef } from 'react'

export default function HeroVideoDesktop() {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const setVideoRef = (node: HTMLVideoElement | null) => {
    videoRef.current = node
    if (node) {
      node.defaultMuted = true
      node.muted = true
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    // Si el autoplay falla, reintentamos en la primera interacción. resume se
    // quita a sí mismo de AMBOS eventos (antes: {once:true} dejaba colgado el
    // listener de touchstart en desktop) y el cleanup los saca al desmontar.
    const resume = () => {
      document.removeEventListener('click', resume)
      document.removeEventListener('touchstart', resume)
      video.play().catch(() => {})
    }
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        document.addEventListener('click', resume)
        document.addEventListener('touchstart', resume)
      })
    }
    return () => {
      document.removeEventListener('click', resume)
      document.removeEventListener('touchstart', resume)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute inset-0 z-0 overflow-hidden"
    >
      <video
        ref={setVideoRef}
        autoPlay
        muted
        loop
        playsInline
        // metadata (no 'auto'): el poster.webp cubre el primer frame y el
        // autoplay igual bufferea lo necesario para arrancar. Evita descargar
        // el video entero de entrada, liberando bandwidth para el LCP del home.
        preload="metadata"
        poster="/videos/hero-poster.webp"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        onLoadedData={(e) => {
          const v = e.currentTarget
          v.muted = true
          v.play().catch(() => {})
        }}
      >
        <source src="/videos/hero-desktop.mp4" type="video/mp4" />
        <source src="/videos/hero-desktop.webm" type="video/webm" />
      </video>
    </div>
  )
}
