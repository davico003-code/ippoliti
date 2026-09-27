'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

type Props = {
  /** Primer cuadro del video: se ve al instante y es el LCP. */
  poster: string
  video: string
  sizes: string
  /** Radio y margen finales de la "tarjeta" cuando el hero se va. */
  radio: number
  margen: number
  /** Velo de legibilidad (background CSS); vive dentro del recorte. */
  velo: string
}

/**
 * Fondo de la portada: la foto de siempre "cobra vida". Arranca como imagen
 * (LCP inmediato) y, cuando el video puede reproducirse, se funde con él sin
 * salto porque el póster ES su primer cuadro. Al entrar respira (zoom 1.06→1)
 * y, al scrollear, el cuadro se redondea hasta quedar como una tarjeta
 * mientras el titular sube y se desvanece. Sin pinear: el scroll nunca se traba.
 *
 * El contenido que acompaña el scroll se marca con [data-portada-contenido]
 * dentro de la misma <section>.
 */
export default function PortadaViva({ poster, video, sizes, radio, margen, velo }: Props) {
  const cuadro = useRef<HTMLDivElement>(null)
  const capa = useRef<HTMLDivElement>(null)
  const oscuro = useRef<HTMLDivElement>(null)
  const vid = useRef<HTMLVideoElement>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [vivo, setVivo] = useState(false)

  // El video se asigna recién en el cliente, cuando la página ya terminó de
  // cargar y el navegador está libre: nunca compite con la foto (LCP) ni con
  // las fotos de las propiedades. Tampoco baja si se pidió menos movimiento o
  // ahorro de datos.
  useEffect(() => {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ahorro = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    // Desktop y mobile montan su propia portada (una oculta por CSS): solo
    // la visible baja el video.
    const visible = (cuadro.current?.getClientRects().length ?? 0) > 0
    if (quieto || ahorro || !visible) return
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
    let cancelado = false
    const arrancar = () => {
      const go = () => { if (!cancelado) setSrc(video) }
      if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 2000 })
      else setTimeout(go, 300)
    }
    if (document.readyState === 'complete') arrancar()
    else window.addEventListener('load', arrancar, { once: true })
    return () => {
      cancelado = true
      window.removeEventListener('load', arrancar)
    }
  }, [video])

  // Pausa fuera de pantalla (batería) y retoma al volver.
  useEffect(() => {
    const v = vid.current
    const el = cuadro.current
    if (!v || !el || !src) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {})
      else v.pause()
    }, { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [src])

  // Scroll → tarjeta + parallax. rAF y estilos directos: cero re-renders.
  useEffect(() => {
    const el = cuadro.current
    if (!el) return
    const seccion = el.closest('section')
    const contenido = seccion?.querySelector<HTMLElement>('[data-portada-contenido]') ?? null
    let raf = 0
    const pintar = () => {
      raf = 0
      const alto = seccion?.offsetHeight || window.innerHeight
      const p = Math.min(1, Math.max(0, window.scrollY / alto))
      const t = 1 - Math.pow(1 - Math.min(1, p * 1.6), 3) // entra rápido, frena suave
      el.style.clipPath = p > 0
        ? `inset(0px ${t * margen}px ${t * margen}px ${t * margen}px round 0px 0px ${t * radio}px ${t * radio}px)`
        : ''
      // Efecto al bajar (en el preview se elige con el selector de opciones):
      //   actual → la foto baja un poco y el texto se desvanece
      //   a      → profundidad: la foto va más lento y se oscurece; texto entero
      //   b      → desenfoque tipo iPhone; texto entero
      //   c      → la foto se acerca, como entrar a la galería; texto entero
      const ef = document.documentElement.dataset.efecto || 'a'
      const c = capa.current
      if (c) {
        if (ef === 'c') c.style.transform = `translate3d(0, ${p * 6}%, 0) scale(${1 + p * 0.22})`
        else c.style.transform = `translate3d(0, ${p * (ef === 'a' ? 30 : ef === 'b' ? 10 : 18)}%, 0)`
        c.style.filter = ef === 'b' && p > 0.005 ? `blur(${(p * 14).toFixed(1)}px) brightness(${(1 - p * 0.3).toFixed(3)})` : ''
      }
      if (oscuro.current) oscuro.current.style.opacity = String(ef === 'a' ? p * 0.5 : ef === 'c' ? p * 0.3 : 0)
      if (contenido) {
        if (ef === 'actual') {
          contenido.style.transform = p > 0 ? `translate3d(0, ${-p * 90}px, 0)` : ''
          contenido.style.opacity = String(Math.max(0, 1 - p * 1.8))
        } else {
          contenido.style.transform = p > 0 ? `translate3d(0, ${-p * 40}px, 0)` : ''
          contenido.style.opacity = ''
        }
      }
    }
    const pedir = () => { if (!raf) raf = requestAnimationFrame(pintar) }
    pintar()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    window.addEventListener('si-opciones', pedir)
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      window.removeEventListener('si-opciones', pedir)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [radio, margen])

  return (
    <div ref={cuadro} aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden" style={{ willChange: 'clip-path' }}>
      <div ref={capa} className="absolute inset-0" style={{ willChange: 'transform' }}>
        <div className="portada-respira absolute inset-0">
          <Image src={poster} alt="" fill priority quality={80} sizes={sizes} className="object-cover" />
          {src && (
            <video
              ref={vid}
              src={src}
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              onPlaying={() => setVivo(true)}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ opacity: vivo ? 1 : 0, transition: 'opacity 1200ms ease' }}
            />
          )}
        </div>
      </div>
      <div className="absolute inset-0" style={{ background: velo }} />
      <div ref={oscuro} className="absolute inset-0 bg-black" style={{ opacity: 0 }} />
      <style dangerouslySetInnerHTML={{ __html: `
        .portada-respira { animation: portadaRespira 2600ms cubic-bezier(.16,1,.3,1) both; transform-origin: 50% 60%; }
        @keyframes portadaRespira { from { transform: scale(1.07); } to { transform: scale(1); } }
        .portada-in { animation: portadaIn 1100ms cubic-bezier(.16,1,.3,1) var(--d) both; }
        @keyframes portadaIn { from { opacity: 0; transform: translate3d(0, 26px, 0); filter: blur(10px); } to { opacity: 1; transform: none; filter: none; } }
        @media (prefers-reduced-motion: reduce) { .portada-respira, .portada-in { animation: none; } }
      ` }} />
    </div>
  )
}
