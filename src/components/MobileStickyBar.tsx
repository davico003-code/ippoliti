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

const btnStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '3px',
  padding: '8px 4px',
  borderRadius: '10px',
  fontSize: '10px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'opacity 0.15s',
  border: 'none',
  textDecoration: 'none',
}

export default function MobileStickyBar({ whatsappUrl, slug, title, price, photo, operation, propertyType, area, rooms, bathrooms, lotSurface }: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.1)]"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))', paddingTop: '8px', paddingLeft: '10px', paddingRight: '10px' }}
    >
      <div className="flex gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...btnStyle, background: '#25D366', color: '#fff' }}
        >
          <MessageCircle className="w-[18px] h-[18px]" />
          WhatsApp
        </a>
        <a
          href="tel:+5493412101694"
          style={{ ...btnStyle, background: '#1A5C38', color: '#fff' }}
        >
          <Phone className="w-[18px] h-[18px]" />
          Llamar
        </a>
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
          btnStyle={btnStyle}
        />
      </div>
    </div>
  )
}
