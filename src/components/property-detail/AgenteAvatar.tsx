'use client'

// Burbuja del agente (ficha y cards de la home). Si el agente tiene video de
// saludo (Seedance, arranca y termina en su foto) va directo el video, sin
// foto previa, y se repite con pausas al azar: sin sonido ni controles.

import { useEffect, useRef } from 'react'
import { getImageProps } from 'next/image'
import { getAgenteVideo } from '@/lib/agente-titulo'

const VELOCIDAD = 0.85
const PAUSA_MIN_MS = 3000
const PAUSA_MAX_MS = 8000
const ARRANQUE_MAX_MS = 2500

export default function AgenteAvatar({
  name,
  picture,
  initials,
  bg,
  fontFamily,
  size = 96,
  className = '',
  conFoto = false,
}: {
  name: string
  picture: string | null | undefined
  initials: string
  bg: string
  fontFamily: string
  size?: number
  className?: string
  /**
   * La foto de portada mientras el video carga (el video arranca en esa misma
   * foto, así que no se nota el cambio). Para las fotos grandes de la
   * selección: sin portada se veía un círculo gris hasta que bajaba.
   */
  conFoto?: boolean
}) {
  const video = picture ? getAgenteVideo(name) : null
  // La foto original pesa 200-330 KB; para un círculo de 96 px alcanza la
  // versión optimizada de next/image (~3 KB).
  const foto = picture ? getImageProps({ src: picture, alt: name, width: size, height: size }).props : null
  const ref = useRef<HTMLVideoElement>(null)

  // El video se baja recién cuando la burbuja está por entrar en pantalla: la
  // home y la ficha renderizan versión compu + celular (una oculta) y los
  // carruseles tienen cards fuera de vista; así nada de eso descarga video.
  // Para que no se note el loop, el gesto va un poco más lento y entre
  // repeticiones queda quieto un rato al azar, como una persona. `muted` se
  // fuerza por JS porque React no siempre lo deja en el HTML del servidor y
  // sin él el navegador bloquea el autoplay. Con "reducir movimiento" no se
  // reproduce. Fuera de pantalla se pausa: en /propiedades hay una pastilla por
  // tarjeta y, al bajar por la lista, quedaban decenas de videos repitiéndose
  // fuera de vista (batería y CPU del celular).
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.muted = true
    el.defaultPlaybackRate = el.playbackRate = VELOCIDAD
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let timer: ReturnType<typeof setTimeout> | undefined
    let visible = false
    let cargado = false
    const reproducirEn = (ms: number) => {
      clearTimeout(timer)
      if (quieto) return
      timer = setTimeout(() => {
        if (!visible) return
        if (el.ended) el.currentTime = 0
        el.play().catch(() => {})
      }, ms)
    }
    const onEnded = () => reproducirEn(PAUSA_MIN_MS + Math.random() * (PAUSA_MAX_MS - PAUSA_MIN_MS))
    el.addEventListener('ended', onEnded)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (!visible) {
        clearTimeout(timer)
        el.pause()
        return
      }
      if (!cargado) {
        cargado = true
        el.preload = 'auto'
        el.load()
      }
      // Arranque desfasado: si hay varias burbujas del mismo agente a la vista
      // (home), no saludan todas a la vez.
      if (el.paused) reproducirEn(Math.random() * ARRANQUE_MAX_MS)
    }, { rootMargin: '300px' })
    io.observe(el)
    return () => {
      io.disconnect()
      clearTimeout(timer)
      el.removeEventListener('ended', onEnded)
    }
  }, [video])

  const cls = `rounded-full object-cover flex-shrink-0 bg-gray-100 ${className}`
  const dim = { width: size, height: size }

  if (foto && video) {
    return (
      <video
        ref={ref}
        src={video}
        muted
        playsInline
        preload="none"
        poster={conFoto ? foto.src : undefined}
        aria-label={name}
        width={size}
        height={size}
        className={cls}
        style={dim}
      />
    )
  }
  if (foto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img {...foto} className={cls} style={dim} />
    )
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
      style={{ ...dim, background: bg, fontFamily, fontSize: Math.round(size * 0.21) }}
    >
      {initials}
    </div>
  )
}
