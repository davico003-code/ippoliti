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
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#1A5C38]">
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
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
            <span className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-[#B8935A] shadow-lg transition-transform duration-300 group-hover:scale-105">
              <Play className="h-7 w-7 md:h-8 md:w-8 text-white fill-white ml-1" />
            </span>
            <span className="text-white font-bold text-sm md:text-base drop-shadow-md">
              Ver tour 360°
            </span>
          </div>
        </button>
      )}
    </div>
  )
}
