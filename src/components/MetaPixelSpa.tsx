'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// PageView en cada navegación client-side del App Router. El snippet inline
// de MetaPixel ya cuenta la primera página; acá solo las siguientes.
export default function MetaPixelSpa() {
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.fbq?.('track', 'PageView')
  }, [pathname])

  return null
}
