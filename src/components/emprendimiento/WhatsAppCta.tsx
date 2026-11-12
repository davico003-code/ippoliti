'use client'

// Link a WhatsApp con el mensaje precargado del emprendimiento y el evento
// click_whatsapp. Es client solo por el tracking; el funnel es server.

import type { ReactNode } from 'react'
import { events } from '@/lib/analytics'

interface Props {
  href: string
  devId: number
  devName: string
  className?: string
  ariaLabel?: string
  /** true → marca el link como FAB (se esconde bajo hojas modales, globals.css). */
  fab?: boolean
  children: ReactNode
}

export default function WhatsAppCta({ href, devId, devName, className, ariaLabel, fab, children }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => events.clickWhatsapp(devId, devName)}
      aria-label={ariaLabel}
      className={className}
      {...(fab ? { 'data-fab-whatsapp': true } : {})}
    >
      {children}
    </a>
  )
}
