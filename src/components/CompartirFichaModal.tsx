'use client'

// Modal que se abre desde ShareMenu → "Generar link para colega".
//
// Flujo simplificado: al montar, dispara POST /api/ficha/crear { propertyId }
// sin auth ni form. Mientras carga muestra un mini spinner; cuando vuelve la
// URL muestra el resultado con copy + WhatsApp share + link al panel.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Check, Copy, MessageCircle, Sparkles, X } from 'lucide-react'

interface Props {
  propertyId: number
  // propertyTitle viene del caller pero ya no se renderiza (la ficha es
  // anónima y muestra la propiedad por sí misma). Lo mantenemos en la API
  // para no romper el ShareMenu.
  propertyTitle?: string
  onClose: () => void
}

const R = "'Raleway', system-ui, sans-serif"
const GREEN = '#1A5C38'

export default function CompartirFichaModal({ propertyId, onClose }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ url: string; expiresAt: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const triggered = useRef(false)

  const generar = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ficha/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'No se pudo crear la ficha.')
        return
      }
      setResult({ url: data.url, expiresAt: data.expiresAt })
    } catch {
      setError('Error de red al crear la ficha.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-disparo al montar (una sola vez, incluso bajo StrictMode dev)
  useEffect(() => {
    if (triggered.current) return
    triggered.current = true
    void generar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Esc cierra
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const copy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const waHref = result
    ? `https://wa.me/?text=${encodeURIComponent(`Te paso esta propiedad: ${result.url}`)}`
    : '#'

  const primaryBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '12px 18px',
    background: '#25D366', color: '#fff',
    border: 'none', borderRadius: 999,
    fontSize: 14, fontWeight: 700, fontFamily: R,
    cursor: 'pointer', textDecoration: 'none', width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(15,23,42,0.6)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '60px 16px 24px',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          background: '#fff',
          borderRadius: 18,
          width: '100%',
          maxWidth: 460,
          boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
          fontFamily: R,
          color: '#111',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: '1px solid #F3F4F6',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 15, fontWeight: 700, color: '#111',
          }}>
            <Sparkles size={16} color={GREEN} />
            Link para colega
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: 6, borderRadius: 8, color: '#6B7280',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 22 }}>
          {/* Loading */}
          {loading && (
            <div style={{
              padding: '40px 0',
              textAlign: 'center',
              color: '#6B7280',
              fontSize: 14,
            }}>
              Generando link…
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div>
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#B91C1C',
                padding: 14,
                borderRadius: 12,
                fontSize: 13,
              }}>
                {error}
              </div>
              <button
                type="button"
                onClick={generar}
                style={{
                  ...primaryBtn,
                  background: GREEN,
                  marginTop: 14,
                }}
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Success */}
          {!loading && result && (
            <div>
              <div style={{
                background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12,
                padding: 14,
              }}>
                <div style={{
                  fontSize: 11, color: '#6B7280',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  Link generado
                </div>
                <div
                  style={{
                    fontSize: 15, fontWeight: 600, color: '#111',
                    marginTop: 8, wordBreak: 'break-all',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                >
                  {result.url}
                </div>
                <button
                  type="button"
                  onClick={copy}
                  style={{
                    marginTop: 12,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', background: '#fff',
                    border: '1px solid #D1D5DB', borderRadius: 999,
                    fontSize: 13, fontFamily: R, cursor: 'pointer', color: '#111',
                  }}
                >
                  {copied ? <Check size={14} color={GREEN} /> : <Copy size={14} />}
                  {copied ? 'Copiado' : 'Copiar link'}
                </button>
              </div>

              <div style={{
                marginTop: 14, display: 'inline-block',
                padding: '4px 10px', background: '#FEF3C7', color: '#92400E',
                fontSize: 11, fontWeight: 600, borderRadius: 999,
              }}>
                Expira en 30 días
              </div>

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...primaryBtn, marginTop: 18 }}
              >
                <MessageCircle size={16} />
                Compartir por WhatsApp
              </a>

              <Link
                href="/fichas"
                onClick={onClose}
                style={{
                  display: 'block', marginTop: 14, textAlign: 'center',
                  fontSize: 13, color: GREEN, textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                Ver mis fichas activas →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
