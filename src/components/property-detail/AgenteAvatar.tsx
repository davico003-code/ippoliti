'use client'

// Burbuja del agente en la ficha (compu + celular). Si el agente tiene video
// de saludo (Seedance, arranca y termina en su foto) va directo el video en
// loop, sin foto previa: sin sonido ni controles, y quieto si el usuario pidió
// menos movimiento.

import { useEffect, useRef } from 'react'
import { getImageProps } from 'next/image'
import { getAgenteVideo } from '@/lib/agente-titulo'

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

  // React no siempre deja el atributo `muted` en el HTML del servidor y sin él
  // el navegador bloquea el autoplay: lo forzamos al montar. Con "reducir
  // movimiento" queda quieto en su primer cuadro.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.muted = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) el.pause()
    else el.play().catch(() => {})
  }, [video])

  const cls = 'w-24 h-24 rounded-full object-cover flex-shrink-0 bg-gray-100'

  if (foto && video) {
    return (
      <video
        ref={ref}
        src={video}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
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
