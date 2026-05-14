'use client'

// Botón "Compartir" reutilizable para popups del mapa de /propiedades:
//   - Popup desktop (PropiedadesMap.tsx) — Leaflet Popup
//   - Card mobile preview (PropiedadesView.tsx) — Bottom-sheet style
//
// Reproduce el patrón del popup compartir del MobileStickyBar de la ficha:
// botón circular blanco con ícono Share2, abre popover con 3 opciones:
//   1. Enviar por WhatsApp
//   2. Copiar link
//   3. Link para colega (POST /api/ficha/crear → copia URL verficha.casa)

import { useEffect, useRef, useState } from 'react'
import { Share2, MessageCircle, Link2, Check, Sparkles } from 'lucide-react'

import { generarYCopiarFichaLink } from '@/lib/share-ficha'
import { showToast } from './Toast'

interface Props {
  propertyId: number
  slug: string
  title: string
  priceLabel?: string
  // Posicionamiento del botón flotante (default: top-right del padre relative)
  top?: number | string
  right?: number | string
  size?: number
}

const R = "'Raleway', system-ui, sans-serif"

export default function PropertyShareButton({
  propertyId,
  slug,
  title,
  priceLabel,
  top = 8,
  right = 8,
  size = 32,
}: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generandoFicha, setGenerandoFicha] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
    }
  }, [open])

  const propertyUrl = () =>
    typeof window !== 'undefined'
      ? `${window.location.origin}/propiedades/${slug}`
      : `https://siinmobiliaria.com/propiedades/${slug}`

  const stopAll = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onToggle = (e: React.MouseEvent) => {
    stopAll(e)
    setOpen(o => !o)
  }

  const onWhatsApp = (e: React.MouseEvent) => {
    stopAll(e)
    const url = propertyUrl()
    const lines = [`Mirá esta propiedad: ${title}`]
    if (priceLabel) lines.push(priceLabel)
    lines.push(url)
    const text = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  const onCopy = async (e: React.MouseEvent) => {
    stopAll(e)
    const url = propertyUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      showToast('Link copiado')
      setTimeout(() => { setCopied(false); setOpen(false) }, 1200)
    } catch {
      showToast(`No se pudo copiar. Link: ${url}`, { variant: 'error', duration: 8000 })
      setOpen(false)
    }
  }

  const onFicha = async (e: React.MouseEvent) => {
    stopAll(e)
    if (generandoFicha) return
    setOpen(false)
    setGenerandoFicha(true)
    try {
      await generarYCopiarFichaLink(propertyId)
    } finally {
      setGenerandoFicha(false)
    }
  }

  return (
    <div
      ref={wrapRef}
      style={{ position: 'absolute', top, right, zIndex: 20 }}
      onClick={stopAll}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label="Compartir propiedad"
        aria-expanded={open}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.95)',
          border: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      >
        <Share2 size={Math.round(size * 0.5)} style={{ color: '#1f2937' }} />
      </button>

      {open && (
        <div
          role="menu"
          onClick={stopAll}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 220,
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
            padding: '6px 0',
            zIndex: 100,
            fontFamily: R,
          }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={onWhatsApp}
            className="w-full flex items-center gap-3 text-left"
            style={{
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: R,
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
            onClick={onCopy}
            className="w-full flex items-center gap-3 text-left"
            style={{
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: R,
            }}
          >
            <div className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: '50%', background: '#eef1f2' }}>
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4 text-gray-600" />}
            </div>
            {copied ? 'Copiado!' : 'Copiar link'}
          </button>

          <div style={{ height: 1, background: '#f0f3f5', margin: '4px 12px' }} />

          <button
            type="button"
            role="menuitem"
            onClick={onFicha}
            disabled={generandoFicha}
            className="w-full flex items-center gap-3 text-left"
            style={{
              padding: '12px 16px',
              background: '#fafaf8',
              border: 'none',
              cursor: generandoFicha ? 'wait' : 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: '#1A5C38',
              fontFamily: R,
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
  )
}
