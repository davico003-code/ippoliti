'use client'

import { useEffect } from 'react'
import { trackEvent, trackFbEvent } from '@/lib/analytics'
import { iniciar } from './motor'

// De dónde salió cada consulta por WhatsApp, para GA4 (mismo evento que el
// resto de la web). El id del enlace dice el lugar de la página.
const ORIGEN: Record<string, string> = {
  uWa: 'unidad',
  locWa: 'local',
  pbWa: 'piso-1',
  cWa: 'cierre',
  fijaWa: 'barra',
}

/** Le da vida al HTML de la experiencia (lo dibuja el servidor). No pinta nada. */
export default function MotorGalinda() {
  useEffect(() => {
    // Si el motor fallara, la página queda igual de legible (tablas, fotos y
    // botones de consulta ya vienen escritos): no se cae entera.
    let fin: () => void = () => {}
    try {
      fin = iniciar()
    } catch (e) {
      trackEvent('error_galinda', { motivo: e instanceof Error ? e.message.slice(0, 90) : 'motor' })
    }
    const alClic = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href^="https://wa.me/"]')
      if (a && a.closest('.galx')) {
        trackEvent('click_whatsapp', { origen: `galinda-${ORIGEN[a.id] ?? 'pagina'}` })
        // Consulta real → Contact del píxel: la pauta de Galinda! optimiza a esto.
        trackFbEvent('Contact', { content_name: 'Galinda!', content_category: 'whatsapp' })
      }
    }
    document.addEventListener('click', alClic)
    return () => {
      document.removeEventListener('click', alClic)
      fin()
    }
  }, [])
  return null
}
