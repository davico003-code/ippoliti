'use client'

// Wrapper para /propiedades/[slug] (siinmobiliaria.com) que decide al mount
// si renderizar el AudioPlayer.
//
// La generación de audio es opt-in (se hace desde /admin/audio), así que la
// inmensa mayoría de las propiedades NO tiene audio cacheado. Para evitar
// botones huérfanos, consultamos /api/audio/check al mount y solo renderizamos
// el player si existe URL.

import { useEffect, useState } from 'react'
import AudioPlayer from './audio/AudioPlayer'

interface Props {
  propertyId: number
  title?: string
}

export default function AudioSummary({ propertyId, title }: Props) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/audio/check?propertyId=${propertyId}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (cancelled || !data?.hasAudio || !data?.url) return
        setAudioUrl(data.url as string)
      })
      .catch(() => { /* sin audio, sin render */ })
    return () => { cancelled = true }
  }, [propertyId])

  if (!audioUrl) return null

  return (
    <div style={{ marginBottom: 14 }}>
      <AudioPlayer
        audioUrl={audioUrl}
        variant="main"
        propertyId={propertyId}
        title={title}
      />
    </div>
  )
}
