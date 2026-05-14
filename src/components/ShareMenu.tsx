'use client'

// Reemplaza ShareButtons en el sidebar de /propiedades/[slug]. Un único botón
// "Compartir" que abre un dropdown con 4 opciones:
//   1. WhatsApp (texto público con link siinmobiliaria.com)
//   2. Copiar link público
//   3. Placa Instagram (si hay placaHref)
//   4. Generar link para colega → POST /api/ficha/crear + copia clipboard + toast

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  Instagram,
  Link2,
  MessageCircle,
  Share2,
  Sparkles,
} from 'lucide-react'

import { generarYCopiarFichaLink } from '@/lib/share-ficha'

interface Props {
  propertyId: number
  slug: string
  title: string
  placaHref?: string
}

const R = "'Raleway', system-ui, sans-serif"

export default function ShareMenu({ propertyId, slug, title, placaHref }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generando, setGenerando] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const url = `https://siinmobiliaria.com/propiedades/${slug}`
  const waText = encodeURIComponent(`Mirá esta propiedad: ${title}\n${url}`)

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
    } catch {
      // ignore
    }
  }

  const itemBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '11px 14px',
    background: '#fff',
    border: 'none',
    borderTop: '1px solid #F0F0F0',
    color: '#1f2937',
    fontSize: 14,
    fontFamily: R,
    textAlign: 'left',
    cursor: 'pointer',
    textDecoration: 'none',
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
        Compartir propiedad
      </p>

      <div ref={wrapRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 18px',
            background: '#F3F4F6',
            color: '#1f2937',
            border: 'none',
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: R,
            cursor: 'pointer',
          }}
        >
          <Share2 size={16} />
          Compartir
        </button>

        {open && (
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              zIndex: 30,
            }}
          >
            <a
              href={`https://wa.me/?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              style={{ ...itemBase, borderTop: 'none' }}
              onClick={() => setOpen(false)}
            >
              <MessageCircle size={16} color="#25D366" />
              Compartir por WhatsApp
            </a>

            <button
              type="button"
              role="menuitem"
              onClick={copy}
              style={itemBase}
            >
              {copied ? <Check size={16} color="#1A5C38" /> : <Link2 size={16} />}
              {copied ? 'Link copiado' : 'Copiar link público'}
            </button>

            {placaHref && (
              <Link
                href={placaHref}
                role="menuitem"
                style={itemBase}
                onClick={() => setOpen(false)}
              >
                <Instagram size={16} />
                Generar placa Instagram
              </Link>
            )}

            <button
              type="button"
              role="menuitem"
              disabled={generando}
              onClick={async () => {
                if (generando) return
                setOpen(false)
                setGenerando(true)
                try {
                  await generarYCopiarFichaLink(propertyId)
                } finally {
                  setGenerando(false)
                }
              }}
              style={{
                ...itemBase,
                background: '#FAFAF8',
                fontWeight: 600,
                color: '#1A5C38',
                opacity: generando ? 0.7 : 1,
                cursor: generando ? 'wait' : 'pointer',
              }}
            >
              <Sparkles size={16} />
              {generando ? 'Generando…' : 'Generar link para colega'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
