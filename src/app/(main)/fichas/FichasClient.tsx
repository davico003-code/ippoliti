'use client'

// Panel del equipo SI para ver / copiar / revocar fichas y gestionar colegas.
//
// Gating: localStorage si_team_access con TTL 30d. Si no hay acceso válido,
// muestra input de código. Toda llamada a /api/ficha/list, /api/ficha/[slug],
// /api/colegas* lleva header X-Team-Code con el valor leído de localStorage.
// Si una request devuelve 401, limpia localStorage y vuelve al login.

import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Copy,
  MessageCircle,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  Inbox,
  Users,
} from 'lucide-react'

const STORAGE_KEY = 'si_team_access'
const STORAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000
const R = "'Raleway', system-ui, sans-serif"
const GREEN = '#1A5C38'
const NEUTRAL_DOMAIN = process.env.NEXT_PUBLIC_NEUTRAL_DOMAIN || 'verficha.casa'

interface Colega {
  id: string
  nombre: string
  whatsapp: string
  email: string | null
}

interface FichaItem {
  slug: string
  propertyId: number
  colega: Colega
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

// ── localStorage helpers ─────────────────────────────────────────────────────

function readAccess(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as { code?: string; ts?: number }
    if (!data?.code || typeof data.ts !== 'number') return null
    if (Date.now() - data.ts > STORAGE_TTL_MS) return null
    return data.code
  } catch {
    return null
  }
}

function writeAccess(code: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ code, ts: Date.now() }))
  } catch {}
}

function clearAccess() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

// ── Component ────────────────────────────────────────────────────────────────

export default function FichasClient() {
  const [code, setCode] = useState<string | null>(null)
  const [tab, setTab] = useState<'fichas' | 'colegas'>('fichas')

  const [fichas, setFichas] = useState<FichaItem[]>([])
  const [colegas, setColegas] = useState<Colega[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Login state
  const [codeInput, setCodeInput] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const [toast, setToast] = useState<string | null>(null)

  // Modales
  const [confirmRevoke, setConfirmRevoke] = useState<FichaItem | null>(null)
  const [editColega, setEditColega] = useState<Colega | null>(null)
  const [confirmDeleteColega, setConfirmDeleteColega] = useState<Colega | null>(null)

  // ── Effects ──

  useEffect(() => {
    const stored = readAccess()
    if (stored) {
      setCode(stored)
      void loadAll(stored)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const flashToast = (text: string) => {
    setToast(text)
    setTimeout(() => setToast(null), 2200)
  }

  const expireAccess = (msg: string) => {
    clearAccess()
    setCode(null)
    setCodeInput('')
    setLoginError(msg)
    setFichas([])
    setColegas([])
  }

  const loadAll = async (c: string) => {
    setLoading(true)
    setLoadError(null)
    try {
      const [fRes, cRes] = await Promise.all([
        fetch('/api/ficha/list', { headers: { 'X-Team-Code': c } }),
        fetch('/api/colegas', { headers: { 'X-Team-Code': c } }),
      ])
      if (fRes.status === 401 || cRes.status === 401) {
        expireAccess('El código de equipo expiró. Volvé a ingresarlo.')
        return
      }
      const fData = await fRes.json()
      const cData = await cRes.json()
      setFichas(fData.fichas || [])
      setColegas(cData.colegas || [])
    } catch {
      setLoadError('No se pudo cargar la información. Probá recargar.')
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async () => {
    const c = codeInput.trim()
    if (!c) return
    setVerifying(true)
    setLoginError(null)
    try {
      const res = await fetch('/api/team/verify', {
        method: 'POST',
        headers: { 'X-Team-Code': c },
      })
      if (res.status === 401) {
        setLoginError('Código incorrecto.')
        return
      }
      if (!res.ok) {
        setLoginError('No se pudo verificar. Probá de nuevo.')
        return
      }
      writeAccess(c)
      setCode(c)
      void loadAll(c)
    } catch {
      setLoginError('Sin conexión.')
    } finally {
      setVerifying(false)
    }
  }

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      flashToast('Link copiado')
    } catch {}
  }

  const doRevoke = async (slug: string) => {
    if (!code) return
    try {
      const res = await fetch(`/api/ficha/${slug}`, {
        method: 'DELETE',
        headers: { 'X-Team-Code': code },
      })
      if (res.status === 401) { expireAccess('El código expiró.'); return }
      if (res.ok) {
        flashToast('Ficha revocada')
        void loadAll(code)
      } else {
        flashToast('No se pudo revocar')
      }
    } catch {
      flashToast('Error de red')
    } finally {
      setConfirmRevoke(null)
    }
  }

  const doDeleteColega = async (id: string) => {
    if (!code) return
    try {
      const res = await fetch(`/api/colegas/${id}`, {
        method: 'DELETE',
        headers: { 'X-Team-Code': code },
      })
      if (res.status === 401) { expireAccess('El código expiró.'); return }
      if (res.ok) {
        flashToast('Colega eliminado')
        void loadAll(code)
      } else {
        flashToast('No se pudo eliminar')
      }
    } catch {
      flashToast('Error de red')
    } finally {
      setConfirmDeleteColega(null)
    }
  }

  const doUpdateColega = async (
    id: string,
    patch: { nombre: string; whatsapp: string; email: string | null }
  ) => {
    if (!code) return false
    try {
      const res = await fetch(`/api/colegas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Team-Code': code },
        body: JSON.stringify(patch),
      })
      if (res.status === 401) { expireAccess('El código expiró.'); return false }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        flashToast(data?.error || 'No se pudo actualizar')
        return false
      }
      flashToast('Colega actualizado')
      void loadAll(code)
      return true
    } catch {
      flashToast('Error de red')
      return false
    }
  }

  // Conteo de fichas activas por colega (para la sección Colegas)
  const fichasActivasPorColega = useMemo(() => {
    const map = new Map<string, number>()
    for (const f of fichas) {
      if (f.revokedAt) continue
      map.set(f.colega.id, (map.get(f.colega.id) || 0) + 1)
    }
    return map
  }, [fichas])

  // ── Render: login ──
  if (!code) {
    return (
      <div
        style={{
          maxWidth: 380,
          margin: '60px auto 0',
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: 16,
          padding: 28,
        }}
      >
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111', margin: 0 }}>
          Acceso del equipo
        </h2>
        <p
          style={{
            fontSize: 13,
            color: '#6B7280',
            marginTop: 6,
            marginBottom: 18,
            lineHeight: 1.5,
          }}
        >
          Ingresá el código compartido para ver y administrar las fichas.
        </p>
        <label
          htmlFor="code"
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 600,
            color: '#374151',
            marginBottom: 6,
          }}
        >
          Código de equipo
        </label>
        <input
          id="code"
          type="password"
          autoFocus
          value={codeInput}
          onChange={e => { setCodeInput(e.target.value); setLoginError(null) }}
          onKeyDown={e => { if (e.key === 'Enter') verifyCode() }}
          placeholder="••••••••••"
          style={{
            width: '100%',
            padding: '12px 14px',
            border: '1px solid #D1D5DB',
            borderRadius: 10,
            fontSize: 14,
            fontFamily: R,
            boxSizing: 'border-box',
          }}
        />
        {loginError && (
          <div style={{ color: '#B91C1C', fontSize: 12, marginTop: 8 }}>{loginError}</div>
        )}
        <button
          type="button"
          onClick={verifyCode}
          disabled={verifying || !codeInput.trim()}
          style={{
            width: '100%',
            marginTop: 16,
            padding: '12px 18px',
            background: GREEN,
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: R,
            cursor: 'pointer',
            opacity: verifying || !codeInput.trim() ? 0.6 : 1,
          }}
        >
          {verifying ? 'Verificando…' : 'Acceder'}
        </button>
        <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 12, lineHeight: 1.5 }}>
          El código se guarda en este dispositivo por 30 días.
        </p>
      </div>
    )
  }

  // ── Render: panel ──
  const fichasActivas = fichas.filter(f => !f.revokedAt)
  const fichasRevocadas = fichas.filter(f => f.revokedAt)

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        <TabButton
          active={tab === 'fichas'}
          onClick={() => setTab('fichas')}
          icon={<Inbox size={14} />}
          label="Fichas activas"
          count={fichasActivas.length}
        />
        <TabButton
          active={tab === 'colegas'}
          onClick={() => setTab('colegas')}
          icon={<Users size={14} />}
          label="Mis colegas"
          count={colegas.length}
        />
      </div>

      {loading && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
          Cargando…
        </div>
      )}

      {loadError && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#B91C1C',
            padding: 14,
            borderRadius: 12,
            fontSize: 13,
            marginBottom: 18,
          }}
        >
          {loadError}
        </div>
      )}

      {/* ── Fichas tab ── */}
      {tab === 'fichas' && !loading && (
        <div>
          {fichasActivas.length === 0 && fichasRevocadas.length === 0 && (
            <EmptyState
              icon={<Inbox size={28} />}
              title="Todavía no generaste fichas"
              hint="Desde el detalle de una propiedad, usá Compartir → Generar link para colega."
            />
          )}

          {fichasActivas.length > 0 && (
            <div
              style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: 14,
                overflow: 'hidden',
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

          {fichasRevocadas.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 10,
                }}
              >
                Revocadas
              </h3>
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 14,
                  overflow: 'hidden',
                  opacity: 0.7,
                }}
              >
                <FichaHeaderRow />
                {fichasRevocadas.map(f => (
                  <FichaRow key={f.slug} ficha={f} onCopy={copyUrl} onRevoke={() => {}} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Colegas tab ── */}
      {tab === 'colegas' && !loading && (
        <div>
          {colegas.length === 0 ? (
            <EmptyState
              icon={<Users size={28} />}
              title="Todavía no agregaste colegas"
              hint="Cuando generes la primera ficha podés guardar al colega para reutilizarlo después."
            />
          ) : (
            <div
              style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              {colegas.map((c, i) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '14px 18px',
                    borderTop: i === 0 ? 'none' : '1px solid #F3F4F6',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{c.nombre}</div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#6B7280',
                        marginTop: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.whatsapp}
                      {c.email ? ` · ${c.email}` : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {fichasActivasPorColega.get(c.id) || 0} activas
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditColega(c)}
                    aria-label="Editar"
                    style={iconBtn}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteColega(c)}
                    aria-label="Eliminar"
                    style={{ ...iconBtn, color: '#B91C1C' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {confirmRevoke && (
        <ConfirmModal
          title="Revocar ficha"
          message={`El link "${confirmRevoke.preview.titulo}" dejará de funcionar inmediatamente. No se puede deshacer.`}
          confirmLabel="Revocar"
          danger
          onCancel={() => setConfirmRevoke(null)}
          onConfirm={() => doRevoke(confirmRevoke.slug)}
        />
      )}

      {confirmDeleteColega && (
        <ConfirmModal
          title="Eliminar colega"
          message={
            (fichasActivasPorColega.get(confirmDeleteColega.id) || 0) > 0
              ? `${confirmDeleteColega.nombre} tiene fichas activas. Eliminarlo no las revoca — los links seguirán funcionando con sus datos hasta que expiren. ¿Eliminar igual?`
              : `Eliminar a ${confirmDeleteColega.nombre} de la lista.`
          }
          confirmLabel="Eliminar"
          danger
          onCancel={() => setConfirmDeleteColega(null)}
          onConfirm={() => doDeleteColega(confirmDeleteColega.id)}
        />
      )}

      {editColega && (
        <EditColegaModal
          colega={editColega}
          onCancel={() => setEditColega(null)}
          onSave={async patch => {
            const ok = await doUpdateColega(editColega.id, patch)
            if (ok) setEditColega(null)
          }}
        />
      )}

      {toast && <Toast text={toast} />}
    </div>
  )
}

// ── Sub-componentes ─────────────────────────────────────────────────────────

const iconBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 6,
  borderRadius: 8,
  color: '#6B7280',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        background: active ? '#fff' : 'transparent',
        color: active ? '#111' : '#6B7280',
        border: active ? '1px solid #E5E7EB' : '1px solid transparent',
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: R,
        cursor: 'pointer',
      }}
    >
      {icon}
      {label}
      <span
        style={{
          background: active ? '#F3F4F6' : '#E5E7EB',
          color: '#374151',
          padding: '2px 8px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        {count}
      </span>
    </button>
  )
}

function FichaHeaderRow() {
  const cellStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  }
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '70px 1fr 180px 90px 110px 140px',
        gap: 12,
        padding: '12px 18px',
        background: '#FAFAFA',
        borderBottom: '1px solid #F0F0F0',
      }}
    >
      <div style={cellStyle}>Foto</div>
      <div style={cellStyle}>Propiedad / Colega</div>
      <div style={cellStyle}>WhatsApp del colega</div>
      <div style={cellStyle}>Views</div>
      <div style={cellStyle}>Días</div>
      <div style={cellStyle}>Acciones</div>
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
  const waLink = `https://wa.me/${ficha.colega.whatsapp}?text=${encodeURIComponent(
    `Te paso esta propiedad: ${url}`,
  )}`

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '70px 1fr 180px 90px 110px 140px',
        gap: 12,
        padding: '14px 18px',
        alignItems: 'center',
        borderTop: '1px solid #F3F4F6',
      }}
    >
      {/* Thumb */}
      <div
        style={{
          width: 56,
          height: 42,
          borderRadius: 8,
          overflow: 'hidden',
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

      {/* Título + colega */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#111',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {ficha.preview.titulo}
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
          {ficha.preview.precio} · Colega: {ficha.colega.nombre}
        </div>
        {revoked && (
          <span
            style={{
              display: 'inline-block',
              marginTop: 4,
              padding: '2px 8px',
              background: '#F3F4F6',
              color: '#6B7280',
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 999,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Revocada
          </span>
        )}
      </div>

      {/* WhatsApp del colega */}
      <div style={{ fontSize: 12, color: '#374151', fontFamily: 'ui-monospace, monospace' }}>
        {ficha.colega.whatsapp}
      </div>

      {/* Views */}
      <div style={{ fontSize: 13, color: ficha.stats.views > 0 ? '#111' : '#9CA3AF' }}>
        {ficha.stats.views > 0 ? ficha.stats.views : 'Sin visitas aún'}
      </div>

      {/* Días restantes */}
      <div
        style={{
          fontSize: 13,
          color: ficha.diasRestantes <= 3 && !revoked ? '#B45309' : '#374151',
          fontWeight: 500,
        }}
      >
        {ficha.diasRestantes === 0 ? 'Expirada' : `${ficha.diasRestantes} días`}
      </div>

      {/* Acciones */}
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
              aria-label="WhatsApp al colega"
              title="WhatsApp al colega"
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

function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode
  title: string
  hint: string
}) {
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
      <div style={{ display: 'inline-flex', color: '#9CA3AF', marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{title}</div>
      <div
        style={{
          fontSize: 13,
          color: '#6B7280',
          marginTop: 6,
          maxWidth: 380,
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.5,
        }}
      >
        {hint}
      </div>
    </div>
  )
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  danger,
  onCancel,
  onConfirm,
}: {
  title: string
  message: string
  confirmLabel: string
  danger?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(15,23,42,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
          fontFamily: R,
        }}
        role="dialog"
        aria-modal="true"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          {danger && <AlertTriangle size={18} color="#B91C1C" />}
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{title}</div>
        </div>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.55, margin: 0 }}>{message}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '9px 16px',
              background: 'transparent',
              color: '#374151',
              border: '1px solid #D1D5DB',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: R,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '9px 16px',
              background: danger ? '#B91C1C' : GREEN,
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: R,
              cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function EditColegaModal({
  colega,
  onCancel,
  onSave,
}: {
  colega: Colega
  onCancel: () => void
  onSave: (patch: { nombre: string; whatsapp: string; email: string | null }) => Promise<void>
}) {
  const [nombre, setNombre] = useState(colega.nombre)
  const [whatsapp, setWhatsapp] = useState(colega.whatsapp)
  const [email, setEmail] = useState(colega.email || '')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!nombre.trim()) return
    if (whatsapp.replace(/\D/g, '').length < 10) return
    setSaving(true)
    await onSave({
      nombre: nombre.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim() || null,
    })
    setSaving(false)
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  }
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: R,
    boxSizing: 'border-box',
  }

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(15,23,42,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
          fontFamily: R,
        }}
        role="dialog"
        aria-modal="true"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Editar colega</div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar"
            style={{ ...iconBtn, padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        <label style={labelStyle}>Nombre</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} />

        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>WhatsApp</label>
          <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Email (opcional)</label>
          <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '9px 16px',
              background: 'transparent',
              color: '#374151',
              border: '1px solid #D1D5DB',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: R,
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            style={{
              padding: '9px 16px',
              background: GREEN,
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: R,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Toast({ text }: { text: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#111',
        color: '#fff',
        padding: '10px 18px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 500,
        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
        zIndex: 60,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: R,
      }}
      role="status"
    >
      <Check size={14} color="#25D366" />
      {text}
    </div>
  )
}
