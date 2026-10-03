'use client'

// Botón "Compartir" (negro) con menú WhatsApp / Copiar link. Comparte la URL
// ACTUAL: el colega que recibió el link puede reenviarlo a sus clientes y
// todas las visitas suman a las stats del mismo slug.
//   variante 'barra'   → barra fija del celu, el menú abre hacia ARRIBA.
//   variante 'tarjeta' → tarjeta fija de la compu, el menú abre hacia abajo.

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Check, Copy, MessageCircle, Share2 } from 'lucide-react'
import { contarCompartida } from './contar-compartida'
import { LINEA, TINTA } from './estilos'

export default function CompartirMenu({
  url,
  slug,
  variante,
}: {
  url: string
  slug?: string
  variante: 'barra' | 'tarjeta'
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const copy = async () => {
    contarCompartida(slug)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const waText = encodeURIComponent(`Te paso esta propiedad: ${url}`)
  const arriba = variante === 'barra'

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1 }}>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            right: 0,
            ...(arriba ? { bottom: 'calc(100% + 10px)', minWidth: 250 } : { top: 'calc(100% + 8px)', left: 0 }),
            background: '#fff',
            border: `1px solid ${LINEA}`,
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
            zIndex: 20,
          }}
        >
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            style={{ ...menuItem, borderTop: 'none' }}
            onClick={() => {
              contarCompartida(slug)
              setOpen(false)
            }}
          >
            <MessageCircle size={16} color="#25D366" aria-hidden />
            Compartir por WhatsApp
          </a>
          <button type="button" role="menuitem" onClick={copy} style={menuItem}>
            {copied ? <Check size={16} color="#16A34A" aria-hidden /> : <Copy size={16} aria-hidden />}
            {copied ? 'Link copiado' : 'Copiar link'}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        style={{
          width: '100%',
          height: variante === 'barra' ? 48 : 50,
          border: 'none',
          borderRadius: 14,
          background: TINTA,
          color: '#fff',
          fontSize: 16,
          fontWeight: 600,
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          cursor: 'pointer',
        }}
      >
        <Share2 size={18} aria-hidden />
        Compartir
      </button>
    </div>
  )
}

const menuItem: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '14px 16px',
  background: '#fff',
  border: 'none',
  borderTop: `1px solid ${LINEA}`,
  color: TINTA,
  fontSize: 15,
  textAlign: 'left',
  cursor: 'pointer',
  textDecoration: 'none',
  fontFamily: 'inherit',
}
