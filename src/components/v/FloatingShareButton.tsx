'use client'

// FAB sticky bottom-right, mobile only. Tap → menú con Copiar / WhatsApp.
// Desktop: oculto vía CSS media query (≥768px).

import { useEffect, useRef, useState } from 'react'
import { Check, Copy, MessageCircle, Share2 } from 'lucide-react'

const BLUE = '#2563EB'

export default function FloatingShareButton({ url }: { url: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const waText = encodeURIComponent(`Te paso esta propiedad: ${url}`)

  return (
    <div
      ref={wrapRef}
      className="fab-share"
      style={{
        position: 'fixed',
        right: 18,
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
        zIndex: 40,
      }}
    >
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 'calc(100% + 10px)',
            minWidth: 220,
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
          }}
        >
          <button type="button" role="menuitem" onClick={copy} style={menuItem}>
            {copied ? <Check size={15} color="#16A34A" /> : <Copy size={15} />}
            {copied ? 'Link copiado' : 'Copiar link'}
          </button>
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            style={menuItem}
            onClick={() => setOpen(false)}
          >
            <MessageCircle size={15} color="#25D366" />
            Compartir por WhatsApp
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Compartir"
        aria-expanded={open}
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          background: BLUE,
          color: '#fff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 6px 16px rgba(37,99,235,0.4)',
          transition: 'transform 120ms',
        }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Share2 size={22} />
      </button>

      <style>{`
        @media (min-width: 768px) {
          .fab-share { display: none !important; }
        }
      `}</style>
    </div>
  )
}

const menuItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '12px 16px',
  background: '#fff',
  border: 'none',
  borderTop: '1px solid #F0F0F0',
  color: '#1A1A1A',
  fontSize: 14,
  textAlign: 'left',
  cursor: 'pointer',
  textDecoration: 'none',
  fontFamily: 'inherit',
}
