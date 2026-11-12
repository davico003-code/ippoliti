'use client'

import { MessageCircle } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { fwWhatsappUrl } from '@/lib/fisherton-work'

// CTA de WhatsApp de la landing de Fisherton Work: mensaje ya escrito y evento
// GA4 con el lugar de la página desde donde se clickeó.
export default function WaCta({
  text = 'Hola! Quiero información sobre Fisherton Work: disponibilidad, precios y financiación.',
  label = 'Consultar por WhatsApp',
  origen,
  className = '',
  fab = false,
}: {
  text?: string
  label?: string
  origen: string
  className?: string
  fab?: boolean
}) {
  const onClick = () => trackEvent('click_whatsapp', { origen: `fisherton-work-${origen}` })

  if (fab) {
    return (
      <a
        href={fwWhatsappUrl(text)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        data-fab-whatsapp
        aria-label="Consultar Fisherton Work por WhatsApp"
        className="si-tap fixed bottom-4 right-4 z-50 flex items-center justify-center rounded-full bg-[#25D366] p-3 text-white shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] transition-all hover:bg-[#128C7E] md:bottom-6 md:right-6 md:p-4"
      >
        <MessageCircle className="h-7 w-7 md:h-8 md:w-8" />
      </a>
    )
  }

  return (
    <a
      href={fwWhatsappUrl(text)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 ${className}`}
    >
      <MessageCircle className="h-4 w-4" /> {label}
    </a>
  )
}
