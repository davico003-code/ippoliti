'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'
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
    const fin: () => void = iniciar()
    const alClic = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href^="https://wa.me/"]')
      if (a && a.closest('.galx')) trackEvent('click_whatsapp', { origen: `galinda-${ORIGEN[a.id] ?? 'pagina'}` })
    }
    document.addEventListener('click', alClic)
    return () => {
      document.removeEventListener('click', alClic)
      fin()
    }
  }, [])
  return null
}
