'use client'

import { useEffect } from 'react'
import { trackFbEvent } from '@/lib/analytics'

/**
 * Consulta real desde la landing de un emprendimiento (toque a WhatsApp o a
 * llamar) → evento Contact del píxel de Meta. La pauta de emprendimientos
 * optimiza a esto: sin el evento, Meta solo puede optimizar a clics.
 * No pinta nada.
 */
export default function PixelConsultas({ nombre }: { nombre: string }) {
  useEffect(() => {
    const alClic = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href^="https://wa.me/"], a[href^="tel:"]') as HTMLAnchorElement | null
      if (!a) return
      const canal = a.href.startsWith('tel:') ? 'llamada' : 'whatsapp'
      trackFbEvent('Contact', { content_name: nombre, content_category: canal })
    }
    document.addEventListener('click', alClic)
    return () => document.removeEventListener('click', alClic)
  }, [nombre])
  return null
}
