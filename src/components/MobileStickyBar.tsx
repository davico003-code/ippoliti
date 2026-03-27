'use client'

import { useState } from 'react'
import { MessageCircle, Phone, Instagram } from 'lucide-react'

interface Props {
  whatsappUrl: string
  slug: string
}

export default function MobileStickyBar({ whatsappUrl, slug }: Props) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const response = await fetch(`/api/story/${slug}`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `placa-${slug}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {} finally {
      setDownloading(false)
    }
  }

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
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
        >
          {downloading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Instagram className="w-4 h-4" />
          )}
          Placa
        </button>
      </div>
    </div>
  )
}
