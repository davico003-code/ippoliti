'use client'

// Like discreto estilo Zillow (diseño v4 FINAL): pill translúcido con corazón
// outline que se llena rojo (#E2574C) al tocar. SIN número visible. Se usa
// sobre la foto (card del listado y portada del detalle). En la card convive
// con el play discreto en la esquina opuesta. Todo detrás del flag.
//
// Specs (_referencias/feedback/feedback-SI-v4-final.html, .like-btn):
//   34px · bg rgba(255,255,255,.85) · blur(2px) · shadow 0 1px 5px rgba(0,0,0,.18)
//   svg 18px · stroke #24292B (carbón) · on → fill+stroke #E2574C · active scale(.9)

import { useEffect, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import { FEEDBACK_ENABLED } from './flag'
import { fetchLiked, setLikedCache } from './likesStore'

const LIKE_RED = '#E2574C'
const CARBON = '#24292B'

export default function LikeHeart({
  propertyId,
  className = 'absolute top-2.5 right-2.5',
  size = 34,
}: {
  propertyId: number | string
  /** Posicionamiento (absolute …) controlado por el contenedor. */
  className?: string
  size?: number
}) {
  const id = String(propertyId)
  const [liked, setLiked] = useState(false)
  const [bump, setBump] = useState(false)
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
    setBump(true)
    setTimeout(() => setBump(false), 180)

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

  const icon = Math.round(size * 0.53)

  return (
    <button
      type="button"
      aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
      aria-pressed={liked}
      onClick={toggle}
      className={`${className} grid place-items-center rounded-full border-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5C38]`}
      style={{
        width: size,
        height: size,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        boxShadow: '0 1px 5px rgba(0,0,0,0.18)',
        transform: bump ? 'scale(0.9)' : 'scale(1)',
        transition: 'transform 0.18s',
      }}
    >
      <Heart
        style={{
          width: icon,
          height: icon,
          color: liked ? LIKE_RED : CARBON,
          fill: liked ? LIKE_RED : 'transparent',
          transition: 'fill 0.2s, color 0.2s',
        }}
        strokeWidth={2}
      />
    </button>
  )
}
