'use client'

// Panel admin de leads de Visitas — listado con filtros por estado y acciones
// rápidas. Mismo patrón de gating con team-code que /recursos/autorizaciones.

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ExternalLink,
  Loader2,
  LogOut,
  MessageCircle,
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
const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"

type FilterStatus = VisitaStatus | 'all'

// ── Entry ───────────────────────────────────────────────────────────────────

export default function VisitasClient() {
  const [teamCode, setTeamCode] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setTeamCode(window.localStorage.getItem(STORAGE_KEY))
    setChecking(false)
  }, [])

  const onAuth = (code: string) => {
    window.localStorage.setItem(STORAGE_KEY, code)
    setTeamCode(code)
  }
  const onLogout = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setTeamCode(null)
  }

  if (checking) return null
  if (!teamCode) return <AccessGate onAuth={onAuth} />
  return <Panel teamCode={teamCode} onUnauth={onLogout} onLogout={onLogout} />
}

// ── Gate ────────────────────────────────────────────────────────────────────

function AccessGate({ onAuth }: { onAuth: (code: string) => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!code.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/visitas/listar?status=all&limit=1', {
        headers: { 'x-team-code': code.trim() },
      })
      if (res.status === 401) {
        setError('Código incorrecto')
        return
      }
      if (!res.ok) {
        setError(`Error ${res.status}`)
        return
      }
      onAuth(code.trim())
    } catch {
      setError('Error de red')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: R }}>
      <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 28, maxWidth: 380, width: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <p style={{ fontFamily: P, fontSize: 11, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, margin: '0 0 8px' }}>● Panel SI</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT_DARK, margin: '0 0 6px' }}>Acceso de equipo</h1>
        <p style={{ fontSize: 14, color: TEXT_SOFT, margin: '0 0 20px', lineHeight: 1.5 }}>
          Ingresá el código del equipo para ver los leads de visitas.
        </p>
        <input
          type="password"
          autoComplete="off"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') void submit() }}
          placeholder="Código de equipo"
          disabled={submitting}
          style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 15, fontFamily: R, outline: 'none', marginBottom: 12, background: '#fff' }}
        />
        {error && <p style={{ fontSize: 13, color: '#B91C1C', margin: '0 0 12px' }}>{error}</p>}
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting || !code.trim()}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: 'none', background: GREEN, color: '#fff', fontFamily: R, fontSize: 15, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', opacity: submitting || !code.trim() ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? 'Validando…' : 'Ingresar'}
        </button>
      </div>
    </div>
  )
}

// ── Panel principal ────────────────────────────────────────────────────────

function Panel({ teamCode, onUnauth, onLogout }: { teamCode: string; onUnauth: () => void; onLogout: () => void }) {
  const [items, setItems] = useState<VisitaLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('all')

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/visitas/listar?status=${filter}&limit=50`, {
        headers: { 'x-team-code': teamCode },
      })
      if (res.status === 401) { onUnauth(); return }
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || `Error ${res.status}`)
        return
      }
      setItems((data.items || []) as VisitaLead[])
    } catch {
      setError('Error de red')
    } finally {
      setLoading(false)
    }
  }, [teamCode, filter, onUnauth])

  useEffect(() => { void fetchList() }, [fetchList])

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: R }}>
      <Header onLogout={onLogout} />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 20px 80px' }}>
        <PageHeader count={items.length} />

        <FilterTabs value={filter} onChange={setFilter} />

        {error && (
          <p style={{ marginTop: 12, color: '#B91C1C', fontSize: 13 }}>{error}</p>
        )}

        <ListadoTable
          items={items}
          loading={loading}
          onRefresh={() => void fetchList()}
        />
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      ` }} />
    </div>
  )
}

// ── Header / page header ───────────────────────────────────────────────────

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

function PageHeader({ count }: { count: number }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontFamily: P, fontSize: 12, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, margin: '0 0 10px' }}>
        ● Recursos · Visitas
      </p>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: TEXT_DARK, margin: '0 0 8px', lineHeight: 1.15 }}>
        Leads de visitas
      </h1>
      <p style={{ fontSize: 15, color: TEXT_SOFT, margin: 0, lineHeight: 1.55 }}>
        {count} {count === 1 ? 'lead' : 'leads'} cargados · datos del cliente, propiedad solicitada y horario propuesto.
      </p>
    </div>
  )
}

// ── Tabs de filtro ─────────────────────────────────────────────────────────

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'confirmada', label: 'Confirmadas' },
  { value: 'realizada', label: 'Realizadas' },
  { value: 'cancelada', label: 'Canceladas' },
]

function FilterTabs({ value, onChange }: { value: FilterStatus; onChange: (v: FilterStatus) => void }) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: 6,
        padding: 4,
        background: '#fff',
        border: `1px solid ${LINE}`,
        borderRadius: 12,
        marginBottom: 18,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {FILTER_OPTIONS.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: active ? GREEN : 'transparent',
              color: active ? '#fff' : TEXT_SOFT,
              fontFamily: R,
              fontSize: 14,
              fontWeight: 600,
              transition: 'background 150ms ease, color 150ms ease',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Listado ─────────────────────────────────────────────────────────────────

function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function fmtFechaPedida(yyyymmdd: string): string {
  // 'YYYY-MM-DD' → '17/05/26' aproximado
  const parts = yyyymmdd.split('-')
  if (parts.length !== 3) return yyyymmdd
  return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`
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
    <span style={{ display: 'inline-block', background: s.bg, color: s.color, fontFamily: P, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '3px 9px', borderRadius: 999 }}>
      {s.label}
    </span>
  )
}

function ListadoTable({
  items,
  loading,
  onRefresh,
}: {
  items: VisitaLead[]
  loading: boolean
  onRefresh: () => void
}) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: TEXT_DARK, margin: 0 }}>
          Leads
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          style={{ fontSize: 13, color: TEXT_MUTED, background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          Actualizar
        </button>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: TEXT_MUTED, fontSize: 14 }}>
            <Loader2 size={16} className="animate-spin" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />
            Cargando…
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: TEXT_MUTED, fontSize: 14 }}>
            No hay leads en este filtro.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: R }}>
              <thead>
                <tr style={{ background: BG, borderBottom: `1px solid ${LINE}` }}>
                  <Th>Recibido</Th>
                  <Th>Cliente</Th>
                  <Th>Propiedad</Th>
                  <Th>Visita pedida</Th>
                  <Th>Estado</Th>
                  <Th align="right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {items.map(v => (
                  <tr key={v.id} style={{ borderBottom: `1px solid ${LINE}` }}>
                    <Td>
                      <span style={{ fontSize: 12, color: TEXT_MUTED }}>{fmtDateTime(v.created_at)}</span>
                    </Td>
                    <Td>
                      <span style={{ fontWeight: 600, color: TEXT_DARK }}>{v.nombre}</span>
                      <br />
                      <span style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: 'ui-monospace, monospace' }}>{v.telefono}</span>
                    </Td>
                    <Td>
                      {v.propiedad_url ? (
                        <a
                          href={v.propiedad_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: TEXT_DARK, textDecoration: 'none' }}
                        >
                          <span style={{ fontWeight: 500 }}>{v.propiedad_titulo}</span>
                          <ExternalLink size={11} style={{ display: 'inline-block', marginLeft: 4, verticalAlign: 'middle' }} />
                        </a>
                      ) : (
                        <span style={{ color: TEXT_DARK }}>{v.propiedad_titulo}</span>
                      )}
                      <br />
                      <span style={{ fontSize: 11, color: TEXT_MUTED }}>ID {v.propiedad_id}</span>
                    </Td>
                    <Td>
                      <span style={{ color: TEXT_DARK, fontWeight: 500 }}>{fmtFechaPedida(v.fecha_preferida)}</span>
                      <br />
                      <span style={{ fontSize: 11, color: TEXT_MUTED }}>{v.horario}</span>
                    </Td>
                    <Td><StatusBadge status={v.status} /></Td>
                    <Td align="right">
                      <RowActions visita={v} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      style={{
        textAlign: align,
        padding: '10px 14px',
        fontFamily: P,
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: TEXT_MUTED,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </th>
  )
}

function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <td
      style={{
        padding: '12px 14px',
        fontSize: 13,
        color: TEXT_SOFT,
        textAlign: align,
        verticalAlign: 'top',
      }}
    >
      {children}
    </td>
  )
}

function RowActions({ visita }: { visita: VisitaLead }) {
  const waHref = (() => {
    const limpio = visita.telefono.replace(/\D/g, '')
    if (!limpio) return null
    // Asumir AR si no empieza con 54
    const numero = limpio.startsWith('54') ? limpio : `54${limpio}`
    const txt = encodeURIComponent(
      `Hola ${visita.nombre.split(/\s+/)[0]}, te escribo de SI INMOBILIARIA por tu pedido de visita a "${visita.propiedad_titulo}".`,
    )
    return `https://wa.me/${numero}?text=${txt}`
  })()

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Link
        href={`/recursos/visitas/${visita.id}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: GREEN, textDecoration: 'none', fontWeight: 600 }}
        title="Ver detalle"
      >
        <ExternalLink size={13} /> Ver
      </Link>
      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}
          title="Escribirle por WhatsApp"
        >
          <MessageCircle size={13} /> WhatsApp
        </a>
      )}
    </div>
  )
}
