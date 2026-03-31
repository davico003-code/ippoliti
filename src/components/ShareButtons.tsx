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
}

const btnBase = 'flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors'

export default function ShareButtons({ slug, title, price, photo, operation, propertyType, area, rooms, bathrooms, lotSurface }: Props) {
  const [copied, setCopied] = useState(false)
  const url = `https://siinmobiliaria.com/propiedades/${slug}`
  const text = encodeURIComponent(`Mirá esta propiedad: ${title}\n${url}`)

  const copyLink = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
        Compartir propiedad
      </p>
      <div className="flex gap-2">
        <a
          href={`https://wa.me/?text=${text}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-xl`}
        >
          <MessageCircle size={14} />
          WhatsApp
        </a>
        <button
          onClick={copyLink}
          className={`${btnBase} rounded-xl ${
            copied ? 'bg-[#1A5C38] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {copied ? <Check size={14} /> : <Link2 size={14} />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
        <div className="flex-1 flex rounded-xl overflow-hidden">
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
            slug={slug}
          />
        </div>
      </div>
    </div>
  )
}
