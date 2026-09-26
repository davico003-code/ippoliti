'use client'

import { events } from '@/lib/analytics'

// Link a WhatsApp con el mensaje ya escrito + evento GA4 (la página es server).
export default function HausingWhatsLink({
  mensaje,
  propertyId,
  titulo,
  className,
  children,
}: {
  mensaje: string
  propertyId?: number
  titulo?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <a
      href={`https://wa.me/5493413340916?text=${encodeURIComponent(mensaje)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => events.clickWhatsapp(propertyId, titulo ?? 'Hausing')}
      className={className}
    >
      {children}
    </a>
  )
}
