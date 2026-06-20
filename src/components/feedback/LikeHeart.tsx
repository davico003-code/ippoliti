'use client'

// Like discreto estilo Zillow: pill translúcido con corazón outline que se
// llena rojo (#E2574C) al tocar. SIN número visible. Se usa sobre la foto
// (card del listado y portada del detalle). Convive con el play discreto en
// la esquina opuesta. Todo detrás de NEXT_PUBLIC_FEEDBACK_ENABLED.

import { useEffect, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import { FEEDBACK_ENABLED } from './flag'
import { fetchLiked, setLikedCache } from './likesStore'

const LIKE_RED = '#E2574C'

export default function LikeHeart({
  propertyId,
  className = 'absolute top-2.5 right-2.5',
  size = 36,
}: {
  propertyId: number | string
  /** Posicionamiento (absolute …) controlado por el contenedor. */
  className?: string
  size?: number
}) {
  const id = String(propertyId)
  const [liked, setLiked] = useState(false)
  const pending = useRef(false)

  useEffect(() => {
    if (!FEEDBACK_ENABLED) return
    let cancelled = false
    fetchLiked(id).then((v) => {
      if (!cancelled) setLiked(v)
    })
    return () => {
      cancelled = true
    }
  }, [id])

  if (!FEEDBACK_ENABLED) return null

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (pending.current) return
    pending.current = true
    const optimistic = !liked
    setLiked(optimistic)
    setLikedCache(id, optimistic)

    fetch('/api/feedback/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: Number(id) }),
      credentials: 'same-origin',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.liked === 'boolean') {
          setLiked(d.liked)
          setLikedCache(id, d.liked)
        }
      })
      .catch(() => {
        setLiked(!optimistic)
        setLikedCache(id, !optimistic)
      })
      .finally(() => {
        pending.current = false
      })
  }

  return (
    <button
      type="button"
      aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
      aria-pressed={liked}
      onClick={toggle}
      className={`${className} flex items-center justify-center rounded-full bg-white/95 backdrop-blur shadow-sm hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5C38]`}
      style={{ width: size, height: size }}
    >
      <Heart
        className="transition-colors"
        style={{
          width: Math.round(size * 0.5),
          height: Math.round(size * 0.5),
          color: liked ? LIKE_RED : '#374151',
          fill: liked ? LIKE_RED : 'transparent',
        }}
        strokeWidth={2}
      />
    </button>
  )
}
