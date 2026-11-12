'use client'

// Botón de WhatsApp de /como-trabajamos. Client solo para registrar el click
// (GA4 contact_whatsapp + Contact del Pixel) con el origen de la landing.

import { MessageCircle } from 'lucide-react'
import { trackEvent, trackFbEvent } from '@/lib/analytics'

const NUMERO = '5493413340916'
const TEXTO = 'Hola, quiero saber cómo trabajan con mi propiedad.'

export default function WhatsappBoton({
  ubicacion,
  variante = 'claro',
  children = 'Hablar por WhatsApp',
}: {
  /** Dónde está el botón dentro de la landing (hero, cierre…), para GA4. */
  ubicacion: string
  /** 'claro' = borde blanco sobre fondo oscuro; 'oscuro' = borde verde sobre blanco. */
  variante?: 'claro' | 'oscuro'
  children?: React.ReactNode
}) {
  const claro = variante === 'claro'
  return (
    <a
      href={`https://wa.me/${NUMERO}?text=${encodeURIComponent(TEXTO)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        trackEvent('contact_whatsapp', { origen: 'como_trabajamos', ubicacion })
        trackFbEvent('Contact', { content_name: 'como_trabajamos' })
      }}
      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-6 font-raleway text-[15px] font-bold transition-colors duration-200"
      style={{
        border: `1.5px solid ${claro ? 'rgba(255,255,255,.55)' : '#1A5C38'}`,
        color: claro ? '#fff' : '#1A5C38',
        textDecoration: 'none',
      }}
    >
      <MessageCircle size={18} strokeWidth={2} aria-hidden />
      {children}
    </a>
  )
}
