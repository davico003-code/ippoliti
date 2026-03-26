'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function ShareCardButton({ slug, path, size = 'sm', variant = 'light' }: { slug?: string; path?: string; size?: 'sm' | 'md'; variant?: 'light' | 'dark' }) {
  const [copied, setCopied] = useState(false)

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = path ? `https://siinmobiliaria.com${path}` : `https://siinmobiliaria.com/propiedades/${slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const iconSize = size === 'md' ? 16 : 14

  return (
    <button
      onClick={handleShare}
      className={`relative group/share flex items-center justify-center rounded-full transition-all ${
        variant === 'dark'
          ? 'w-8 h-8'
          : 'w-8 h-8 bg-white/80 hover:bg-white backdrop-blur-sm shadow-sm'
      }`}
      title="Compartir propiedad"
    >
      {copied ? (
        <Check className={variant === 'dark' ? 'text-white transition-colors' : 'text-brand-600 transition-colors'} style={{ width: iconSize, height: iconSize }} />
      ) : (
        <Share2 className={variant === 'dark' ? 'text-white/50 hover:text-white transition-colors cursor-pointer' : 'text-gray-500 hover:text-brand-600 transition-colors cursor-pointer'} style={{ width: iconSize, height: iconSize }} />
      )}
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-brand-600 text-white text-[10px] font-bold rounded-full whitespace-nowrap z-50 shadow-md">
          Link copiado!
        </span>
      )}
    </button>
  )
}
