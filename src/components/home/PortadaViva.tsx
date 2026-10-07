'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

type Props = {
  /** Primer cuadro del video: se ve al instante y es el LCP. */
  poster: string
  video: string
  sizes: string
  /** Velo de legibilidad (background CSS); vive dentro del recorte. */
  velo: string
}

/**
 * Fondo de la portada: la foto de siempre "cobra vida". Arranca como imagen
 * (LCP inmediato) y, cuando el video puede reproducirse, se funde con él sin
 * salto porque el póster ES su primer cuadro. Al entrar respira (zoom 1.06→1)
 * y, al scrollear, la foto se desenfoca y oscurece (estilo iPhone)
 * mientras el titular sube entero. Sin pinear: el scroll nunca se traba.
 *
 * El contenido que acompaña el scroll se marca con [data-portada-contenido]
 * dentro de la misma <section>.
 */
export default function PortadaViva({ poster, video, sizes, velo }: Props) {
  const cuadro = useRef<HTMLDivElement>(null)
  const capa = useRef<HTMLDivElement>(null)
  const vid = useRef<HTMLVideoElement>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [vivo, setVivo] = useState(false)
  const pausaPropia = useRef(false)

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

  // Pausa fuera de pantalla (batería) y retoma al volver. Si Safari no lo deja
  // correr (Modo de bajo consumo), vuelve la foto: nunca un cuadro congelado.
  useEffect(() => {
    const v = vid.current
    const el = cuadro.current
    if (!v || !el || !src) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => setVivo(false))
      else {
        pausaPropia.current = true
        v.pause()
      }
    }, { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [src])

  // Scroll → desenfoque + parallax. rAF y estilos directos: cero re-renders.
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
      // Al bajar: la foto se desenfoca y oscurece (estilo iPhone) y baja un
      // poco más lento que la página; el titular y el buscador suben enteros.
      const c = capa.current
      if (c) {
        c.style.transform = `translate3d(0, ${p * 10}%, 0)`
        c.style.filter = p > 0.005 ? `blur(${(p * 14).toFixed(1)}px) brightness(${(1 - p * 0.3).toFixed(3)})` : ''
      }
      if (contenido) contenido.style.transform = p > 0 ? `translate3d(0, ${-p * 40}px, 0)` : ''
    }
    const pedir = () => { if (!raf) raf = requestAnimationFrame(pintar) }
    pintar()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={cuadro} aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
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
              disablePictureInPicture
              disableRemotePlayback
              tabIndex={-1}
              onPlaying={() => {
                pausaPropia.current = false
                setVivo(true)
              }}
              // Una pausa que no pedimos (Safari en bajo consumo la corta
              // sola): fundido de vuelta a la foto.
              onPause={() => {
                if (!pausaPropia.current) setVivo(false)
              }}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              style={{ opacity: vivo ? 1 : 0, transition: 'opacity 1200ms ease' }}
            />
          )}
        </div>
      </div>
      <div className="absolute inset-0" style={{ background: velo }} />
      <style dangerouslySetInnerHTML={{ __html: `
        .portada-respira { animation: portadaRespira 2600ms cubic-bezier(.16,1,.3,1) both; transform-origin: 50% 60%; }
        @keyframes portadaRespira { from { transform: scale(1.07); } to { transform: scale(1); } }
        .portada-in { animation: portadaIn 1100ms cubic-bezier(.16,1,.3,1) var(--d) both; }
        /* Safari recorta al borde de la caja mientras corre el blur: sin este
           aire se cortaba la "g" de "hogar" y la sombra dibujaba recuadros.
           El margen negativo devuelve el espacio, así no cambia el layout. */
        .portada-palabra { padding: .3em .35em .4em; margin: -.3em calc(var(--sep, .24em) - .35em) -.4em -.35em; }
        .portada-palabra:last-child { margin-right: -.35em; }
        @keyframes portadaIn { from { opacity: 0; transform: translate3d(0, 26px, 0); filter: blur(10px); } to { opacity: 1; transform: none; filter: none; } }
        @media (prefers-reduced-motion: reduce) { .portada-respira, .portada-in { animation: none; } }
      ` }} />
    </div>
  )
}
