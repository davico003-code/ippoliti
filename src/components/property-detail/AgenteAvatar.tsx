'use client'

// Burbuja del agente en la ficha (compu + celular). Si el agente tiene video
// de saludo (Seedance, arranca y termina en su foto), lo reproduce una vez al
// entrar en pantalla y después cada tanto, discreto: sin sonido ni controles,
// y quieto si el usuario pidió menos movimiento.

import { useEffect, useRef } from 'react'
import { getAgenteVideo } from '@/lib/agente-titulo'

const REPETIR_MS = 14000

export default function AgenteAvatar({
  name,
  picture,
  initials,
  bg,
  fontFamily,
}: {
  name: string
  picture: string | null | undefined
  initials: string
  bg: string
  fontFamily: string
}) {
  const video = picture ? getAgenteVideo(name) : null
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer: ReturnType<typeof setTimeout> | undefined
    let visible = false
    const play = () => {
      if (!visible) return
      el.currentTime = 0
      el.play().catch(() => {})
    }
    const onEnded = () => {
      timer = setTimeout(play, REPETIR_MS)
    }
    el.addEventListener('ended', onEnded)
    const io = new IntersectionObserver(([e]) => {
      const was = visible
      visible = e.isIntersecting
      if (visible && !was && el.paused) {
        clearTimeout(timer)
        timer = setTimeout(play, 600)
      }
    }, { threshold: 0.6 })
    io.observe(el)
    return () => {
      io.disconnect()
      clearTimeout(timer)
      el.removeEventListener('ended', onEnded)
    }
  }, [video])

  const cls = 'w-[72px] h-[72px] rounded-full object-cover flex-shrink-0 bg-gray-100'

  if (picture && video) {
    return (
      <video
        ref={ref}
        src={video}
        poster={picture}
        muted
        playsInline
        preload="metadata"
        aria-label={name}
        width={72}
        height={72}
        className={cls}
      />
    )
  }
  if (picture) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={picture} alt={name} width={72} height={72} className={cls} loading="lazy" decoding="async" />
    )
  }
  return (
    <div
      className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
      style={{ background: bg, fontFamily }}
    >
      {initials}
    </div>
  )
}
