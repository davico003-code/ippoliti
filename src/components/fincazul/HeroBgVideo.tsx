'use client'

// Video de fondo del hero de Fincazul: autoplay, muteado, en loop e inline.
// Muestra el póster (primer frame) hasta que el video puede reproducir, así el
// impacto de entrada aparece sin flash negro ni salto de layout.

import { useEffect, useRef, useState } from 'react'

export default function HeroBgVideo({ poster, mp4 }: { poster: string; mp4: string }) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = true
    v.play().catch(() => {})
  }, [])

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      onCanPlay={() => setReady(true)}
      className="absolute inset-0 h-full w-full object-cover"
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 600ms ease' }}
      aria-hidden="true"
    >
      <source src={mp4} type="video/mp4" />
    </video>
  )
}
