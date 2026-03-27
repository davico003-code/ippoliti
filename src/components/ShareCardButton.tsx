'use client'

import { useState, useRef, useEffect } from 'react'
import { Share2, Link2, MessageCircle, Check } from 'lucide-react'

interface Props {
  slug: string
  title: string
  price?: string
  path?: string
}

export default function ShareCardButton({ slug, title, price, path }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [open])

  const pathname = path || `/propiedades/${slug}`
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}${pathname}`
    : `https://siinmobiliaria.com${pathname}`

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 2000)
  }

  const whatsappLines = [`*${title}*`, price, url].filter(Boolean).join('\n')
  const whatsappText = encodeURIComponent(whatsappLines)
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`

  return (
    <div ref={ref} className="relative">
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o) }}
        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-gray-100 flex items-center justify-center hover:bg-white transition-colors"
        title="Compartir"
      >
        <Share2 className="w-4 h-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 min-w-[170px] z-50">
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4 text-gray-400" />}
            {copied ? '¡Copiado!' : 'Copiar link'}
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 cursor-pointer transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
