'use client'

import { useEffect } from 'react'
import { events } from '@/lib/analytics'
import { rememberSeenProperty } from '@/lib/property-history'

export default function PropertyViewTracker({ propertyId, title, price }: {
  propertyId: number
  title: string
  price: string
}) {
  useEffect(() => {
    rememberSeenProperty(propertyId)
    events.viewProperty(propertyId, title, price)
  }, [propertyId, title, price])

  return null
}
