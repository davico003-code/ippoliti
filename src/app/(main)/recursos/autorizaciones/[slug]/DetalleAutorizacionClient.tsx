'use client'

// Detalle de una autorización en el panel del agente.
// Gate con team code (localStorage 'si_team_access'), fetch del JSON al
// API /api/autorizaciones/[slug], render con todos los datos + firma renderizada
// + acciones (descargar PDF, copiar link, volver al listado).

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Copy, FileText, Loader2, LogOut } from 'lucide-react'

import type { Autorizacion } from '@/lib/autorizaciones'
import {
  PROPIEDAD_LABEL,
  formatFechaFirma,
} from '@/lib/autorizaciones/documentoTexto'

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

interface Props { slug: string }

export default function DetalleAutorizacionClient({ slug }: Props) {
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
  return <DetalleView slug={slug} teamCode={teamCode} onUnauth={onLogout} onLogout={onLogout} />
}

function NoAccess() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        fontFamily: R,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          background: '#fff',
          border: `1px solid ${LINE}`,
          borderRadius: 14,
          padding: 28,
          maxWidth: 420,
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 15, color: TEXT_DARK, margin: '0 0 16px' }}>
          Necesitás código de equipo para ver esta autorización.
        </p>
        <Link
          href="/recursos/autorizaciones"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: GREEN,
            color: '#fff',
            borderRadius: 10,
            textDecoration: 'none',
            fontFamily: R,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Ir al panel
        </Link>
      </div>
    </div>
  )
}

function DetalleView({
  slug,
  teamCode,
  onUnauth,
  onLogout,
}: {
  slug: string
  teamCode: string
  onUnauth: () => void
  onLogout: () => void
}) {
  const [auth, setAuth] = useState<Autorizacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchAuth = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/autorizaciones/${slug}`, {
        headers: { 'x-team-code': teamCode },
      })
      if (res.status === 401) { onUnauth(); return }
      if (res.status === 404) { setError('Esta autorización no existe o fue eliminada.'); return }
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || `Error ${res.status}`)
        return
      }
      setAuth(data.item as Autorizacion)
    } catch {
      setError('Error de red')
    } finally {
      setLoading(false)
    }
  }, [slug, teamCode, onUnauth])

  useEffect(() => { void fetchAuth() }, [fetchAuth])

  const copyLink = async () => {
    const url = `${window.location.origin}/autorizacion/${slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: R }}>
      <header style={{ background: '#fff', borderBottom: `1px solid ${LINE}` }}>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <Link href="/" style={{ textDecoration: 'none', color: TEXT_DARK, fontWeight: 700, fontSize: 14 }}>
            SI INMOBILIARIA
          </Link>
          <button
            type="button"
            onClick={onLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: TEXT_MUTED,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '28px 20px 60px' }}>
        <Link
          href="/recursos/autorizaciones"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: TEXT_MUTED,
            textDecoration: 'none',
            marginBottom: 14,
          }}
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
          <div
            style={{
              background: '#fff',
              border: `1px solid ${LINE}`,
              borderRadius: 14,
              padding: 28,
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#B91C1C', fontSize: 14, margin: 0 }}>{error}</p>
          </div>
        )}

        {!loading && auth && (
          <DetalleContenido auth={auth} copied={copied} onCopy={() => void copyLink()} />
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  )
}

// ── Contenido ──────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function StatusBadge({ status }: { status: Autorizacion['status'] }) {
  const map: Record<Autorizacion['status'], { bg: string; color: string; label: string }> = {
    pendiente: { bg: '#FEF3C7', color: '#92400E', label: 'Pendiente' },
    firmada: { bg: GREEN_TINT, color: GREEN_DARK_TEXT, label: 'Firmada' },
    expirada: { bg: '#F3F3F0', color: '#6B6B66', label: 'Expirada' },
  }
  const s = map[status]
  return (
    <span
      style={{
        display: 'inline-block',
        background: s.bg,
        color: s.color,
        fontFamily: P,
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        padding: '4px 11px',
        borderRadius: 999,
      }}
    >
      {s.label}
    </span>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: `1px solid ${LINE}` }}>
      <div style={{ flex: '0 0 180px', fontSize: 12, color: TEXT_MUTED, fontFamily: P, textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 2 }}>
        {label}
      </div>
      <div style={{ flex: 1, fontSize: 14, color: TEXT_DARK }}>{value}</div>
    </div>
  )
}

function DetalleContenido({
  auth,
  copied,
  onCopy,
}: {
  auth: Autorizacion
  copied: boolean
  onCopy: () => void
}) {
  const serviciosActivos = (
    [
      ['luz', auth.servicios.luz],
      ['agua', auth.servicios.agua],
      ['gas', auth.servicios.gas],
      ['pavimento', auth.servicios.pavimento],
      ['cloacas', auth.servicios.cloacas],
    ] as const
  )
    .filter(([, v]) => v)
    .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
    .join(', ') || '—'

  return (
    <>
      <div
        style={{
          background: '#fff',
          border: `1px solid ${LINE}`,
          borderRadius: 14,
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div>
            <p
              style={{
                fontFamily: P,
                fontSize: 11,
                color: TEXT_MUTED,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                margin: '0 0 6px',
              }}
            >
              Autorización {auth.slug}
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT_DARK, margin: 0 }}>
              {auth.direccion}
            </h1>
          </div>
          <StatusBadge status={auth.status} />
        </div>

        <Row label="Fecha de creación" value={fmtDate(auth.created_at)} />
        <Row label="Tipo" value={auth.tipo === 'exclusiva' ? 'Exclusiva' : 'No exclusiva'} />
        <Row label="Plazo" value={`${auth.plazo_dias} días`} />
        <Row label="Renovación automática" value={auth.renovacion_automatica ? 'Activada' : 'Desactivada'} />
        <Row label="Tipo de propiedad" value={PROPIEDAD_LABEL[auth.tipo_propiedad]} />
        <Row label="Servicios" value={serviciosActivos} />
        <Row
          label="Expensas"
          value={
            auth.tiene_expensas && auth.expensas_monto_ars
              ? `$ ${auth.expensas_monto_ars.toLocaleString('es-AR')} mensual`
              : '—'
          }
        />
        <Row
          label="Precio venta (USD)"
          value={auth.precio_venta_usd ? `USD ${auth.precio_venta_usd.toLocaleString('en-US')}` : '— (se acordará por instrumento separado)'}
        />
        {auth.precio_publicacion_usd && (
          <Row label="Precio publicación (USD)" value={`USD ${auth.precio_publicacion_usd.toLocaleString('en-US')}`} />
        )}
        {(auth.cliente_precarga.nombre || auth.cliente_precarga.dni || auth.cliente_precarga.email) && (
          <Row
            label="Pre-carga cliente"
            value={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {auth.cliente_precarga.nombre && <span>{auth.cliente_precarga.nombre}</span>}
                {auth.cliente_precarga.dni && <span style={{ color: TEXT_SOFT }}>DNI {auth.cliente_precarga.dni}</span>}
                {auth.cliente_precarga.email && <span style={{ color: TEXT_SOFT }}>{auth.cliente_precarga.email}</span>}
              </div>
            }
          />
        )}
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
        {auth.status === 'firmada' && (
          <a
            href={`/api/autorizaciones/${auth.slug}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 18px',
              borderRadius: 12,
              background: GREEN,
              color: '#fff',
              fontFamily: R,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <FileText size={16} /> Descargar PDF
          </a>
        )}
        {auth.status === 'pendiente' && (
          <button
            type="button"
            onClick={onCopy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 18px',
              borderRadius: 12,
              background: '#fff',
              border: `1.5px solid ${GREEN}`,
              color: GREEN,
              fontFamily: R,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado' : 'Copiar link compartible'}
          </button>
        )}
      </div>

      {/* Firma renderizada */}
      {auth.signer && auth.signed_at && (
        <div
          style={{
            background: '#fff',
            border: `1px solid ${LINE}`,
            borderRadius: 14,
            padding: 24,
            marginTop: 24,
          }}
        >
          <p
            style={{
              fontFamily: P,
              fontSize: 11,
              color: TEXT_MUTED,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              margin: '0 0 14px',
            }}
          >
            Firma del autorizante
          </p>
          <div
            style={{
              border: `1px solid ${LINE}`,
              borderRadius: 10,
              padding: 12,
              background: '#fff',
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={auth.signer.firma_base64}
              alt="Firma manuscrita"
              style={{ maxWidth: 320, maxHeight: 120, width: 'auto', height: 'auto' }}
            />
          </div>
          <Row label="Nombre" value={auth.signer.nombre} />
          <Row label="DNI" value={auth.signer.dni} />
          <Row label="Domicilio" value={auth.signer.domicilio} />
          <Row label="Email" value={auth.signer.email} />
          <Row label="Firmado el" value={formatFechaFirma(new Date(auth.signed_at))} />
          {auth.signer.ip && <Row label="IP" value={auth.signer.ip} />}
          {auth.signer.user_agent && (
            <Row
              label="User agent"
              value={
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: TEXT_SOFT, wordBreak: 'break-all' }}>
                  {auth.signer.user_agent}
                </span>
              }
            />
          )}
        </div>
      )}
    </>
  )
}
