'use client'

// Video de fondo del hero de Fincazul: autoplay, muteado, en loop e inline.
// Muestra el póster (primer frame) hasta que el video puede reproducir, así el
// impacto de entrada aparece sin flash negro ni salto de layout.
//
// El MP4 es pesado (~15MB), así que NO lo bajamos con preload="auto": solo lo
// cargamos cuando el hero está en viewport y el usuario no pidió menos
// movimiento ni ahorro de datos. En esos casos queda el póster (imagen liviana).

import { useEffect, useRef, useState } from 'react'

export default function HeroBgVideo({ poster, mp4 }: { poster: string; mp4: string }) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const [ready, setReady] = useState(false)
  const [load, setLoad] = useState(false)

  useEffect(() => {
    // Respetar preferencia de menos movimiento y modo ahorro de datos: dejamos
    // el póster y no bajamos los 15MB.
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
    if (reduce || nav.connection?.saveData) return

    const v = ref.current
    if (!v) return
    // Cargar el video solo cuando el hero entra en viewport.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!load) return
    const v = ref.current
    if (!v) return
    v.muted = true
    v.load()
    v.play().catch(() => {})
  }, [load])

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      onCanPlay={() => setReady(true)}
      className="absolute inset-0 h-full w-full object-cover"
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 600ms ease' }}
      aria-hidden="true"
    >
      {load && <source src={mp4} type="video/mp4" />}
    </video>
  )
}
