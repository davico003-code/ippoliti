'use client'

// Detalle de un acuerdo en el panel del agente.
//
// Gate con team-code (localStorage 'si_team_access'), fetch del JSON al
// /api/autorizaciones/[slug], render con:
//   - Encabezado con pill + título dirección + sub-info + badge estado
//   - Grid 2 cards de precio (publicación PÚBLICO / venta INTERNO)
//   - Card notas internas editable con autosave debounce 800ms
//   - Card cliente firmante (pendiente con pre-carga / firmada con firma)
//   - Botonera Copiar link + WhatsApp
//   - Botón Eliminar acuerdo al pie (abre DeleteAcuerdoModal)

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  Copy,
  FileText,
  Loader2,
  LogOut,
  MessageCircle,
  Trash2,
} from 'lucide-react'

import type { Autorizacion } from '@/lib/autorizaciones'
import {
  PROPIEDAD_LABEL,
  WHATSAPP_TEMPLATE,
  formatFechaFirma,
} from '@/lib/autorizaciones/documentoTexto'

import DeleteAcuerdoModal from './DeleteAcuerdoModal'

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
const INTERNAL_LABEL_BG = '#FEF3C7'
const INTERNAL_LABEL_TEXT = '#92400E'
const RED = '#B91C1C'
const RED_BORDER = '#FECACA'
const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"

interface Props { slug: string }

// ── Entry ───────────────────────────────────────────────────────────────────

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
    <div style={{ minHeight: '100vh', background: BG, fontFamily: R, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 28, maxWidth: 420, textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: TEXT_DARK, margin: '0 0 16px' }}>
          Necesitás código de equipo para ver este acuerdo.
        </p>
        <Link href="/recursos/autorizaciones" style={{ display: 'inline-block', padding: '10px 20px', background: GREEN, color: '#fff', borderRadius: 10, textDecoration: 'none', fontFamily: R, fontWeight: 600, fontSize: 14 }}>
          Ir al panel
        </Link>
      </div>
    </div>
  )
}

// ── Detalle ────────────────────────────────────────────────────────────────

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
  const router = useRouter()
  const [auth, setAuth] = useState<Autorizacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const fetchAuth = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/autorizaciones/${slug}`, {
        headers: { 'x-team-code': teamCode },
      })
      if (res.status === 401) { onUnauth(); return }
      if (res.status === 404) { setError('Este acuerdo no existe o fue eliminado.'); return }
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

  const propertyUrl = () => `${window.location.origin}/autorizacion/${slug}`

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const onWhatsApp = () => {
    const text = encodeURIComponent(WHATSAPP_TEMPLATE(propertyUrl()))
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  const onDeleted = () => {
    setDeleteOpen(false)
    setToast('Acuerdo eliminado')
    setTimeout(() => router.push('/recursos/autorizaciones'), 600)
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: R }}>
      <Header onLogout={onLogout} />

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '24px 20px 60px' }}>
        <Link
          href="/recursos/autorizaciones"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: TEXT_MUTED,
            textDecoration: 'none',
            marginBottom: 16,
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
          <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 28, textAlign: 'center' }}>
            <p style={{ color: RED, fontSize: 14, margin: 0 }}>{error}</p>
          </div>
        )}

        {!loading && auth && (
          <DetalleContenido
            auth={auth}
            teamCode={teamCode}
            copied={copied}
            onCopy={() => void onCopy()}
            onWhatsApp={onWhatsApp}
            onAskDelete={() => setDeleteOpen(true)}
            onAuthRefresh={(next) => setAuth(next)}
            onUnauth={onUnauth}
          />
        )}
      </main>

      {deleteOpen && auth && (
        <DeleteAcuerdoModal
          auth={auth}
          teamCode={teamCode}
          onClose={() => setDeleteOpen(false)}
          onDeleted={onDeleted}
        />
      )}

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
  )
}

function Toast({ text }: { text: string }) {
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        background: GREEN,
        color: '#fff',
        padding: '12px 18px',
        borderRadius: 12,
        fontFamily: R,
        fontSize: 14,
        fontWeight: 600,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        zIndex: 200,
        animation: 'toastIn 200ms ease',
      }}
    >
      ✓ {text}
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

function DetalleContenido({
  auth,
  teamCode,
  copied,
  onCopy,
  onWhatsApp,
  onAskDelete,
  onAuthRefresh,
  onUnauth,
}: {
  auth: Autorizacion
  teamCode: string
  copied: boolean
  onCopy: () => void
  onWhatsApp: () => void
  onAskDelete: () => void
  onAuthRefresh: (next: Autorizacion) => void
  onUnauth: () => void
}) {
  const isFirmada = auth.status === 'firmada' && !!auth.signer && !!auth.signed_at

  return (
    <>
      {/* Encabezado */}
      <div style={{ marginBottom: 18 }}>
        <p
          style={{
            fontFamily: P,
            fontSize: 11,
            color: GREEN,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            margin: '0 0 8px',
            fontWeight: 600,
          }}
        >
          ● Acuerdo de comercialización
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT_DARK, margin: 0, lineHeight: 1.2 }}>
            {auth.direccion}
          </h1>
          <div style={{ flexShrink: 0, marginTop: 4 }}>
            <StatusBadge status={auth.status} />
          </div>
        </div>
        <p style={{ fontSize: 13, color: TEXT_MUTED, margin: '10px 0 0', lineHeight: 1.5 }}>
          Creado el {fmtDate(auth.created_at)} · slug: <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{auth.slug}</code> · caduca el {fmtDate(auth.expires_at)}
        </p>
      </div>

      {/* Grid 2 cards de precio */}
      <PreciosGrid auth={auth} />

      {/* Card datos del acuerdo */}
      <DatosAcuerdoCard auth={auth} />

      {/* Card notas internas */}
      <NotasInternasCard
        auth={auth}
        teamCode={teamCode}
        onAuthRefresh={onAuthRefresh}
        onUnauth={onUnauth}
      />

      {/* Card cliente firmante */}
      <ClienteFirmanteCard auth={auth} isFirmada={isFirmada} />

      {/* Botonera */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
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
          {copied ? 'Copiado' : 'Copiar link'}
        </button>
        <button
          type="button"
          onClick={onWhatsApp}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 18px',
            borderRadius: 12,
            background: GREEN,
            color: '#fff',
            border: 'none',
            fontFamily: R,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <MessageCircle size={16} /> Compartir por WhatsApp
        </button>
      </div>

      {/* Eliminar al pie */}
      <hr style={{ border: 'none', borderTop: `1px solid ${LINE}`, margin: '36px 0 20px' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onAskDelete}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 10,
            background: '#fff',
            border: `1px solid ${RED_BORDER}`,
            color: RED,
            fontFamily: R,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Trash2 size={14} /> Eliminar acuerdo
        </button>
      </div>
    </>
  )
}

// ── Cards individuales ─────────────────────────────────────────────────────

function PreciosGrid({ auth }: { auth: Autorizacion }) {
  const pub = auth.precio_publicacion_usd
  const venta = auth.precio_venta_usd
  const fmt = (n: number) => `USD ${n.toLocaleString('en-US')}`

  return (
    <div className="precios-grid" style={{ marginBottom: 18 }}>
      {/* Publicación — público (sin caja amarilla) */}
      <div
        style={{
          background: '#fff',
          border: `1px solid ${LINE}`,
          borderRadius: 14,
          padding: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <p style={{ fontFamily: P, fontSize: 11, fontWeight: 600, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
            Precio publicación
          </p>
          <span style={pillPublicStyle}>Público</span>
        </div>
        <p style={{ fontSize: 22, fontWeight: 700, color: TEXT_DARK, margin: '0 0 6px', fontVariantNumeric: 'tabular-nums' }}>
          {pub ? fmt(pub) : '—'}
        </p>
        <p style={{ fontSize: 12, color: TEXT_SOFT, margin: 0, lineHeight: 1.5 }}>
          Aparece en el acuerdo del cliente.
        </p>
      </div>

      {/* Venta — interno (caja amarilla) */}
      <div
        style={{
          background: INTERNAL_BG,
          border: `1px solid ${INTERNAL_BORDER}`,
          borderRadius: 14,
          padding: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <p style={{ fontFamily: P, fontSize: 11, fontWeight: 600, color: INTERNAL_LABEL_TEXT, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
            Precio estimado venta
          </p>
          <span style={pillInternalStyle}>🔒 Interno</span>
        </div>
        <p style={{ fontSize: 22, fontWeight: 700, color: TEXT_DARK, margin: '0 0 6px', fontVariantNumeric: 'tabular-nums' }}>
          {venta ? fmt(venta) : '—'}
        </p>
        <p style={{ fontSize: 12, color: INTERNAL_LABEL_TEXT, margin: 0, lineHeight: 1.5 }}>
          Solo lo vemos nosotros.
        </p>
      </div>

      <style>{`
        .precios-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 640px) {
          .precios-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  )
}

function DatosAcuerdoCard({ auth }: { auth: Autorizacion }) {
  const servicios = (
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
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, marginBottom: 18 }}>
      <p style={cardTitleStyle}>Datos del acuerdo</p>
      <KvRow label="Tipo" value={auth.tipo === 'exclusiva' ? 'Exclusiva' : 'No exclusiva'} />
      <KvRow label="Plazo" value={`${auth.plazo_dias} días`} />
      <KvRow label="Renovación automática" value={auth.renovacion_automatica ? 'Activada' : 'Desactivada'} />
      <KvRow label="Tipo de propiedad" value={PROPIEDAD_LABEL[auth.tipo_propiedad]} />
      <KvRow label="Servicios" value={servicios} />
      <KvRow
        label="Expensas"
        value={
          auth.tiene_expensas && auth.expensas_monto_ars
            ? `$ ${auth.expensas_monto_ars.toLocaleString('es-AR')} mensual`
            : '—'
        }
        last
      />
    </div>
  )
}

function NotasInternasCard({
  auth,
  teamCode,
  onAuthRefresh,
  onUnauth,
}: {
  auth: Autorizacion
  teamCode: string
  onAuthRefresh: (next: Autorizacion) => void
  onUnauth: () => void
}) {
  const [value, setValue] = useState(auth.notas_internas || '')
  const [savedValue, setSavedValue] = useState(auth.notas_internas || '')
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const errorRef = useRef<string | null>(null)

  const saveNow = useCallback(async (next: string) => {
    setSaving('saving')
    try {
      const res = await fetch(`/api/autorizaciones/${auth.slug}`, {
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
      if (data?.item) onAuthRefresh(data.item as Autorizacion)
      setSaving('saved')
      // Volver a idle tras 2s
      setTimeout(() => setSaving(s => (s === 'saved' ? 'idle' : s)), 2000)
    } catch {
      errorRef.current = 'Error de red'
      setSaving('error')
    }
  }, [auth.slug, teamCode, onAuthRefresh, onUnauth])

  // Debounce 800ms on-input
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
        <p style={{ ...cardTitleStyle, color: INTERNAL_LABEL_TEXT, margin: 0 }}>Notas internas</p>
        <span style={pillInternalStyle}>🔒 Interno</span>
      </div>
      <p style={{ fontSize: 12, color: INTERNAL_LABEL_TEXT, margin: '0 0 10px', lineHeight: 1.5 }}>
        Solo lo vemos nosotros. El cliente nunca ve este texto.
      </p>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Margen de negociación, comisiones especiales, recordatorios..."
        rows={4}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '11px 14px',
          borderRadius: 10,
          border: `1px solid ${INTERNAL_BORDER}`,
          fontSize: 14,
          fontFamily: R,
          outline: 'none',
          background: '#fff',
          resize: 'vertical',
          minHeight: 80,
          color: TEXT_DARK,
          lineHeight: 1.5,
        }}
      />
      <p
        style={{
          marginTop: 6,
          minHeight: 16,
          fontFamily: P,
          fontSize: 11,
          color: statusLine.color,
        }}
        aria-live="polite"
      >
        {statusLine.text}
      </p>
    </div>
  )
}

function ClienteFirmanteCard({ auth, isFirmada }: { auth: Autorizacion; isFirmada: boolean }) {
  if (!isFirmada) {
    const cp = auth.cliente_precarga
    const hasPrecarga = !!(cp.nombre || cp.dni || cp.email)
    return (
      <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, marginBottom: 18 }}>
        <p style={cardTitleStyle}>Cliente firmante</p>
        {hasPrecarga ? (
          <>
            <p style={{ fontSize: 13, color: TEXT_MUTED, margin: '0 0 12px' }}>Pre-cargado por el agente (el cliente puede editarlo al firmar)</p>
            {cp.nombre && <KvRow label="Nombre" value={cp.nombre} />}
            {cp.dni && <KvRow label="DNI" value={cp.dni} />}
            {cp.email && <KvRow label="Email" value={cp.email} last />}
          </>
        ) : (
          <p style={{ fontSize: 14, color: TEXT_SOFT, margin: 0 }}>
            Pendiente de firma. El cliente completará sus datos al abrir el link.
          </p>
        )}
      </div>
    )
  }

  // isFirmada: signer + signed_at definidos por contrato
  const signer = auth.signer!
  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, marginBottom: 18 }}>
      <p style={cardTitleStyle}>Cliente firmante</p>
      <div
        style={{
          border: `1px solid ${LINE}`,
          borderRadius: 10,
          padding: 12,
          background: '#fff',
          marginBottom: 14,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={signer.firma_base64}
          alt="Firma manuscrita"
          style={{ maxWidth: 320, maxHeight: 120, width: 'auto', height: 'auto' }}
        />
      </div>
      <KvRow label="Nombre" value={signer.nombre} />
      <KvRow label="DNI" value={signer.dni} />
      <KvRow label="Domicilio" value={signer.domicilio} />
      <KvRow label="Email" value={signer.email} />
      <KvRow label="Firmado el" value={formatFechaFirma(new Date(auth.signed_at!))} />
      {signer.ip && <KvRow label="IP" value={signer.ip} />}
      {signer.user_agent && (
        <KvRow
          label="User agent"
          value={
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: TEXT_SOFT, wordBreak: 'break-all' }}>
              {signer.user_agent}
            </span>
          }
          last
        />
      )}
    </div>
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
      <div style={{ flex: '0 0 180px', fontSize: 12, color: TEXT_MUTED, fontFamily: P, textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 2 }}>
        {label}
      </div>
      <div style={{ flex: 1, fontSize: 14, color: TEXT_DARK }}>{value}</div>
    </div>
  )
}

const cardTitleStyle: React.CSSProperties = {
  fontFamily: P,
  fontSize: 11,
  fontWeight: 600,
  color: TEXT_MUTED,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  margin: '0 0 14px',
}

const pillPublicStyle: React.CSSProperties = {
  display: 'inline-block',
  background: GREEN_TINT,
  color: GREEN_DARK_TEXT,
  fontFamily: P,
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '2px 8px',
  borderRadius: 999,
}

const pillInternalStyle: React.CSSProperties = {
  display: 'inline-block',
  background: INTERNAL_LABEL_BG,
  color: INTERNAL_LABEL_TEXT,
  fontFamily: P,
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '2px 8px',
  borderRadius: 999,
}
