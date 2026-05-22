'use client'

// Embed de YouTube con lazy load: arranca como póster + botón de play,
// y recién al click monta el iframe (con autoplay=1 para que reproduzca
// solo). Evita cargar ~1MB de JS de YouTube en cada visita.
//
// El componente acepta className para que el consumidor configure
// aspect-ratio, ancho, radius y sombra desde el padre. Por default
// usa la maxresdefault de YouTube como póster.

import { useState } from 'react'

interface Props {
  videoId: string
  title: string
  poster?: string
  className?: string
}

export default function YoutubeEmbed({ videoId, title, poster, className }: Props) {
  const [loaded, setLoaded] = useState(false)
  const posterUrl = poster ?? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`

  if (loaded) {
    return (
      <div className={`${className ?? ''} relative bg-black`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      aria-label={`Reproducir: ${title}`}
      className={`${className ?? ''} group relative block bg-black p-0 cursor-pointer border-0`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterUrl}
        alt={title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Velado para destacar el botón sobre posters muy claros */}
      <div className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(2px)' }}
        >
          {/* Triángulo de play — color SI green, offset óptico hacia la derecha */}
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden style={{ marginLeft: 4 }}>
            <path d="M3 1 L24 13 L3 25 Z" fill="#1A5C38" />
          </svg>
        </div>
      </div>
    </button>
  )
}
