'use client'

// Medios de /como-trabajamos que necesitan estado:
// - VideoVivo: video propio mudo en loop que arranca recién al entrar en
//   pantalla (preload none + IntersectionObserver) para no bajar MB de más.
//   Con `conSonido` suma un botón para activar el audio (placas con voz).
// - ShortYoutube: póster vertical de un Short; al tocar se abre en el visor.

import { useEffect, useRef, useState } from 'react'
import { Play, Volume2, VolumeX } from 'lucide-react'
import VisorYoutube from './VisorYoutube'

export function VideoVivo({
  src,
  poster,
  etiqueta,
  conSonido = false,
  className = '',
}: {
  src: string
  poster: string
  etiqueta: string
  conSonido?: boolean
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [mudo, setMudo] = useState(true)

  useEffect(() => {
    const v = ref.current
    if (!v || typeof IntersectionObserver === 'undefined') return
    // React no siempre refleja `muted` al hidratar; sin él el navegador
    // bloquea el autoplay. Lo fijamos a mano antes de reproducir.
    v.muted = true
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.25 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  return (
    // Posición: la define quien lo usa (hoy siempre `absolute inset-0` dentro
    // de un marco con aspect-ratio). Si se sumara `relative` acá, le gana a
    // `absolute` en la cascada de Tailwind y el video queda con alto 0.
    <div className={`overflow-hidden bg-black ${className || 'relative'}`}>
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster={poster}
        muted={mudo}
        loop
        playsInline
        preload="none"
        aria-label={etiqueta}
      />
      {conSonido && (
        <button
          type="button"
          onClick={() => {
            const v = ref.current
            setMudo((m) => !m)
            if (v) {
              v.muted = !mudo
              v.play().catch(() => {})
            }
          }}
          aria-label={mudo ? 'Activar sonido' : 'Silenciar'}
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full text-white"
          style={{ background: 'rgba(14,53,33,.78)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        >
          {mudo ? <VolumeX size={19} aria-hidden /> : <Volume2 size={19} aria-hidden />}
        </button>
      )}
    </div>
  )
}

export function ShortYoutube({ id, titulo }: { id: string; titulo: string }) {
  return (
    <VisorYoutube id={id} titulo={titulo} vertical className="aspect-[9/16] rounded-[18px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full scale-[1.02] object-cover transition-transform duration-300 group-hover:scale-[1.07]"
      />
      <span aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,0) 45%)' }} />
      <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-xl">
        <Play size={20} fill="#1A5C38" stroke="#1A5C38" aria-hidden style={{ marginLeft: 3 }} />
      </span>
      <span className="absolute bottom-3 left-3 right-3 text-[13px] font-bold leading-snug text-white">{titulo}</span>
    </VisorYoutube>
  )
}
