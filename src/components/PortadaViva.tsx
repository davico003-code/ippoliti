'use client'

// Portada viva (David, 5-oct-2026): sobre la foto de portada de las destacadas
// corre un loop corto. Desde el 2-nov son escenas de vida (se hace de noche,
// llega la familia, sale el perro). El video sale de Hilo (`portada_viva` del
// feed) y arranca y termina en la foto original.
//
// No le cuesta nada a la página: la foto pinta primero como siempre; el video
// recién se pide cuando la tarjeta entra en pantalla, se pausa al salir y
// aparece con un fundido cuando ya está corriendo (nunca un cuadro negro).
// Corre SIEMPRE (David, 2-nov-2026: "que se vean automáticamente"): no se
// apaga con "reducir movimiento" ni con ahorro de datos. Si el navegador
// frena el arranque solo (iPhone en Modo bajo consumo), se reintenta con el
// primer toque en la página.
import { useEffect, useRef, useState } from 'react'

export default function PortadaViva({ src, activa }: { src: string; activa: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [visible, setVisible] = useState(false)
  const [corriendo, setCorriendo] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 })
    io.observe(v)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (!visible || !activa) {
      v.pause()
      return
    }
    // React no siempre refleja `muted` en el elemento: sin esto iOS no
    // deja arrancar el video solo.
    v.muted = true
    if (!v.getAttribute('src')) v.setAttribute('src', src)
    const arrancar = () => v.play().catch(() => setCorriendo(false))
    arrancar()
    // Modo bajo consumo rechaza el play() automático, pero lo acepta dentro
    // de un gesto del usuario: cualquier toque o clic lo vuelve a intentar.
    const reintentar = () => {
      if (v.paused) arrancar()
    }
    const eventos = ['touchend', 'click', 'keydown'] as const
    eventos.forEach((ev) => document.addEventListener(ev, reintentar, { passive: true }))
    return () => eventos.forEach((ev) => document.removeEventListener(ev, reintentar))
  }, [visible, activa, src])

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setCorriendo(true)}
      className="absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-700"
      style={{ opacity: corriendo && activa ? 1 : 0 }}
    />
  )
}
