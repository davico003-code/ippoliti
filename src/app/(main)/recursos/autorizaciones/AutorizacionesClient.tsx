'use client'

// Panel del agente para generar autorizaciones de venta digitales.
//
// Gate: pide código del equipo (SI_TEAM_CODE) en un input. Si el código en
// localStorage 'si_team_access' no valida (401), volvemos a mostrar el gate.
//
// Estructura:
//   - Form con 8 bloques (tipo, plazo+renovación, dirección, tipo_propiedad,
//     datos cliente, servicios, expensas, precios avanzados)
//   - Botonera Copiar / WhatsApp (deshabilitada hasta tener dirección)
//   - Card de resultado post-creación
//   - Tabla de las últimas 20 autorizaciones

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  LogOut,
  MessageCircle,
} from 'lucide-react'

import type {
  Autorizacion,
  TipoAutorizacion,
  TipoPropiedad,
} from '@/lib/autorizaciones'

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

// TODO: reemplazar con el copy definitivo de David cuando lo defina.
function buildWhatsAppMessage(direccion: string, url: string): string {
  return `Hola! Te paso el link de la autorización de venta para ${direccion}.\nPodés revisarla y firmarla desde tu celular acá:\n${url}`
}

// ── Entry component ────────────────────────────────────────────────────────

export default function AutorizacionesClient() {
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
      const res = await fetch('/api/autorizaciones/listar?status=all&limit=1', {
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
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: R,
      }}
    >
      <div
        style={{
          background: '#fff',
          border: `1px solid ${LINE}`,
          borderRadius: 14,
          padding: 28,
          maxWidth: 380,
          width: '100%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <p
          style={{
            fontFamily: P,
            fontSize: 11,
            color: GREEN,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            fontWeight: 600,
            margin: '0 0 8px',
          }}
        >
          ● Panel SI
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT_DARK, margin: '0 0 6px' }}>
          Acceso de equipo
        </h1>
        <p style={{ fontSize: 14, color: TEXT_SOFT, margin: '0 0 20px', lineHeight: 1.5 }}>
          Ingresá el código del equipo para acceder al generador de autorizaciones.
        </p>
        <input
          type="password"
          autoComplete="off"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') void submit() }}
          placeholder="Código de equipo"
          disabled={submitting}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '12px 14px',
            borderRadius: 10,
            border: `1px solid ${LINE}`,
            fontSize: 15,
            fontFamily: R,
            outline: 'none',
            marginBottom: 12,
            background: '#fff',
          }}
        />
        {error && (
          <p style={{ fontSize: 13, color: '#B91C1C', margin: '0 0 12px' }}>{error}</p>
        )}
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting || !code.trim()}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 10,
            border: 'none',
            background: GREEN,
            color: '#fff',
            fontFamily: R,
            fontSize: 15,
            fontWeight: 600,
            cursor: submitting ? 'wait' : 'pointer',
            opacity: submitting || !code.trim() ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? 'Validando…' : 'Ingresar'}
        </button>
      </div>
    </div>
  )
}

// ── Panel principal ────────────────────────────────────────────────────────

interface PanelProps {
  teamCode: string
  onUnauth: () => void
  onLogout: () => void
}

const TIPOS_PROPIEDAD: { value: TipoPropiedad; label: string }[] = [
  { value: 'casa', label: 'Casa' },
  { value: 'depto', label: 'Depto' },
  { value: 'ph', label: 'PH' },
  { value: 'local', label: 'Local' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'galpon', label: 'Galpón' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'otro', label: 'Otro' },
]

const SERVICIOS: { key: keyof FormState['servicios']; label: string }[] = [
  { key: 'luz', label: 'Luz' },
  { key: 'agua', label: 'Agua' },
  { key: 'gas', label: 'Gas' },
  { key: 'pavimento', label: 'Pavimento' },
  { key: 'cloacas', label: 'Cloacas' },
]

interface FormState {
  tipo: TipoAutorizacion
  plazoPreset: 60 | 90 | 120 | 'otro'
  plazoCustom: string
  renovacion: boolean
  direccion: string
  tipo_propiedad: TipoPropiedad
  cliente_nombre: string
  cliente_dni: string
  cliente_email: string
  servicios: {
    luz: boolean
    agua: boolean
    gas: boolean
    pavimento: boolean
    cloacas: boolean
  }
  tieneExpensas: boolean
  expensasMonto: string
  precioVenta: string
  precioPublicacion: string
}

const initialForm: FormState = {
  tipo: 'exclusiva',
  plazoPreset: 120,
  plazoCustom: '',
  renovacion: true,
  direccion: '',
  tipo_propiedad: 'casa',
  cliente_nombre: '',
  cliente_dni: '',
  cliente_email: '',
  servicios: { luz: false, agua: false, gas: false, pavimento: false, cloacas: false },
  tieneExpensas: false,
  expensasMonto: '',
  precioVenta: '',
  precioPublicacion: '',
}

interface CreatedResult {
  slug: string
  url: string
}

function Panel({ teamCode, onUnauth, onLogout }: PanelProps) {
  const [form, setForm] = useState<FormState>(initialForm)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [created, setCreated] = useState<CreatedResult | null>(null)
  const [copied, setCopied] = useState(false)

  const [list, setList] = useState<Autorizacion[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const fetchList = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const res = await fetch('/api/autorizaciones/listar?status=all&limit=20', {
        headers: { 'x-team-code': teamCode },
      })
      if (res.status === 401) {
        onUnauth()
        return
      }
      const data = await res.json()
      if (!res.ok) {
        setListError(data?.error || `Error ${res.status}`)
        return
      }
      setList(data.items || [])
    } catch {
      setListError('Error de red')
    } finally {
      setListLoading(false)
    }
  }, [teamCode, onUnauth])

  useEffect(() => { void fetchList() }, [fetchList])

  const plazoFinal = (): number => {
    if (form.plazoPreset !== 'otro') return form.plazoPreset
    const n = parseInt(form.plazoCustom, 10)
    if (!Number.isFinite(n)) return 120
    return Math.max(30, Math.min(365, n))
  }

  const canSubmit = form.direccion.trim().length >= 3 && !creating

  const createOnly = async (): Promise<CreatedResult | null> => {
    if (!canSubmit) return null
    setCreating(true)
    setCreateError(null)
    try {
      const body = {
        tipo: form.tipo,
        plazo_dias: plazoFinal(),
        renovacion_automatica: form.renovacion,
        direccion: form.direccion.trim(),
        tipo_propiedad: form.tipo_propiedad,
        servicios: form.servicios,
        tiene_expensas: form.tieneExpensas,
        expensas_monto_ars: form.tieneExpensas ? Number(form.expensasMonto) || 0 : undefined,
        precio_venta_usd: form.precioVenta ? Number(form.precioVenta) : undefined,
        precio_publicacion_usd: form.precioPublicacion ? Number(form.precioPublicacion) : undefined,
        cliente_precarga: {
          nombre: form.cliente_nombre.trim() || undefined,
          dni: form.cliente_dni.trim() || undefined,
          email: form.cliente_email.trim() || undefined,
        },
      }
      const res = await fetch('/api/autorizaciones/crear', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-team-code': teamCode },
        body: JSON.stringify(body),
      })
      if (res.status === 401) {
        onUnauth()
        return null
      }
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data?.error || `Error ${res.status}`)
        return null
      }
      const result: CreatedResult = { slug: data.slug, url: data.url }
      setCreated(result)
      void fetchList()
      return result
    } catch {
      setCreateError('Error de red')
      return null
    } finally {
      setCreating(false)
    }
  }

  const handleCopy = async () => {
    const result = created || await createOnly()
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleWhatsApp = async () => {
    const result = created || await createOnly()
    if (!result) return
    const text = encodeURIComponent(buildWhatsAppMessage(form.direccion.trim(), result.url))
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: R }}>
      <Header onLogout={onLogout} />

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '36px 20px 80px' }}>
        <PageHeader />

        <Card>
          <SectionTipo value={form.tipo} onChange={v => setForm(f => ({ ...f, tipo: v }))} />

          <div className="grid-2">
            <SectionPlazo
              preset={form.plazoPreset}
              custom={form.plazoCustom}
              onPreset={v => setForm(f => ({ ...f, plazoPreset: v }))}
              onCustom={v => setForm(f => ({ ...f, plazoCustom: v }))}
            />
            <SectionRenovacion
              value={form.renovacion}
              onChange={v => setForm(f => ({ ...f, renovacion: v }))}
            />
          </div>

          <SectionDireccion
            value={form.direccion}
            onChange={v => setForm(f => ({ ...f, direccion: v }))}
          />

          <SectionTipoPropiedad
            value={form.tipo_propiedad}
            onChange={v => setForm(f => ({ ...f, tipo_propiedad: v }))}
          />

          <SectionCliente
            nombre={form.cliente_nombre}
            dni={form.cliente_dni}
            email={form.cliente_email}
            onNombre={v => setForm(f => ({ ...f, cliente_nombre: v }))}
            onDni={v => setForm(f => ({ ...f, cliente_dni: v }))}
            onEmail={v => setForm(f => ({ ...f, cliente_email: v }))}
          />

          <SectionServicios
            value={form.servicios}
            onChange={(key, v) =>
              setForm(f => ({ ...f, servicios: { ...f.servicios, [key]: v } }))
            }
          />

          <SectionExpensas
            on={form.tieneExpensas}
            monto={form.expensasMonto}
            onToggle={v => setForm(f => ({ ...f, tieneExpensas: v }))}
            onMonto={v => setForm(f => ({ ...f, expensasMonto: v }))}
          />

          <SectionAdvanced
            open={advancedOpen}
            onToggle={() => setAdvancedOpen(o => !o)}
            precioVenta={form.precioVenta}
            precioPublicacion={form.precioPublicacion}
            onVenta={v => setForm(f => ({ ...f, precioVenta: v }))}
            onPub={v => setForm(f => ({ ...f, precioPublicacion: v }))}
          />
        </Card>

        <Botonera
          canSubmit={canSubmit}
          creating={creating}
          onCopy={() => void handleCopy()}
          onWhatsApp={() => void handleWhatsApp()}
          copied={copied}
        />

        {createError && (
          <p style={{ marginTop: 12, color: '#B91C1C', fontSize: 13 }}>{createError}</p>
        )}

        {created && (
          <ResultCard result={created} copied={copied} onCopy={() => void handleCopy()} onReset={() => { setCreated(null); setForm(initialForm) }} />
        )}

        <NotaCard />

        <ListadoTable items={list} loading={listLoading} error={listError} onRefresh={() => void fetchList()} />
      </main>

      <style>{`
        .grid-2 { display: grid; grid-template-columns: 1fr; gap: 20px; }
        @media (min-width: 720px) { .grid-2 { grid-template-columns: 1fr 1fr; } }
        .grid-3 { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 720px) { .grid-3 { grid-template-columns: 1fr 1fr 1fr; } }
        .pills-4-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        @media (min-width: 560px) { .pills-4-2 { grid-template-columns: repeat(4, 1fr); } }
        .servicios-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        @media (min-width: 560px) { .servicios-grid { grid-template-columns: repeat(5, 1fr); } }
        .botonera { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 18px; }
        @media (min-width: 560px) { .botonera { grid-template-columns: 1fr 1fr; } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

// ── Header / page header ───────────────────────────────────────────────────

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

function PageHeader() {
  return (
    <div style={{ marginBottom: 24 }}>
      <p
        style={{
          fontFamily: P,
          fontSize: 12,
          color: GREEN,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          fontWeight: 600,
          margin: '0 0 10px',
        }}
      >
        ● Recursos · Autorizaciones
      </p>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: TEXT_DARK, margin: '0 0 8px', lineHeight: 1.15 }}>
        Generar autorización de venta
      </h1>
      <p style={{ fontSize: 15, color: TEXT_SOFT, margin: 0, lineHeight: 1.55 }}>
        Completá los datos, generá el link y compartilo por WhatsApp. El cliente firma desde su celular en menos de un minuto.
      </p>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${LINE}`,
        borderRadius: 14,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: P,
        fontSize: 11,
        color: TEXT_MUTED,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        fontWeight: 600,
        margin: '0 0 10px',
      }}
    >
      {children}
    </p>
  )
}

// ── Secciones ──────────────────────────────────────────────────────────────

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  cols,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  cols: number
}) {
  return (
    <div
      role="group"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 6,
        padding: 4,
        background: BG,
        border: `1px solid ${LINE}`,
        borderRadius: 12,
      }}
    >
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={String(opt.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: active ? GREEN : 'transparent',
              color: active ? '#fff' : TEXT_SOFT,
              fontFamily: R,
              fontSize: 14,
              fontWeight: 600,
              transition: 'background 150ms ease, color 150ms ease',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function SectionTipo({ value, onChange }: { value: TipoAutorizacion; onChange: (v: TipoAutorizacion) => void }) {
  return (
    <div>
      <SectionLabel>Tipo de autorización</SectionLabel>
      <Segmented<TipoAutorizacion>
        options={[
          { value: 'exclusiva', label: 'Exclusiva' },
          { value: 'no_exclusiva', label: 'No exclusiva' },
        ]}
        value={value}
        onChange={onChange}
        cols={2}
      />
    </div>
  )
}

function SectionPlazo({
  preset,
  custom,
  onPreset,
  onCustom,
}: {
  preset: 60 | 90 | 120 | 'otro'
  custom: string
  onPreset: (v: 60 | 90 | 120 | 'otro') => void
  onCustom: (v: string) => void
}) {
  return (
    <div>
      <SectionLabel>Plazo</SectionLabel>
      <Segmented<60 | 90 | 120 | 'otro'>
        options={[
          { value: 60, label: '60' },
          { value: 90, label: '90' },
          { value: 120, label: '120' },
          { value: 'otro', label: 'Otro' },
        ]}
        value={preset}
        onChange={onPreset}
        cols={4}
      />
      {preset === 'otro' && (
        <input
          type="number"
          inputMode="numeric"
          min={30}
          max={365}
          value={custom}
          onChange={e => onCustom(e.target.value)}
          placeholder="Días (30 a 365)"
          style={{
            marginTop: 10,
            width: '100%',
            boxSizing: 'border-box',
            padding: '11px 14px',
            borderRadius: 10,
            border: `1px solid ${LINE}`,
            fontSize: 15,
            fontFamily: R,
            outline: 'none',
          }}
        />
      )}
    </div>
  )
}

function Switch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      style={{
        width: 44,
        height: 26,
        borderRadius: 999,
        background: value ? GREEN : '#D1D5DB',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 150ms ease',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: value ? 22 : 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 150ms ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      />
    </button>
  )
}

function SectionRenovacion({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div>
      <SectionLabel>Renovación automática</SectionLabel>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 16px',
          border: `1px solid ${LINE}`,
          borderRadius: 12,
          background: BG,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: TEXT_DARK }}>
          {value ? 'Activada' : 'Desactivada'}
        </span>
        <Switch value={value} onChange={onChange} />
      </div>
    </div>
  )
}

function SectionDireccion({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <SectionLabel>Dirección de la propiedad</SectionLabel>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Ej: Av. Pellegrini 1234, Rosario"
        required
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '12px 14px',
          borderRadius: 10,
          border: `1px solid ${LINE}`,
          fontSize: 15,
          fontFamily: R,
          outline: 'none',
        }}
      />
    </div>
  )
}

function SectionTipoPropiedad({
  value,
  onChange,
}: {
  value: TipoPropiedad
  onChange: (v: TipoPropiedad) => void
}) {
  return (
    <div>
      <SectionLabel>Tipo de propiedad</SectionLabel>
      <div className="pills-4-2">
        {TIPOS_PROPIEDAD.map(opt => {
          const active = opt.value === value
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              style={{
                padding: '10px 12px',
                borderRadius: 999,
                border: `1px solid ${active ? GREEN : LINE}`,
                background: active ? GREEN_TINT : '#fff',
                color: active ? GREEN_DARK_TEXT : TEXT_SOFT,
                fontFamily: R,
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SectionCliente({
  nombre,
  dni,
  email,
  onNombre,
  onDni,
  onEmail,
}: {
  nombre: string
  dni: string
  email: string
  onNombre: (v: string) => void
  onDni: (v: string) => void
  onEmail: (v: string) => void
}) {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 14px',
    borderRadius: 10,
    border: `1px solid ${LINE}`,
    fontSize: 14,
    fontFamily: R,
    outline: 'none',
  }
  return (
    <div>
      <SectionLabel>Datos del cliente (pre-carga opcional)</SectionLabel>
      <p style={{ fontSize: 13, color: TEXT_MUTED, margin: '0 0 12px', lineHeight: 1.5 }}>
        Si ya los sabés, completalos. El cliente los podrá editar al firmar.
      </p>
      <div className="grid-3">
        <input
          type="text"
          value={nombre}
          onChange={e => onNombre(e.target.value)}
          placeholder="Nombre y apellido"
          style={inputStyle}
        />
        <input
          type="text"
          inputMode="numeric"
          value={dni}
          onChange={e => onDni(e.target.value)}
          placeholder="DNI"
          style={inputStyle}
        />
        <input
          type="email"
          value={email}
          onChange={e => onEmail(e.target.value)}
          placeholder="Email"
          style={inputStyle}
        />
      </div>
    </div>
  )
}

function SectionServicios({
  value,
  onChange,
}: {
  value: FormState['servicios']
  onChange: (key: keyof FormState['servicios'], v: boolean) => void
}) {
  return (
    <div>
      <SectionLabel>Servicios disponibles</SectionLabel>
      <div className="servicios-grid">
        {SERVICIOS.map(s => {
          const checked = value[s.key]
          return (
            <label
              key={s.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 10px',
                borderRadius: 12,
                border: `1px solid ${checked ? GREEN : LINE}`,
                background: checked ? GREEN_TINT : BG,
                color: checked ? GREEN_DARK_TEXT : TEXT_SOFT,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: checked ? 600 : 500,
                transition: 'all 150ms ease',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={e => onChange(s.key, e.target.checked)}
                style={{ accentColor: GREEN, cursor: 'pointer' }}
              />
              {s.label}
            </label>
          )
        })}
      </div>
    </div>
  )
}

function SectionExpensas({
  on,
  monto,
  onToggle,
  onMonto,
}: {
  on: boolean
  monto: string
  onToggle: (v: boolean) => void
  onMonto: (v: string) => void
}) {
  return (
    <div>
      <SectionLabel>¿Tiene expensas?</SectionLabel>
      <div
        style={{
          padding: 16,
          borderRadius: 12,
          border: `1px solid ${LINE}`,
          background: BG,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: TEXT_DARK, margin: '0 0 2px' }}>
              ¿La propiedad tiene expensas?
            </p>
            <p style={{ fontSize: 12, color: TEXT_MUTED, margin: 0 }}>
              Activá para informar el monto al cliente.
            </p>
          </div>
          <Switch value={on} onChange={onToggle} />
        </div>
        {on && (
          <div style={{ marginTop: 14, position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: TEXT_MUTED,
                fontSize: 15,
                pointerEvents: 'none',
              }}
            >
              $
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={monto}
              onChange={e => onMonto(e.target.value)}
              placeholder="Monto mensual (ARS)"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px 11px 28px',
                borderRadius: 10,
                border: `1px solid ${LINE}`,
                fontSize: 15,
                fontFamily: R,
                outline: 'none',
                background: '#fff',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function SectionAdvanced({
  open,
  onToggle,
  precioVenta,
  precioPublicacion,
  onVenta,
  onPub,
}: {
  open: boolean
  onToggle: () => void
  precioVenta: string
  precioPublicacion: string
  onVenta: (v: string) => void
  onPub: (v: string) => void
}) {
  return (
    <div
      style={{
        border: `1px solid ${LINE}`,
        borderRadius: 12,
        background: BG,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: TEXT_DARK,
          fontFamily: R,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Ajustar valores avanzados
        {open ? <ChevronUp size={16} color={TEXT_MUTED} /> : <ChevronDown size={16} color={TEXT_MUTED} />}
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          <div className="grid-2">
            <div>
              <SectionLabel>Precio de venta (USD)</SectionLabel>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={precioVenta}
                onChange={e => onVenta(e.target.value)}
                placeholder="Opcional"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: `1px solid ${LINE}`,
                  fontSize: 15,
                  fontFamily: R,
                  outline: 'none',
                  background: '#fff',
                }}
              />
            </div>
            <div>
              <SectionLabel>Precio de publicación (USD)</SectionLabel>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={precioPublicacion}
                onChange={e => onPub(e.target.value)}
                placeholder="Opcional"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: `1px solid ${LINE}`,
                  fontSize: 15,
                  fontFamily: R,
                  outline: 'none',
                  background: '#fff',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Botonera ────────────────────────────────────────────────────────────────

function Botonera({
  canSubmit,
  creating,
  onCopy,
  onWhatsApp,
  copied,
}: {
  canSubmit: boolean
  creating: boolean
  onCopy: () => void
  onWhatsApp: () => void
  copied: boolean
}) {
  const disabled = !canSubmit
  return (
    <div className="botonera">
      <button
        type="button"
        onClick={onCopy}
        disabled={disabled}
        style={{
          padding: '13px 16px',
          borderRadius: 12,
          border: `1.5px solid ${disabled ? LINE : GREEN}`,
          background: '#fff',
          color: disabled ? TEXT_MUTED : GREEN,
          fontFamily: R,
          fontSize: 15,
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.7 : 1,
        }}
      >
        {creating ? (
          <Loader2 size={16} className="animate-spin" />
        ) : copied ? (
          <Check size={16} />
        ) : (
          <Copy size={16} />
        )}
        {copied ? 'Copiado' : 'Copiar link'}
      </button>
      <button
        type="button"
        onClick={onWhatsApp}
        disabled={disabled}
        style={{
          padding: '13px 16px',
          borderRadius: 12,
          border: 'none',
          background: disabled ? '#A0A09A' : GREEN,
          color: '#fff',
          fontFamily: R,
          fontSize: 15,
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.7 : 1,
        }}
      >
        {creating ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
        WhatsApp
      </button>
    </div>
  )
}

// ── Resultado / Nota ───────────────────────────────────────────────────────

function ResultCard({
  result,
  copied,
  onCopy,
  onReset,
}: {
  result: CreatedResult
  copied: boolean
  onCopy: () => void
  onReset: () => void
}) {
  return (
    <div
      style={{
        marginTop: 18,
        background: '#fff',
        border: `1px solid ${LINE}`,
        borderRadius: 12,
        padding: 18,
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 600, color: GREEN, margin: '0 0 8px' }}>
        ✓ Autorización generada
      </p>
      <p style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 13,
        color: TEXT_DARK,
        margin: '0 0 12px',
        wordBreak: 'break-all',
        background: BG,
        padding: 10,
        borderRadius: 8,
      }}>
        {result.url}
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onCopy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 999,
            border: `1px solid ${LINE}`,
            background: '#fff',
            color: TEXT_DARK,
            fontFamily: R,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {copied ? <Check size={14} color={GREEN} /> : <Copy size={14} />}
          {copied ? 'Copiado' : 'Copiar otra vez'}
        </button>
        <button
          type="button"
          onClick={onReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 999,
            border: 'none',
            background: 'transparent',
            color: TEXT_MUTED,
            fontFamily: R,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Generar otra
        </button>
      </div>
    </div>
  )
}

function NotaCard() {
  return (
    <div
      style={{
        marginTop: 18,
        background: GREEN_TINT,
        border: `1px solid ${GREEN}33`,
        borderRadius: 12,
        padding: 14,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        color: GREEN_DARK_TEXT,
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <Check size={16} style={{ flexShrink: 0, marginTop: 2 }} />
      Al firmar, la autorización queda guardada en tu panel y el cliente recibe su copia en PDF.
    </div>
  )
}

// ── Listado ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Autorizacion['status'] }) {
  const styles: Record<Autorizacion['status'], { bg: string; color: string; label: string }> = {
    pendiente: { bg: '#FEF3C7', color: '#92400E', label: 'Pendiente' },
    firmada: { bg: GREEN_TINT, color: GREEN_DARK_TEXT, label: 'Firmada' },
    expirada: { bg: '#F3F3F0', color: '#6B6B66', label: 'Expirada' },
  }
  const s = styles[status]
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
        padding: '3px 9px',
        borderRadius: 999,
      }}
    >
      {s.label}
    </span>
  )
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function tipoPropLabel(t: TipoPropiedad): string {
  return TIPOS_PROPIEDAD.find(x => x.value === t)?.label || t
}

function ListadoTable({
  items,
  loading,
  error,
  onRefresh,
}: {
  items: Autorizacion[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}) {
  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: TEXT_DARK, margin: 0 }}>
          Últimas autorizaciones
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          style={{
            fontSize: 13,
            color: TEXT_MUTED,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Actualizar
        </button>
      </div>

      {error && <p style={{ color: '#B91C1C', fontSize: 13 }}>{error}</p>}

      <div
        style={{
          background: '#fff',
          border: `1px solid ${LINE}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: TEXT_MUTED, fontSize: 14 }}>
            <Loader2 size={16} className="animate-spin" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />
            Cargando…
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: TEXT_MUTED, fontSize: 14 }}>
            Todavía no hay autorizaciones.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: R }}>
              <thead>
                <tr style={{ background: BG, borderBottom: `1px solid ${LINE}` }}>
                  <Th>Fecha</Th>
                  <Th>Dirección</Th>
                  <Th>Tipo</Th>
                  <Th>Plazo</Th>
                  <Th>Estado</Th>
                  <Th align="right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {items.map(a => (
                  <tr key={a.slug} style={{ borderBottom: `1px solid ${LINE}` }}>
                    <Td>{fmtDate(a.created_at)}</Td>
                    <Td>
                      <span style={{ fontWeight: 500, color: TEXT_DARK }}>{a.direccion}</span>
                      <br />
                      <span style={{ fontSize: 11, color: TEXT_MUTED }}>{tipoPropLabel(a.tipo_propiedad)}</span>
                    </Td>
                    <Td>{a.tipo === 'exclusiva' ? 'Exclusiva' : 'No exclusiva'}</Td>
                    <Td>{a.plazo_dias} días</Td>
                    <Td><StatusBadge status={a.status} /></Td>
                    <Td align="right">
                      <RowActions auth={a} />
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

function RowActions({ auth }: { auth: Autorizacion }) {
  const copyLink = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://siinmobiliaria.com'
    const url = `${base}/autorizacion/${auth.slug}`
    void navigator.clipboard.writeText(url).catch(() => {})
  }
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Link
        href={`/recursos/autorizaciones/${auth.slug}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          color: GREEN,
          textDecoration: 'none',
          fontWeight: 600,
        }}
        title="Ver detalle"
      >
        <ExternalLink size={13} /> Ver
      </Link>
      {auth.status === 'pendiente' && (
        <button
          type="button"
          onClick={copyLink}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            color: TEXT_MUTED,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: R,
          }}
          title="Copiar link"
        >
          <Copy size={13} /> Copiar
        </button>
      )}
      {auth.status === 'firmada' && (
        <a
          href={`/api/autorizaciones/${auth.slug}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            color: TEXT_MUTED,
            textDecoration: 'none',
          }}
          title="Descargar PDF"
        >
          <FileText size={13} /> PDF
        </a>
      )}
    </div>
  )
}
