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
  area: number | null
  rooms: number
  bathrooms: number
}

export default function MobileStickyBar({ whatsappUrl, slug, title, price, photo, operation, area, rooms, bathrooms }: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.1)] p-4"
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      <div className="flex gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
        <a
          href="tel:+5493412101694"
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm transition-all"
        >
          <Phone className="w-4 h-4" />
          Llamar
        </a>
        <div className="flex-1">
          <StoryPlate
            title={title}
            price={price}
            photo={photo}
            operation={operation}
            area={area}
            rooms={rooms}
            bathrooms={bathrooms}
            slug={slug}
          />
        </div>
      </div>
    </div>
  )
}
