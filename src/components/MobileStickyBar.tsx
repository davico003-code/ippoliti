'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, MessageCircle, Share2, Link2, Check } from 'lucide-react'
import StoryPlate from './StoryPlate'
import VisitWidget from './VisitWidget'
import { events } from '@/lib/analytics'

interface Props {
  whatsappUrl: string
  slug: string
  title: string
  price: string
  photo: string | null
  operation: string
  propertyType: string
  area: number | null
  rooms: number
  bathrooms: number
  lotSurface?: number | null
  parking?: number
  city?: string
  neighborhood?: string
  propertyId: number
  propertyTitle: string
}

export default function MobileStickyBar({
  whatsappUrl, slug, title, price, photo, operation, propertyType,
  area, rooms, bathrooms, lotSurface, parking, city, neighborhood,
  propertyId, propertyTitle,
}: Props) {
  const [shareOpen, setShareOpen] = useState(false)
  const [visitOpen, setVisitOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)

  // Cerrar popup compartir al tocar fuera
  useEffect(() => {
    if (!shareOpen) return
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [shareOpen])

  const propertyUrl = `https://siinmobiliaria.com/propiedades/${slug}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(propertyUrl)
    setLinkCopied(true)
    setTimeout(() => { setLinkCopied(false); setShareOpen(false) }, 1500)
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Mirá esta propiedad:\n${title}\n${propertyUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
    setShareOpen(false)
  }

  const handleVisita = () => {
    setVisitOpen(true)
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white"
      style={{
        borderTop: '1px solid #e4e9ec',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
        padding: '8px 10px',
        paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex items-start gap-3">
        {/* 1. Solicitá una visita — CTA principal */}
        <button
          onClick={handleVisita}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: 46,
            background: '#0b6b3a',
            color: '#fff',
            fontFamily: "'Raleway', system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 700,
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Calendar className="w-[18px] h-[18px]" />
          Solicitá una visita
        </button>

        {/* 2. WhatsApp */}
        <div className="flex flex-col items-center" style={{ gap: 2 }}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => events.clickWhatsapp(undefined, title)}
            className="flex items-center justify-center"
            style={{
              width: 46, height: 46,
              borderRadius: '50%',
              background: '#22c55e',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <MessageCircle className="w-[20px] h-[20px] text-white" />
          </a>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#16a34a' }}>Chat</span>
        </div>

        {/* 3. Placa (Instagram) */}
        <div className="flex flex-col items-center" style={{ gap: 2 }}>
          <StoryPlate
            title={title}
            price={price}
            photo={photo}
            operation={operation}
            propertyType={propertyType}
            area={area}
            rooms={rooms}
            bathrooms={bathrooms}
            lotSurface={lotSurface}
            parking={parking}
            slug={slug}
            city={city}
            neighborhood={neighborhood}
            btnStyle={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 46,
              height: 46,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontSize: 0,
            }}
          />
          <span style={{ fontSize: 9, fontWeight: 700, color: '#e04e8a' }}>Placa</span>
        </div>

        {/* 4. Compartir */}
        <div className="flex flex-col items-center relative" style={{ gap: 2 }} ref={shareRef}>
          <button
            onClick={() => setShareOpen(o => !o)}
            className="flex items-center justify-center"
            style={{
              width: 46, height: 46,
              borderRadius: '50%',
              background: '#fff',
              border: '1.5px solid #cfd7dc',
              cursor: 'pointer',
            }}
          >
            <Share2 className="w-[20px] h-[20px]" style={{ color: '#3a4a54' }} />
          </button>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#5a6a74' }}>Compartir</span>

          {/* Popup de compartir */}
          {shareOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 12px)',
                right: -8,
                width: 220,
                background: '#fff',
                borderRadius: 14,
                boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
                padding: '8px 0',
                zIndex: 100,
              }}
            >
              {/* Flecha apuntando hacia abajo */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -7,
                  right: 20,
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '8px solid #fff',
                  filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.06))',
                }}
              />

              <button
                onClick={handleShareWhatsApp}
                className="w-full flex items-center gap-3 text-left"
                style={{
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1a1a1a',
                  fontFamily: "'Raleway', system-ui, sans-serif",
                }}
              >
                <div className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: '50%', background: '#22c55e' }}>
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                Enviar por WhatsApp
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 text-left"
                style={{
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1a1a1a',
                  fontFamily: "'Raleway', system-ui, sans-serif",
                }}
              >
                <div className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: '50%', background: '#eef1f2' }}>
                  {linkCopied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4 text-gray-600" />}
                </div>
                {linkCopied ? 'Copiado!' : 'Copiar link'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom-sheet de visita (misma UX que el VisitMobileTrigger original) */}
      {visitOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end"
          onClick={e => { if (e.target === e.currentTarget) setVisitOpen(false) }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-h-[90vh] overflow-y-auto" style={{ animation: 'slideUp 250ms ease-out' }}>
            <div className="bg-[#1A5C38] rounded-t-3xl p-6 pb-24">
              <div className="w-10 h-1 rounded-full bg-white/30 mx-auto mb-4" />
              <button
                onClick={() => setVisitOpen(false)}
                className="absolute top-5 right-5 text-white/50 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
              <VisitWidget propertyId={propertyId} propertyTitle={propertyTitle} />
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  )
}
