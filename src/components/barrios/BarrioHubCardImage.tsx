'use client'

import { useState } from 'react'
import Image from 'next/image'

export type HubTier = 'premium' | 'consolidado' | 'joven' | 'desarrollo'

const TIER_GRADIENT: Record<HubTier, string> = {
  premium: 'linear-gradient(160deg, #1A5C38 0%, #0F3F26 100%)',
  consolidado: 'linear-gradient(160deg, #4A7C5C 0%, #2E5742 100%)',
  joven: 'linear-gradient(160deg, #B8935A 0%, #8B6D3F 100%)',
  desarrollo: 'linear-gradient(160deg, #8B5A2B 0%, #5C3A1A 100%)',
}

interface Props {
  slug: string
  nombre: string
  tier: HubTier
  priority?: boolean
}

export default function BarrioHubCardImage({ slug, nombre, tier, priority = false }: Props) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <div
        role="img"
        aria-label={`Imagen pendiente de ${nombre}`}
        style={{
          background: TIER_GRADIENT[tier],
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
    )
  }

  return (
    <Image
      src={`/barrios/${slug}.jpg`}
      alt={`Vista de ${nombre} — barrio privado en Funes`}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      loading={priority ? 'eager' : 'lazy'}
      priority={priority}
      className="object-cover"
      onError={() => setErrored(true)}
    />
  )
}
