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
      <p className="text-xs text-gray-400 mb-3 font-poppins font-medium uppercase tracking-wide">
        Compartir propiedad
      </p>
      <div className="grid grid-cols-3 gap-2">
        <a
          href={`https://wa.me/?text=${text}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold font-poppins transition-colors bg-[#25D366] hover:bg-[#1ebe57] text-white"
        >
          <MessageCircle size={14} />
          WhatsApp
        </a>
        <button
          onClick={copyLink}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold font-poppins transition-colors ${
            copied
              ? 'bg-brand text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {copied ? <Check size={14} /> : <Link2 size={14} />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
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
  )
}
