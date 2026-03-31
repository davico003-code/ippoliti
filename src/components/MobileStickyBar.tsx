'use client'

import { MessageCircle, Phone } from 'lucide-react'
import StoryPlate from './StoryPlate'

interface Props {
  whatsappUrl: string
  slug: string
  title: string
  price: string
  photo: string | null
  operation: string
  propertyType: string
  area: number | null
  rooms: number
  bathrooms: number
  lotSurface?: number | null
}

const btnBase = 'flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-semibold'

export default function MobileStickyBar({ whatsappUrl, slug, title, price, photo, operation, propertyType, area, rooms, bathrooms, lotSurface }: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.1)]"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))', paddingTop: '12px', paddingLeft: '12px', paddingRight: '12px' }}
    >
      <div className="flex gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} bg-[#25D366] text-white rounded-xl`}
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
        <a
          href="tel:+5493412101694"
          className={`${btnBase} bg-[#1A5C38] text-white rounded-xl`}
        >
          <Phone className="w-4 h-4" />
          Llamar
        </a>
        <div className="flex-1 flex rounded-xl overflow-hidden">
          <StoryPlate
            title={title}
            price={price}
            photo={photo}
            operation={operation}
            propertyType={propertyType}
            area={area}
            rooms={rooms}
            bathrooms={bathrooms}
            lotSurface={lotSurface}
            slug={slug}
          />
        </div>
      </div>
    </div>
  )
}
