'use client'

// Portada viva (David, 5-oct-2026): sobre la foto de portada de las destacadas
// corre un loop corto donde se mueve SOLO lo que ya está en la foto (el agua,
// un barco, las palmeras). La casa queda congelada: el video sale de Hilo
// (`portada_viva` del feed) ya compuesto sobre la foto original.
//
// No le cuesta nada a la página: la foto pinta primero como siempre; el video
// recién se pide cuando la tarjeta entra en pantalla, se pausa al salir y
// aparece con un fundido cuando ya está corriendo (nunca un cuadro negro).
// No se baja con "reducir movimiento" ni con ahorro de datos / 2G.
import { useEffect, useRef, useState } from 'react'

type Conexion = { saveData?: boolean; effectiveType?: string }

function movimientoPermitido(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
  const c = (navigator as Navigator & { connection?: Conexion }).connection
  if (c?.saveData) return false
  if (c?.effectiveType && /(^|-)2g$/.test(c.effectiveType)) return false
  return true
}

export default function PortadaViva({ src, activa }: { src: string; activa: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [permitido, setPermitido] = useState(false)
  const [visible, setVisible] = useState(false)
  const [corriendo, setCorriendo] = useState(false)

  useEffect(() => setPermitido(movimientoPermitido()), [])

  useEffect(() => {
    const v = ref.current
    if (!permitido || !v) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.5 })
    io.observe(v)
    return () => io.disconnect()
  }, [permitido])

  useEffect(() => {
    const v = ref.current
    if (!v || !permitido) return
    if (visible && activa) {
      // React no siempre refleja `muted` en el elemento: sin esto iOS no
      // deja arrancar el video solo.
      v.muted = true
      if (!v.getAttribute('src')) v.setAttribute('src', src)
      v.play().catch(() => setCorriendo(false))
    } else {
      v.pause()
    }
  }, [visible, activa, permitido, src])

  if (!permitido) return null
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
