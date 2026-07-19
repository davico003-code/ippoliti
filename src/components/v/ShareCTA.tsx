'use client'

// Card CTA al final de la ficha. Botón principal abre menú con Copiar / WhatsApp.
// Comparte la URL ACTUAL: el colega que recibió el link puede reenviarlo a sus
// clientes y todas las visitas suman a las stats del mismo slug.

import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Download, MessageCircle, QrCode, Share2 } from 'lucide-react'

const BLUE = '#2563EB'

export default function ShareCTA({
  url, slug, qrDataUrl,
}: { url: string; slug?: string; qrDataUrl?: string | null }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)
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
    <section
      style={{
        marginTop: 44,
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#1A1A1A',
          margin: 0,
          letterSpacing: '-0.01em',
        }}
      >
        ¿Te interesa esta propiedad?
      </h2>
      <p style={{ fontSize: 14, color: '#4A4A4A', margin: '8px 0 0', lineHeight: 1.5 }}>
        Compartila o consultá con quien te la envió.
      </p>

      <div ref={wrapRef} style={{ position: 'relative', marginTop: 18 }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '14px 28px',
            background: BLUE,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
            minWidth: 220,
          }}
        >
          <Share2 size={18} />
          Compartir esta propiedad
        </button>

        {open && (
          <div
            role="menu"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: 'calc(100% + 8px)',
              minWidth: 240,
              background: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              zIndex: 10,
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={copy}
              style={menuItem}
            >
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
            {slug && (
              <a
                href={`/api/ficha/${slug}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                style={menuItem}
                onClick={() => setOpen(false)}
              >
                <Download size={15} color={BLUE} />
                Descargar PDF
              </a>
            )}
            {qrDataUrl && (
              <button
                type="button"
                role="menuitem"
                onClick={() => { setShowQr(v => !v); setOpen(false) }}
                style={menuItem}
              >
                <QrCode size={15} />
                {showQr ? 'Ocultar código QR' : 'Ver código QR'}
              </button>
            )}
          </div>
        )}
      </div>

      {showQr && qrDataUrl && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Código QR de la propiedad" width={180} height={180}
            style={{ borderRadius: 12, border: '1px solid #E5E7EB' }} />
          <span style={{ fontSize: 12, color: '#6B7280' }}>Escaneá para abrir la ficha</span>
        </div>
      )}
    </section>
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
