'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'

interface Tour360Props {
  url: string
  poster?: string
  titulo?: string
}

export default function Tour360({ url, poster, titulo }: Tour360Props) {
  const [activo, setActivo] = useState(false)

  return (
    <div className="relative w-full aspect-video overflow-hidden bg-[#1A5C38] shadow-lg md:rounded-2xl">
      {activo ? (
        <iframe
          src={url}
          title={titulo ?? 'Tour virtual 360°'}
          className="absolute inset-0 h-full w-full"
          allow="fullscreen; accelerometer; gyroscope; magnetometer; vr; xr; xr-spatial-tracking; autoplay; camera; microphone"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActivo(true)}
          aria-label={`Ver tour 360°${titulo ? ` de ${titulo}` : ''}`}
          className="group absolute inset-0 h-full w-full"
        >
          {poster && (
            <Image
              src={poster}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority={false}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/40 group-hover:from-black/70 group-hover:via-black/40 group-hover:to-black/50 transition-colors" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4">
            <span className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-[#B8935A] shadow-2xl ring-4 ring-white/20 transition-transform duration-300 group-hover:scale-105">
              <Play className="h-8 w-8 md:h-10 md:w-10 text-white fill-white ml-1" />
            </span>
            <span className="text-white font-bold text-base md:text-xl drop-shadow-lg tracking-wide">
              Ver tour 360°
            </span>
          </div>
        </button>
      )}
    </div>
  )
}
