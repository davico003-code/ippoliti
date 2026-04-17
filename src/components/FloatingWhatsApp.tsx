'use client'

import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { events } from '@/lib/analytics'

export default function FloatingWhatsApp() {
  const pathname = usePathname()

  // Hide on property detail pages (they have their own sticky bar with WhatsApp)
  if (pathname.startsWith('/propiedades/') && pathname !== '/propiedades') return null

  return (
    <Link
      href="https://wa.me/5493412101694"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => events.clickWhatsapp()}
      // Hidden on mobile home (FooterMobile has its own WhatsApp CTA)
      className={`fixed bottom-6 right-6 z-50 p-4 bg-[#25D366] text-white rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:bg-[#128C7E] transition-all transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center ${pathname === '/' ? 'hidden md:flex' : ''}`}
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
      <span className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white"></span>
    </Link>
  )
}
