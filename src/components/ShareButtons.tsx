'use client'

import { useState } from 'react'
import { MessageCircle, Facebook, Twitter, Link2, Check } from 'lucide-react'

export default function ShareButtons({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false)
  const url = `https://siinmobiliaria.com/propiedades/${slug}`
  const text = encodeURIComponent(`Mirá esta propiedad: ${title}\n${url}`)

  const copyLink = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const buttons = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${text}`,
      icon: MessageCircle,
      className: 'bg-[#25D366] hover:bg-[#1ebe57] text-white',
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: Facebook,
      className: 'bg-[#1877F2] hover:bg-[#1466d8] text-white',
    },
    {
      label: 'Twitter',
      href: `https://twitter.com/intent/tweet?text=${text}`,
      icon: Twitter,
      className: 'bg-black hover:bg-gray-800 text-white',
    },
  ]

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <p className="text-xs text-gray-400 mb-3 font-poppins font-medium uppercase tracking-wide">
        Compartir propiedad
      </p>
      <div className="flex gap-2">
        {buttons.map(({ label, href, icon: Icon, className }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold font-poppins transition-colors ${className}`}
          >
            <Icon size={16} />
            {label}
          </a>
        ))}
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
    </div>
  )
}
