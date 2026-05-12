'use client'

// Panel del equipo SI para ver, copiar y revocar fichas anónimas generadas
// en verficha.casa. Acceso abierto (cualquiera con la URL puede entrar) —
// la auth se removió junto con el flujo de colega.

import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Check,
  Copy,
  Inbox,
  MessageCircle,
  Trash2,
} from 'lucide-react'

const R = "'Raleway', system-ui, sans-serif"
const NEUTRAL_DOMAIN = process.env.NEXT_PUBLIC_NEUTRAL_DOMAIN || 'verficha.casa'

interface FichaItem {
  slug: string
  propertyId: number
  notas: string
  createdAt: string
  expiresAt: string
  revokedAt: string | null
  diasRestantes: number
  generadoDesde: { ip: string; userAgent: string; createdAt: string }
  stats: { views: number; lastViewAt: string | null; ips: string[] }
  preview: {
    titulo: string
    precio: string
    thumb: string | null
    zonaAprox: string
    operacion: string
  }
}

export default function FichasClient() {
  const [fichas, setFichas] = useState<FichaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [confirmRevoke, setConfirmRevoke] = useState<FichaItem | null>(null)

  const flashToast = (text: string) => {
    setToast(text)
    setTimeout(() => setToast(null), 2200)
  }

  const loadAll = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch('/api/ficha/list')
      const data = await res.json()
      setFichas(data.fichas || [])
    } catch {
      setLoadError('No se pudo cargar la información. Probá recargar.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAll()
  }, [])

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      flashToast('Link copiado')
    } catch {}
  }

  const doRevoke = async (slug: string) => {
    try {
      const res = await fetch(`/api/ficha/${slug}`, { method: 'DELETE' })
      if (res.ok) {
        flashToast('Ficha revocada')
        void loadAll()
      } else {
        flashToast('No se pudo revocar')
      }
    } catch {
      flashToast('Error de red')
    } finally {
      setConfirmRevoke(null)
    }
  }

  const fichasActivas = fichas.filter(f => !f.revokedAt)
  const fichasRevocadas = fichas.filter(f => f.revokedAt)

  return (
    <div>
      {/* Header chico con conteo */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 24, color: '#374151',
        }}
      >
        <Inbox size={16} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {fichasActivas.length} fichas activas
        </span>
      </div>

      {loading && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
          Cargando…
        </div>
      )}

      {loadError && (
        <div
          style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            color: '#B91C1C', padding: 14, borderRadius: 12,
            fontSize: 13, marginBottom: 18,
          }}
        >
          {loadError}
        </div>
      )}

      {!loading && fichasActivas.length === 0 && fichasRevocadas.length === 0 && (
        <EmptyState />
      )}

      {!loading && fichasActivas.length > 0 && (
        <div
          style={{
            background: '#fff', border: '1px solid #E5E7EB',
            borderRadius: 14, overflow: 'hidden',
          }}
        >
          <FichaHeaderRow />
          {fichasActivas.map(f => (
            <FichaRow
              key={f.slug}
              ficha={f}
              onCopy={copyUrl}
              onRevoke={() => setConfirmRevoke(f)}
            />
          ))}
        </div>
      )}

      {!loading && fichasRevocadas.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3
            style={{
              fontSize: 12, fontWeight: 600, color: '#9CA3AF',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: 10,
            }}
          >
            Revocadas
          </h3>
          <div
            style={{
              background: '#fff', border: '1px solid #E5E7EB',
              borderRadius: 14, overflow: 'hidden', opacity: 0.7,
            }}
          >
            <FichaHeaderRow />
            {fichasRevocadas.map(f => (
              <FichaRow key={f.slug} ficha={f} onCopy={copyUrl} onRevoke={() => {}} />
            ))}
          </div>
        </div>
      )}

      {confirmRevoke && (
        <ConfirmModal
          title="Revocar ficha"
          message={`El link "${confirmRevoke.preview.titulo}" dejará de funcionar inmediatamente. No se puede deshacer.`}
          confirmLabel="Revocar"
          onCancel={() => setConfirmRevoke(null)}
          onConfirm={() => doRevoke(confirmRevoke.slug)}
        />
      )}

      {toast && <Toast text={toast} />}
    </div>
  )
}

// ── Sub-componentes ─────────────────────────────────────────────────────────

const iconBtn: React.CSSProperties = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  padding: 6, borderRadius: 8, color: '#6B7280',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

function FichaHeaderRow() {
  const cell: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  }
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '70px 1fr 90px 110px 140px',
        gap: 12, padding: '12px 18px',
        background: '#FAFAFA', borderBottom: '1px solid #F0F0F0',
      }}
    >
      <div style={cell}>Foto</div>
      <div style={cell}>Propiedad</div>
      <div style={cell}>Views</div>
      <div style={cell}>Días</div>
      <div style={cell}>Acciones</div>
    </div>
  )
}

function FichaRow({
  ficha,
  onCopy,
  onRevoke,
}: {
  ficha: FichaItem
  onCopy: (url: string) => void
  onRevoke: () => void
}) {
  const url = `https://${NEUTRAL_DOMAIN}/${ficha.slug}`
  const revoked = !!ficha.revokedAt
  const waLink = `https://wa.me/?text=${encodeURIComponent(`Te paso esta propiedad: ${url}`)}`

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '70px 1fr 90px 110px 140px',
        gap: 12, padding: '14px 18px',
        alignItems: 'center', borderTop: '1px solid #F3F4F6',
      }}
    >
      <div
        style={{
          width: 56, height: 42, borderRadius: 8, overflow: 'hidden',
          background: '#F3F4F6',
        }}
      >
        {ficha.preview.thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ficha.preview.thumb}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13, fontWeight: 600, color: '#111',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {ficha.preview.titulo}
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
          {ficha.preview.precio}
        </div>
        {revoked && (
          <span
            style={{
              display: 'inline-block', marginTop: 4, padding: '2px 8px',
              background: '#F3F4F6', color: '#6B7280',
              fontSize: 10, fontWeight: 700, borderRadius: 999,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}
          >
            Revocada
          </span>
        )}
      </div>

      <div style={{ fontSize: 13, color: ficha.stats.views > 0 ? '#111' : '#9CA3AF' }}>
        {ficha.stats.views > 0 ? ficha.stats.views : 'Sin visitas'}
      </div>

      <div
        style={{
          fontSize: 13,
          color: ficha.diasRestantes <= 3 && !revoked ? '#B45309' : '#374151',
          fontWeight: 500,
        }}
      >
        {ficha.diasRestantes === 0 ? 'Expirada' : `${ficha.diasRestantes} días`}
      </div>

      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
        {!revoked && (
          <>
            <button
              type="button"
              onClick={() => onCopy(url)}
              aria-label="Copiar link"
              title="Copiar link"
              style={iconBtn}
            >
              <Copy size={15} />
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartir por WhatsApp"
              title="Compartir por WhatsApp"
              style={{ ...iconBtn, color: '#25D366' }}
            >
              <MessageCircle size={15} />
            </a>
            <button
              type="button"
              onClick={onRevoke}
              aria-label="Revocar"
              title="Revocar"
              style={{ ...iconBtn, color: '#B91C1C' }}
            >
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        padding: '60px 24px',
        textAlign: 'center',
        background: '#fff',
        border: '1px dashed #D1D5DB',
        borderRadius: 14,
      }}
    >
      <div style={{ display: 'inline-flex', color: '#9CA3AF', marginBottom: 12 }}>
        <Inbox size={28} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>
        Todavía no se generaron fichas
      </div>
      <div
        style={{
          fontSize: 13, color: '#6B7280', marginTop: 6,
          maxWidth: 380, marginLeft: 'auto', marginRight: 'auto',
          lineHeight: 1.5,
        }}
      >
        Desde el detalle de una propiedad, usá Compartir → Generar link para colega.
      </div>
    </div>
  )
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string
  message: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(15,23,42,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          background: '#fff', borderRadius: 16, padding: 24,
          width: '100%', maxWidth: 400,
          boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
          fontFamily: R,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <AlertTriangle size={18} color="#B91C1C" />
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{title}</div>
        </div>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.55, margin: 0 }}>{message}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '9px 16px', background: 'transparent',
              color: '#374151', border: '1px solid #D1D5DB', borderRadius: 999,
              fontSize: 13, fontWeight: 500, fontFamily: R, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '9px 16px', background: '#B91C1C',
              color: '#fff', border: 'none', borderRadius: 999,
              fontSize: 13, fontWeight: 700, fontFamily: R, cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function Toast({ text }: { text: string }) {
  return (
    <div
      role="status"
      style={{
        position: 'fixed', bottom: 28, left: '50%',
        transform: 'translateX(-50%)',
        background: '#111', color: '#fff',
        padding: '10px 18px', borderRadius: 999,
        fontSize: 13, fontWeight: 500,
        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
        zIndex: 60,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontFamily: R,
      }}
    >
      <Check size={14} color="#25D366" />
      {text}
    </div>
  )
}
