'use client'

// Acción sobre la foto de una card: play (escuchar resumen) en el extremo
// superior derecho. Tamaño configurable (`size`) para que sea proporcional a
// cada card. El corazón de "me gusta" se retiró (14-sep-2026): nunca fue
// pedido para las tarjetas.
//
// audioUrl:
//   - string  → hay audio conocido server-side (ej. listado enriquecido).
//   - null    → se sabe que NO hay audio (no se muestra nada).
//   - undefined → no se conoce; se resuelve client-side por lote
//     (/api/audio/urls) — caso home "Nuestra selección" (ISR, sin Redis en render).

import { useEffect, useState } from 'react'
import { PlayAudioButton } from '@/components/audio/AudioPlayerProvider'
import { fetchAudioUrl } from '@/components/audio/audioUrlStore'

export default function CardMediaButtons({
  propertyId,
  audioUrl,
  size = 34,
  className = 'absolute top-2.5 right-2.5',
}: {
  propertyId: number
  audioUrl?: string | null
  size?: number
  /** Posición del botón sobre la foto. */
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

  if (!resolvedUrl) return null

  return (
    <div className={`${className} flex items-center`}>
      <PlayAudioButton propertyId={propertyId} audioUrl={resolvedUrl} size={size} className="" />
    </div>
  )
}
