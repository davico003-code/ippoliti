'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MessageCircle, Share2, Link2, Check, Instagram, Sparkles } from 'lucide-react'
import VisitWidget from './VisitWidget'
import LikeHeart from './feedback/LikeHeart'
import { FEEDBACK_ENABLED } from './feedback/flag'
import { showToast } from './Toast'
import { generarYCopiarFichaLink } from '@/lib/share-ficha'
import { events } from '@/lib/analytics'

interface Props {
  whatsappUrl: string
  slug: string
  title: string
  propertyId: number
  propertyTitle: string
}

export default function MobileStickyBar({
  whatsappUrl, slug, title, propertyId, propertyTitle,
}: Props) {
  const [shareOpen, setShareOpen] = useState(false)
  const [visitOpen, setVisitOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [generandoFicha, setGenerandoFicha] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)

  // Cerrar popup compartir al tocar fuera
  useEffect(() => {
    if (!shareOpen) return
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false)
    }
    const touchHandler = (e: TouchEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false)
    }
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShareOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', touchHandler, { passive: true })
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', touchHandler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [shareOpen])

  const propertyUrl = `https://siinmobiliaria.com/propiedades/${slug}`
  // (también lo pasamos al VisitWidget para enriquecer el mensaje WhatsApp)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl)
      setLinkCopied(true)
      showToast('Link copiado')
      setTimeout(() => { setLinkCopied(false); setShareOpen(false) }, 1200)
    } catch {
      showToast('No se pudo copiar el link', { variant: 'error' })
      setShareOpen(false)
    }
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Mirá esta propiedad:\n${title}\n${propertyUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
    setShareOpen(false)
    showToast('Listo para enviar por WhatsApp')
  }

  const handleVisita = () => {
    setVisitOpen(true)
  }

  return (
    <div
      className="fixed left-0 right-0 z-50 md:hidden pointer-events-none"
      style={{
        bottom: 'max(8px, env(safe-area-inset-bottom))',
        padding: '0 10px',
      }}
    >
      <div
        className="pointer-events-auto mx-auto flex items-center gap-2"
        style={{
          maxWidth: 520,
          border: '1px solid rgba(26,92,56,.12)',
          boxShadow: '0 12px 34px rgba(9,30,20,.16)',
          borderRadius: 20,
          background: 'rgba(255,255,255,.96)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          padding: '7px',
        }}
      >
        {/* 1. Solicitá una visita — CTA principal */}
        <button
          type="button"
          onClick={handleVisita}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            minWidth: 0,
            height: 48,
            background: '#1A5C38',
            color: '#fff',
            fontFamily: "'Raleway', system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 800,
            borderRadius: 14,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 18px rgba(26,92,56,.22)',
          }}
        >
          <Calendar className="w-[18px] h-[18px]" />
          <span className="truncate">Solicitar visita</span>
        </button>

        {/* 2. WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          onClick={() => events.clickWhatsapp(undefined, title)}
          className="flex items-center justify-center"
          style={{
            width: 48, height: 48,
            borderRadius: 14,
            background: '#22c55e',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <MessageCircle className="w-[21px] h-[21px] text-white" />
        </a>

        {/* 3. Guardar */}
        {FEEDBACK_ENABLED && (
          <div className="flex items-center justify-center" style={{ width: 48, height: 48, flexShrink: 0 }}>
            <LikeHeart propertyId={propertyId} size={42} className="" />
          </div>
        )}

        {/* 4. Compartir */}
        <div className="relative" ref={shareRef} style={{ flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setShareOpen(o => !o)}
            aria-label="Compartir"
            aria-haspopup="menu"
            aria-expanded={shareOpen}
            className="flex items-center justify-center"
            style={{
              width: 48, height: 48,
              borderRadius: 14,
              background: '#fff',
              border: '1.5px solid #cfd7dc',
              cursor: 'pointer',
            }}
          >
            <Share2 className="w-[20px] h-[20px]" style={{ color: '#3a4a54' }} />
          </button>

          {/* Popup de compartir */}
          {shareOpen && (
            <div
              role="menu"
              aria-label="Compartir propiedad"
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
                type="button"
                role="menuitem"
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
                type="button"
                role="menuitem"
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

              <Link
                href={`/propiedades/${slug}/placa`}
                role="menuitem"
                onClick={() => setShareOpen(false)}
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
                  textDecoration: 'none',
                }}
              >
                <div className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                  <Instagram className="w-4 h-4 text-white" />
                </div>
                Crear placa
              </Link>

              <div style={{ height: 1, background: '#f0f3f5', margin: '4px 12px' }} />

              <button
                type="button"
                role="menuitem"
                disabled={generandoFicha}
                onClick={async () => {
                  if (generandoFicha) return
                  setShareOpen(false)
                  setGenerandoFicha(true)
                  try {
                    await generarYCopiarFichaLink(propertyId)
                    showToast('Link para colega copiado')
                  } catch {
                    showToast('No se pudo generar el link', { variant: 'error' })
                  } finally {
                    setGenerandoFicha(false)
                  }
                }}
                className="w-full flex items-center gap-3 text-left"
                style={{
                  padding: '12px 16px',
                  background: '#fafaf8',
                  border: 'none',
                  cursor: generandoFicha ? 'wait' : 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1A5C38',
                  fontFamily: "'Raleway', system-ui, sans-serif",
                  opacity: generandoFicha ? 0.7 : 1,
                }}
              >
                <div className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: '50%', background: '#e7f2eb' }}>
                  <Sparkles className="w-4 h-4" style={{ color: '#1A5C38' }} />
                </div>
                {generandoFicha ? 'Generando…' : 'Link para colega'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom-sheet de visita (misma UX que el VisitMobileTrigger original) */}
      {visitOpen && (
        <div
          // pointer-events-auto: el contenedor de la barra es pointer-events-none
          // (para no tapar la página) y el sheet lo hereda. Sin esto el panel se
          // abre pero no se puede escribir, enviar ni cerrar.
          className="fixed inset-0 z-[60] flex items-end pointer-events-auto"
          onClick={e => { if (e.target === e.currentTarget) setVisitOpen(false) }}
          role="dialog"
          aria-modal="true"
          aria-label="Agendar visita"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-h-[90vh] overflow-y-auto" style={{ animation: 'slideUp 250ms ease-out' }}>
            <div className="bg-[#1A5C38] rounded-t-3xl p-6 pb-24">
              <div className="w-10 h-1 rounded-full bg-white/30 mx-auto mb-4" />
              <button
                type="button"
                onClick={() => setVisitOpen(false)}
                aria-label="Cerrar"
                className="absolute top-5 right-5 text-white/80 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
              <VisitWidget
                propertyId={propertyId}
                propertyTitle={propertyTitle}
                propertyUrl={propertyUrl}
                source="mobile-sticky"
                onClose={() => setVisitOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }` }} />
    </div>
  )
}
