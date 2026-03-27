'use client'

import { useState } from 'react'
import { MessageCircle, Link2, Check, Instagram } from 'lucide-react'

export default function ShareButtons({ slug, title }: { slug: string; title: string }) {
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
      <div className="flex gap-2">
        <a
          href={`https://wa.me/?text=${text}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold font-poppins transition-colors bg-[#25D366] hover:bg-[#1ebe57] text-white"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
        <button
          onClick={copyLink}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold font-poppins transition-colors ${
            copied
              ? 'bg-brand text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {copied ? <Check size={16} /> : <Link2 size={16} />}
          {copied ? 'Copiado!' : 'Copiar link'}
        </button>
      </div>
      <a
        href={`/api/story/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold font-poppins transition-opacity hover:opacity-90 text-white"
        style={{ background: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)' }}
      >
        <Instagram size={16} />
        Placa Instagram
      </a>
    </div>
  )
}
