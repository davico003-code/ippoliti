'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// page_view en cada navegación client-side del App Router (mismo patrón que
// MetaPixelSpa). El gtag('config') inicial ya cuenta la primera página
// (send_page_view: true); acá solo las siguientes. Sin esto, GA4 perdía TODAS
// las navegaciones SPA (listado → ficha, filtros, etc.).
export default function GoogleAnalyticsSpa() {
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.gtag?.('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname])

  return null
}
