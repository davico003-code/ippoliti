'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, MessageCircle, Link2, Check } from 'lucide-react'

export default function PropertyModal({
  children,
  slug,
}: {
  children: ReactNode
  slug?: string
}) {
  const router = useRouter()
  const [linkCopied, setLinkCopied] = useState(false)

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router])

  const propertyUrl = slug
    ? `https://siinmobiliaria.com/propiedades/${slug}`
    : typeof window !== 'undefined' ? window.location.href : ''

  const handleCopyLink = () => {
    navigator.clipboard.writeText(propertyUrl)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Mirá esta propiedad:\n${propertyUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop — el mapa/listado queda visible detrás */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => router.back()}
        style={{ animation: 'pmFadeIn 200ms ease-out' }}
      />

      {/* Panel */}
      <div
        data-modal-scroll
        className="absolute inset-0 md:inset-y-0 md:right-0 md:left-[60px] lg:left-[80px] bg-[#fafafa] overflow-y-auto"
        style={{ animation: 'pmSlideIn 250ms ease-out' }}
      >
        {/* ── Header sticky ── */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between" style={{ height: 64 }}>
            {/* Izquierda: volver */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#1A5C38] transition-colors"
              style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver a la búsqueda</span>
              <span className="sm:hidden">Volver</span>
            </button>

            {/* Centro: logo */}
            <Image
              src="/LOGO_HORIZONTAL.png"
              alt="SI Inmobiliaria"
              width={164}
              height={24}
              className="object-contain hidden md:block"
              style={{ height: 24, width: 'auto' }}
            />

            {/* Derecha: acciones compartir */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                title="Enviar por WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={handleCopyLink}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                title={linkCopied ? 'Copiado!' : 'Copiar link'}
              >
                {linkCopied
                  ? <Check className="w-4 h-4 text-green-600" />
                  : <Link2 className="w-4 h-4 text-gray-600" />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Contenido (incluye PropertyModalNav como primer hijo) */}
        {children}
      </div>

      <style>{`
        @keyframes pmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pmSlideIn { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  )
}
