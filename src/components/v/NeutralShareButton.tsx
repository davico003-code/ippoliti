'use client'

// Botón "Compartir esta propiedad" que aparece dentro de la ficha pública para
// que el COLEGA pueda reenviar el link a sus clientes. Mismo slug, sin auth,
// las visitas siguen sumando a las stats del slug original (eso es feature: el
// equipo SI ve cuánto está moviendo cada colega).

import { useEffect, useRef, useState } from 'react'

export default function NeutralShareButton({ url }: { url: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Cerrar al click fuera
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback silencioso — algunos browsers bloquean clipboard sin gesto
    }
  }

  const waText = encodeURIComponent(`Te paso esta propiedad: ${url}`)

  const itemStyle: React.CSSProperties = {
    display: 'block',
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

  return (
    <div ref={wrapRef} style={{ position: 'relative', marginTop: 14 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          padding: '12px 20px',
          background: 'transparent',
          border: '1px solid #1A1A1A',
          color: '#1A1A1A',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Compartir esta propiedad
      </button>

      {open && (
        <div
          role="menu"
          style={{
            marginTop: 8,
            background: '#fff',
            border: '1px solid #EAEAEA',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <button
            type="button"
            onClick={copy}
            style={{ ...itemStyle, borderTop: 'none' }}
            role="menuitem"
          >
            {copied ? '✓ Link copiado' : 'Copiar link'}
          </button>
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            style={itemStyle}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Compartir por WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
