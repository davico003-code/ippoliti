'use client'

import { useEffect } from 'react'
import { trackEvent, trackFbEvent } from '@/lib/analytics'

interface Props {
  slug: string
  nombre: string
}

export default function LandingTracker({ slug, nombre }: Props) {
  useEffect(() => {
    trackEvent('barrios_landing_view', { slug })
    trackFbEvent('ViewContent', {
      content_category: `barrio-${slug}`,
      content_name: nombre,
      content_type: 'barrio-privado',
    } as never)
  }, [slug, nombre])
  return null
}
