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
import { createPortal } from 'react-dom'
import { Share2, MessageCircle, Link2, Check, Sparkles } from 'lucide-react'

import { generarYCopiarFichaLink } from '@/lib/share-ficha'
import { showToast } from './Toast'

interface Props {
  propertyId: number
  slug: string
  title: string
  priceLabel?: string
  // Modo flotante: posiciona el wrapper en absolute con top/right.
  // Modo inline (default): el wrapper queda en el flujo normal del padre.
  inline?: boolean
  top?: number | string
  right?: number | string
  size?: number
  // Dirección del popover relativa al botón.
  popoverDirection?: 'up' | 'down'
  // Variante visual del botón (icono+container).
  buttonVariant?: 'overlay' | 'card'
}

const R = "'Raleway', system-ui, sans-serif"

export default function PropertyShareButton({
  propertyId,
  slug,
  title,
  priceLabel,
  inline = false,
  top = 8,
  right = 8,
  size = 32,
  popoverDirection = 'down',
  buttonVariant = 'overlay',
}: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generandoFicha, setGenerandoFicha] = useState(false)
  // Posición fija del popover (se calcula desde el botón al abrir). El menú
  // se dibuja en un portal sobre <body>: las cards tienen overflow:hidden y
  // adentro se recortaba.
  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; left: number } | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (wrapRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    // Cerrar al scrollear/resize: la posición fija quedaría desactualizada.
    const onMove = () => setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc)
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
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

  const MENU_W = 200

  const onToggle = (e: React.MouseEvent) => {
    stopAll(e)
    if (!open) {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
      // Alineado al borde derecho del botón, clampeado a los bordes del viewport.
      const left = Math.min(Math.max(8, r.right - MENU_W), window.innerWidth - MENU_W - 8)
      setMenuPos(
        popoverDirection === 'up'
          ? { bottom: window.innerHeight - r.top + 8, left }
          : { top: r.bottom + 8, left },
      )
    }
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

  const wrapperStyle: React.CSSProperties = inline
    ? { position: 'relative', display: 'inline-block' }
    : { position: 'absolute', top, right, zIndex: 20 }

  const buttonStyle: React.CSSProperties = buttonVariant === 'card'
    ? {
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }
    : {
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
      }

  return (
    <div
      ref={wrapRef}
      style={wrapperStyle}
      onClick={stopAll}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label="Compartir propiedad"
        aria-expanded={open}
        style={buttonStyle}
      >
        <Share2 size={Math.round(size * 0.5)} style={{ color: buttonVariant === 'card' ? '#6b7280' : '#1f2937' }} />
      </button>

      {open && menuPos && createPortal(
        <div
          ref={menuRef}
          role="menu"
          onClick={stopAll}
          style={{
            position: 'fixed',
            top: menuPos.top,
            bottom: menuPos.bottom,
            left: menuPos.left,
            width: MENU_W,
            background: '#fff',
            border: '1px solid #ECECEE',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.13)',
            padding: '5px 0',
            zIndex: 200,
            fontFamily: R,
          }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={onWhatsApp}
            className="w-full flex items-center gap-2.5 text-left hover:bg-gray-50"
            style={{
              padding: '9px 13px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: R,
            }}
          >
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: 26, height: 26, borderRadius: '50%', background: '#22c55e' }}>
              <MessageCircle className="w-3.5 h-3.5 text-white" />
            </div>
            Enviar por WhatsApp
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={onCopy}
            className="w-full flex items-center gap-2.5 text-left hover:bg-gray-50"
            style={{
              padding: '9px 13px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: R,
            }}
          >
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: 26, height: 26, borderRadius: '50%', background: '#eef1f2' }}>
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Link2 className="w-3.5 h-3.5 text-gray-600" />}
            </div>
            {copied ? 'Copiado!' : 'Copiar link'}
          </button>

          <div style={{ height: 1, background: '#f0f3f5', margin: '3px 11px' }} />

          <button
            type="button"
            role="menuitem"
            onClick={onFicha}
            disabled={generandoFicha}
            className="w-full flex items-center gap-2.5 text-left"
            style={{
              padding: '9px 13px',
              background: '#fafaf8',
              border: 'none',
              cursor: generandoFicha ? 'wait' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: '#1A5C38',
              fontFamily: R,
              opacity: generandoFicha ? 0.7 : 1,
            }}
          >
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: 26, height: 26, borderRadius: '50%', background: '#e7f2eb' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#1A5C38' }} />
            </div>
            {generandoFicha ? 'Generando…' : 'Link para colega'}
          </button>
        </div>,
        document.body,
      )}
    </div>
  )
}
