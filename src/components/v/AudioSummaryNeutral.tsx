'use client'

// Wrapper para verficha.casa que decide al mount si renderizar el AudioPlayer.
// Mismo flujo que AudioSummary pero con variant 'neutral' (azul).

import { useEffect, useState } from 'react'
import AudioPlayer from '../audio/AudioPlayer'

interface Props {
  propertyId: number
  title?: string
}

export default function AudioSummaryNeutral({ propertyId, title }: Props) {
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
    <section style={{ marginTop: 24 }}>
      <AudioPlayer
        audioUrl={audioUrl}
        variant="neutral"
        propertyId={propertyId}
        title={title}
      />
    </section>
  )
}
