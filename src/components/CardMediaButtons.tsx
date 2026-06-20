'use client'

// Cluster de acciones sobre la foto de una card: play (escuchar resumen) + like
// discreto, JUNTOS en el extremo superior derecho. Tamaño configurable (`size`)
// para que sea proporcional a cada card.
//
// audioUrl:
//   - string  → hay audio conocido server-side (ej. listado enriquecido).
//   - null    → se sabe que NO hay audio (no se muestra el play).
//   - undefined → no se conoce; se resuelve client-side por lote
//     (/api/audio/urls) — caso home "Nuestra selección" (ISR, sin Redis en render).
//
// El play solo aparece si hay audio. El like se auto-oculta si el flag de
// feedback está off (LikeHeart).

import { useEffect, useState } from 'react'
import { PlayAudioButton } from '@/components/audio/AudioPlayerProvider'
import { fetchAudioUrl } from '@/components/audio/audioUrlStore'
import LikeHeart from '@/components/feedback/LikeHeart'

export default function CardMediaButtons({
  propertyId,
  audioUrl,
  size = 34,
  className = 'absolute top-2.5 right-2.5',
}: {
  propertyId: number
  audioUrl?: string | null
  size?: number
  /** Posición del cluster sobre la foto. */
  className?: string
}) {
  const known = audioUrl !== undefined
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(known ? (audioUrl ?? null) : null)

  useEffect(() => {
    if (known) return
    let cancelled = false
    fetchAudioUrl(propertyId).then((u) => {
      if (!cancelled) setResolvedUrl(u)
    })
    return () => {
      cancelled = true
    }
  }, [propertyId, known])

  return (
    <div className={`${className} flex items-center`} style={{ gap: Math.round(size * 0.18) }}>
      {resolvedUrl && (
        <PlayAudioButton propertyId={propertyId} audioUrl={resolvedUrl} size={size} className="" />
      )}
      <LikeHeart propertyId={propertyId} size={size} className="" />
    </div>
  )
}
