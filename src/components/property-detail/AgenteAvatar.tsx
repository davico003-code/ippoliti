'use client'

// Burbuja del agente en la ficha (compu + celular). Si el agente tiene video
// de saludo (Seedance, arranca y termina en su foto), lo reproduce una vez al
// entrar en pantalla y después cada tanto, discreto: sin sonido ni controles,
// y quieto si el usuario pidió menos movimiento.

import { useEffect, useRef } from 'react'
import { getImageProps } from 'next/image'
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
  // La foto original pesa 200-330 KB; para un círculo de 96 px alcanza la
  // versión optimizada de next/image (~10 KB).
  const foto = picture ? getImageProps({ src: picture, alt: name, width: 96, height: 96 }).props : null
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

  const cls = 'w-24 h-24 rounded-full object-cover flex-shrink-0 bg-gray-100'

  if (foto && video) {
    return (
      <video
        ref={ref}
        src={video}
        poster={foto.src}
        muted
        playsInline
        preload="metadata"
        aria-label={name}
        width={96}
        height={96}
        className={cls}
      />
    )
  }
  if (foto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img {...foto} className={cls} />
    )
  }
  return (
    <div
      className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
      style={{ background: bg, fontFamily }}
    >
      {initials}
    </div>
  )
}
