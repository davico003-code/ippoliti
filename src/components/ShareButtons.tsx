'use client'

import { useState } from 'react'
import { MessageCircle, Link2, Check } from 'lucide-react'
import StoryPlate from './StoryPlate'

interface Props {
  slug: string
  title: string
  price?: string
  photo?: string | null
  operation?: string
  propertyType?: string
  area?: number | null
  rooms?: number
  bathrooms?: number
  lotSurface?: number | null
  parking?: number
  city?: string
  neighborhood?: string
}

export default function ShareButtons({ slug, title, price, photo, operation, propertyType, area, rooms, bathrooms, lotSurface, parking, city, neighborhood }: Props) {
  const [copied, setCopied] = useState(false)
  const url = `https://siinmobiliaria.com/propiedades/${slug}`
  const text = encodeURIComponent(`Mirá esta propiedad: ${title}\n${url}`)

  const copyLink = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const btnStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '10px 8px',
    borderRadius: '14px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    border: 'none',
    textDecoration: 'none',
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
        Compartir propiedad
      </p>
      <div className="flex gap-2">

        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${text}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...btnStyle, background: '#25D366', color: '#fff' }}
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>

        {/* Copiar link */}
        <button
          onClick={copyLink}
          style={{
            ...btnStyle,
            background: copied ? '#1A5C38' : '#F3F4F6',
            color: copied ? '#fff' : '#374151',
          }}
        >
          {copied ? <Check size={16} /> : <Link2 size={16} />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>

        {/* Placa Instagram */}
        <StoryPlate
          title={title}
          price={price || 'Consultar'}
          photo={photo || null}
          operation={operation || ''}
          propertyType={propertyType || ''}
          area={area || null}
          rooms={rooms || 0}
          bathrooms={bathrooms || 0}
          lotSurface={lotSurface}
          parking={parking}
          slug={slug}
          city={city}
          neighborhood={neighborhood}
          btnStyle={btnStyle}
        />

      </div>
    </div>
  )
}
