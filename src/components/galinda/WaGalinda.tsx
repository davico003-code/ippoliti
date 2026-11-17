'use client'

import { MessageCircle } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { galWhatsappUrl } from '@/lib/galinda'

// CTA de WhatsApp de la landing de Galinda!: mensaje ya escrito y evento GA4
// con el lugar de la página (y la unidad) desde donde se clickeó.
export default function WaGalinda({
  text = 'Hola! Quiero información sobre Galinda!: unidades disponibles, precios y visita al showroom.',
  label = 'Consultar por WhatsApp',
  origen,
  className = '',
}: {
  text?: string
  label?: string
  origen: string
  className?: string
}) {
  return (
    <a
      href={galWhatsappUrl(text)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('click_whatsapp', { origen: `galinda-${origen}` })}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#17613C] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0F4A2C] ${className}`}
    >
      <MessageCircle className="h-4 w-4" aria-hidden /> {label}
    </a>
  )
}
