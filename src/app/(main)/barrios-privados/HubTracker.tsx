'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export default function HubTracker() {
  useEffect(() => {
    trackEvent('barrios_hub_view')
  }, [])
  return null
}
