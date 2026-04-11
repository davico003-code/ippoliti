'use client'

import { useEffect } from 'react'
import { events } from '@/lib/analytics'

export default function PropertyViewTracker({ propertyId, title, price }: {
  propertyId: number
  title: string
  price: string
}) {
  useEffect(() => {
    events.viewProperty(propertyId, title, price)
  }, [propertyId, title, price])

  return null
}
