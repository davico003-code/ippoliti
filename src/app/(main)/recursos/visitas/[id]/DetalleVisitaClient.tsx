'use client'

// Detalle de un lead de visita en el panel admin.
// Gate con team-code, cambio de status (4 opciones), notas internas con
// autosave debounce 800ms, eliminar al pie.

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Loader2,
  LogOut,
  MessageCircle,
  Trash2,
} from 'lucide-react'

import type { VisitaLead, VisitaStatus } from '@/lib/visitas'

const STORAGE_KEY = 'si_team_access'
const GREEN = '#1A5C38'
const GREEN_TINT = '#E8F2EC'
const GREEN_DARK_TEXT = '#0F3C24'
const LINE = '#E5E5E0'
const BG = '#FAFAF9'
const TEXT_DARK = '#1A1A1A'
const TEXT_MUTED = '#6B6B66'
const TEXT_SOFT = '#5A5A55'
const INTERNAL_BG = '#FFFDF5'
const INTERNAL_BORDER = '#F0E4B8'
const INTERNAL_LABEL_TEXT = '#92400E'
const RED = '#B91C1C'
const RED_BORDER = '#FECACA'
const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"

interface Props { id: string }

// ── Entry ───────────────────────────────────────────────────────────────────

export default function DetalleVisitaClient({ id }: Props) {
  const [teamCode, setTeamCode] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setTeamCode(window.localStorage.getItem(STORAGE_KEY))
    setChecking(false)
  }, [])

  const onLogout = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setTeamCode(null)
  }

  if (checking) return null
  if (!teamCode) return <NoAccess />
  return <DetalleView id={id} teamCode={teamCode} onUnauth={onLogout} onLogout={onLogout} />
}

function NoAccess() {
  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: R, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 28, maxWidth: 420, textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: TEXT_DARK, margin: '0 0 16px' }}>
          Necesitás código de equipo para ver este lead.
        </p>
        <Link href="/recursos/visitas" style={{ display: 'inline-block', padding: '10px 20px', background: GREEN, color: '#fff', borderRadius: 10, textDecoration: 'none', fontFamily: R, fontWeight: 600, fontSize: 14 }}>
          Ir al panel
        </Link>
      </div>
    </div>
  )
}

// ── Detalle ────────────────────────────────────────────────────────────────

function DetalleView({
  id,
  teamCode,
  onUnauth,
  onLogout,
}: {
  id: string
  teamCode: string
  onUnauth: () => void
  onLogout: () => void
}) {
  const router = useRouter()
  const [visita, setVisita] = useState<VisitaLead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const fetchOne = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/visitas/${id}`, {
        headers: { 'x-team-code': teamCode },
      })
      if (res.status === 401) { onUnauth(); return }
      if (res.status === 404) { setError('Este lead no existe o fue eliminado.'); return }
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || `Error ${res.status}`)
        return
      }
      setVisita(data.item as VisitaLead)
    } catch {
      setError('Error de red')
    } finally {
      setLoading(false)
    }
  }, [id, teamCode, onUnauth])

  useEffect(() => { void fetchOne() }, [fetchOne])

  const handleDelete = async () => {
    if (typeof window === 'undefined') return
    const code = window.prompt('Clave de eliminación (SI_DELETE_CODE):')
    if (!code) return
    try {
      const res = await fetch(`/api/visitas/${id}`, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json', 'x-team-code': teamCode },
        body: JSON.stringify({ delete_code: code }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        window.alert(data?.error || `Error ${res.status}`)
        return
      }
      setToast('Lead eliminado')
      setTimeout(() => router.push('/recursos/visitas'), 600)
    } catch {
      window.alert('Error de red al eliminar')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: R }}>
      <Header onLogout={onLogout} />
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '24px 20px 60px' }}>
        <Link
          href="/recursos/visitas"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: TEXT_MUTED, textDecoration: 'none', marginBottom: 16 }}
        >
          <ArrowLeft size={14} /> Volver al listado
        </Link>

        {loading && (
          <div style={{ padding: 40, textAlign: 'center', color: TEXT_MUTED }}>
            <Loader2 size={18} className="animate-spin" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} />
            Cargando…
          </div>
        )}

        {!loading && error && (
          <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 28, textAlign: 'center' }}>
            <p style={{ color: RED, fontSize: 14, margin: 0 }}>{error}</p>
          </div>
        )}

        {!loading && visita && (
          <DetalleContenido
            visita={visita}
            teamCode={teamCode}
            onAuthRefresh={setVisita}
            onUnauth={onUnauth}
            onAskDelete={handleDelete}
          />
        )}
      </main>

      {toast && <Toast text={toast} />}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function Header({ onLogout }: { onLogout: () => void }) {
  return (
    <header style={{ background: '#fff', borderBottom: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Link href="/" style={{ textDecoration: 'none', color: TEXT_DARK, fontWeight: 700, fontSize: 14 }}>
          SI INMOBILIARIA
        </Link>
        <button
          type="button"
          onClick={onLogout}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: TEXT_MUTED, background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}

function Toast({ text }: { text: string }) {
  return (
    <div
      role="status"
      style={{ position: 'fixed', bottom: 24, right: 24, background: GREEN, color: '#fff', padding: '12px 18px', borderRadius: 12, fontFamily: R, fontSize: 14, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', zIndex: 200, animation: 'toastIn 200ms ease' }}
    >
      ✓ {text}
    </div>
  )
}

// ── Contenido ──────────────────────────────────────────────────────────────

function fmtFechaVisita(yyyymmdd: string): string {
  const parts = yyyymmdd.split('-')
  if (parts.length !== 3) return yyyymmdd
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function StatusBadge({ status }: { status: VisitaStatus }) {
  const map: Record<VisitaStatus, { bg: string; color: string; label: string }> = {
    pendiente: { bg: '#FEF3C7', color: '#92400E', label: 'Pendiente' },
    confirmada: { bg: '#DBEAFE', color: '#1E3A8A', label: 'Confirmada' },
    realizada: { bg: GREEN_TINT, color: GREEN_DARK_TEXT, label: 'Realizada' },
    cancelada: { bg: '#F3F3F0', color: '#6B6B66', label: 'Cancelada' },
  }
  const s = map[status]
  return (
    <span style={{ display: 'inline-block', background: s.bg, color: s.color, fontFamily: P, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 11px', borderRadius: 999 }}>
      {s.label}
    </span>
  )
}

function DetalleContenido({
  visita,
  teamCode,
  onAuthRefresh,
  onUnauth,
  onAskDelete,
}: {
  visita: VisitaLead
  teamCode: string
  onAuthRefresh: (v: VisitaLead) => void
  onUnauth: () => void
  onAskDelete: () => void
}) {
  const waCliente = (() => {
    const limpio = visita.telefono.replace(/\D/g, '')
    if (!limpio) return null
    const numero = limpio.startsWith('54') ? limpio : `54${limpio}`
    const txt = encodeURIComponent(
      `Hola ${visita.nombre.split(/\s+/)[0]}, te escribo de SI INMOBILIARIA por tu pedido de visita a "${visita.propiedad_titulo}".`,
    )
    return `https://wa.me/${numero}?text=${txt}`
  })()

  return (
    <>
      {/* Encabezado */}
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontFamily: P, fontSize: 11, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 8px', fontWeight: 600 }}>
          ● Lead de visita
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT_DARK, margin: 0, lineHeight: 1.2 }}>
            {visita.nombre}
          </h1>
          <div style={{ flexShrink: 0, marginTop: 4 }}>
            <StatusBadge status={visita.status} />
          </div>
        </div>
        <p style={{ fontSize: 13, color: TEXT_MUTED, margin: '10px 0 0', lineHeight: 1.5 }}>
          Recibido el {fmtDateTime(visita.created_at)} · ID: <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{visita.id}</code>
          {visita.updated_at ? <> · actualizado {fmtDateTime(visita.updated_at)}</> : null}
        </p>
      </div>

      {/* Card: Datos del cliente */}
      <Card>
        <CardTitle>Datos del cliente</CardTitle>
        <KvRow label="Nombre" value={visita.nombre} />
        <KvRow label="Teléfono" value={
          <span style={{ fontFamily: 'ui-monospace, monospace' }}>{visita.telefono}</span>
        } />
        {visita.email && <KvRow label="Email" value={visita.email} />}
        {waCliente && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${LINE}` }}>
            <a
              href={waCliente}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: '#16a34a', color: '#fff', fontFamily: R, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
            >
              <MessageCircle size={15} /> Escribirle por WhatsApp
            </a>
          </div>
        )}
      </Card>

      {/* Card: Visita solicitada */}
      <Card>
        <CardTitle>Visita solicitada</CardTitle>
        <KvRow label="Día propuesto" value={
          <span style={{ textTransform: 'capitalize' }}>{fmtFechaVisita(visita.fecha_preferida)}</span>
        } />
        <KvRow label="Horario" value={visita.horario} />
        <KvRow
          label="Tipo de operación"
          value={visita.tipo === 'venta' ? 'Venta' : visita.tipo === 'alquiler' ? 'Alquiler' : 'Temporario'}
          last
        />
      </Card>

      {/* Card: Propiedad */}
      <Card>
        <CardTitle>Propiedad</CardTitle>
        <KvRow label="Título" value={visita.propiedad_titulo} />
        <KvRow label="ID Tokko" value={
          <span style={{ fontFamily: 'ui-monospace, monospace' }}>{visita.propiedad_id}</span>
        } />
        {visita.propiedad_url && (
          <KvRow
            label="Link"
            value={
              <a
                href={visita.propiedad_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: GREEN, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                Abrir ficha <ExternalLink size={12} />
              </a>
            }
            last
          />
        )}
      </Card>

      {/* Card: Estado (cambio de status) */}
      <EstadoCard
        visita={visita}
        teamCode={teamCode}
        onAuthRefresh={onAuthRefresh}
        onUnauth={onUnauth}
      />

      {/* Card: Notas internas (autosave) */}
      <NotasInternasCard
        visita={visita}
        teamCode={teamCode}
        onAuthRefresh={onAuthRefresh}
        onUnauth={onUnauth}
      />

      {/* Metadata técnica */}
      <Card>
        <CardTitle>Metadata</CardTitle>
        <KvRow label="Origen" value={
          visita.source === 'mobile-sticky' ? 'Mobile sticky bar' :
          visita.source === 'desktop-sidebar' ? 'Desktop sidebar' :
          visita.source === 'emprendimiento' ? 'Ficha emprendimiento' : 'Otro'
        } />
        {visita.ip && <KvRow label="IP" value={
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{visita.ip}</span>
        } />}
        {visita.user_agent && <KvRow label="User agent" value={
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, color: TEXT_SOFT, wordBreak: 'break-all' }}>{visita.user_agent}</span>
        } last />}
      </Card>

      {/* Eliminar al pie */}
      <hr style={{ border: 'none', borderTop: `1px solid ${LINE}`, margin: '36px 0 20px' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onAskDelete}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: '#fff', border: `1px solid ${RED_BORDER}`, color: RED, fontFamily: R, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <Trash2 size={14} /> Eliminar lead
        </button>
      </div>
    </>
  )
}

// ── Subcards ────────────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, marginBottom: 18 }}>
      {children}
    </div>
  )
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: P,
        fontSize: 11,
        fontWeight: 600,
        color: TEXT_MUTED,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        margin: '0 0 14px',
      }}
    >
      {children}
    </p>
  )
}

function KvRow({ label, value, last }: { label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '10px 0',
        borderBottom: last ? 'none' : `1px solid ${LINE}`,
      }}
    >
      <div style={{ flex: '0 0 160px', fontSize: 12, color: TEXT_MUTED, fontFamily: P, textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 2 }}>
        {label}
      </div>
      <div style={{ flex: 1, fontSize: 14, color: TEXT_DARK }}>{value}</div>
    </div>
  )
}

function EstadoCard({
  visita,
  teamCode,
  onAuthRefresh,
  onUnauth,
}: {
  visita: VisitaLead
  teamCode: string
  onAuthRefresh: (v: VisitaLead) => void
  onUnauth: () => void
}) {
  const [saving, setSaving] = useState<VisitaStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const setStatus = async (next: VisitaStatus) => {
    if (next === visita.status || saving) return
    setSaving(next)
    setError(null)
    try {
      const res = await fetch(`/api/visitas/${visita.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', 'x-team-code': teamCode },
        body: JSON.stringify({ status: next }),
      })
      if (res.status === 401) { onUnauth(); return }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || `Error ${res.status}`)
        return
      }
      if (data.item) onAuthRefresh(data.item as VisitaLead)
    } catch {
      setError('Error de red')
    } finally {
      setSaving(null)
    }
  }

  const OPTIONS: { value: VisitaStatus; label: string }[] = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'realizada', label: 'Realizada' },
    { value: 'cancelada', label: 'Cancelada' },
  ]

  return (
    <Card>
      <CardTitle>Cambiar estado</CardTitle>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
        }}
      >
        {OPTIONS.map(opt => {
          const active = visita.status === opt.value
          const isSaving = saving === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => void setStatus(opt.value)}
              disabled={active || saving !== null}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                border: `1.5px solid ${active ? GREEN : LINE}`,
                background: active ? GREEN_TINT : '#fff',
                color: active ? GREEN_DARK_TEXT : TEXT_DARK,
                fontFamily: P,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: active || saving !== null ? 'default' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                opacity: saving !== null && !isSaving && !active ? 0.5 : 1,
              }}
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : active ? <Check size={13} /> : null}
              {opt.label}
            </button>
          )
        })}
      </div>
      {error && <p style={{ marginTop: 10, fontSize: 12, color: RED }}>{error}</p>}
    </Card>
  )
}

function NotasInternasCard({
  visita,
  teamCode,
  onAuthRefresh,
  onUnauth,
}: {
  visita: VisitaLead
  teamCode: string
  onAuthRefresh: (v: VisitaLead) => void
  onUnauth: () => void
}) {
  const [value, setValue] = useState(visita.notas_internas || '')
  const [savedValue, setSavedValue] = useState(visita.notas_internas || '')
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const errorRef = useRef<string | null>(null)

  const saveNow = useCallback(async (next: string) => {
    setSaving('saving')
    try {
      const res = await fetch(`/api/visitas/${visita.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', 'x-team-code': teamCode },
        body: JSON.stringify({ notas_internas: next || null }),
      })
      if (res.status === 401) { onUnauth(); return }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        errorRef.current = data?.error || `Error ${res.status}`
        setSaving('error')
        return
      }
      setSavedValue(next)
      if (data?.item) onAuthRefresh(data.item as VisitaLead)
      setSaving('saved')
      setTimeout(() => setSaving(s => (s === 'saved' ? 'idle' : s)), 2000)
    } catch {
      errorRef.current = 'Error de red'
      setSaving('error')
    }
  }, [visita.id, teamCode, onAuthRefresh, onUnauth])

  useEffect(() => {
    if (value === savedValue) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => { void saveNow(value) }, 800)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [value, savedValue, saveNow])

  const statusLine = (() => {
    if (saving === 'saving') return { text: 'Guardando…', color: TEXT_MUTED }
    if (saving === 'saved') return { text: 'Guardado ✓', color: GREEN }
    if (saving === 'error') return { text: `Error: ${errorRef.current || 'no se pudo guardar'}`, color: RED }
    return { text: ' ', color: TEXT_MUTED }
  })()

  return (
    <div
      style={{
        background: INTERNAL_BG,
        border: `1px solid ${INTERNAL_BORDER}`,
        borderRadius: 14,
        padding: 20,
        marginBottom: 18,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <p style={{ fontFamily: P, fontSize: 11, fontWeight: 600, color: INTERNAL_LABEL_TEXT, textTransform: 'uppercase', letterSpacing: '0.14em', margin: 0 }}>
          Notas internas
        </p>
      </div>
      <p style={{ fontSize: 12, color: INTERNAL_LABEL_TEXT, margin: '0 0 10px', lineHeight: 1.5 }}>
        Solo lo vemos nosotros. El cliente nunca ve este texto.
      </p>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Resumen de la llamada, qué busca, observaciones..."
        rows={4}
        maxLength={2000}
        style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, border: `1px solid ${INTERNAL_BORDER}`, fontSize: 14, fontFamily: R, outline: 'none', background: '#fff', resize: 'vertical', minHeight: 80, color: TEXT_DARK, lineHeight: 1.5 }}
      />
      <p
        style={{ marginTop: 6, minHeight: 16, fontFamily: P, fontSize: 11, color: statusLine.color }}
        aria-live="polite"
      >
        {statusLine.text}
      </p>
    </div>
  )
}
