'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function ShareCardButton({ slug, size = 'sm', variant = 'light' }: { slug: string; size?: 'sm' | 'md'; variant?: 'light' | 'dark' }) {
  const [copied, setCopied] = useState(false)

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(`https://siinmobiliaria.com/propiedades/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const iconSize = size === 'md' ? 16 : 14

  return (
    <button
      onClick={handleShare}
      className="relative group/share"
      title="Compartir propiedad"
    >
      {copied ? (
        <Check className={variant === 'dark' ? 'text-white transition-colors' : 'text-brand-600 transition-colors'} style={{ width: iconSize, height: iconSize }} />
      ) : (
        <Share2 className={variant === 'dark' ? 'text-white/50 hover:text-white transition-colors cursor-pointer' : 'text-gray-300 hover:text-brand-600 transition-colors cursor-pointer'} style={{ width: iconSize, height: iconSize }} />
      )}
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded whitespace-nowrap z-50">
          Link copiado
        </span>
      )}
    </button>
  )
}
