'use client'

// Sección de Salud del acuerdo dentro del detalle del panel (interno).
//
// Renderiza entre la card "Cliente firmante" y el botón "Eliminar acuerdo".
// NUNCA se muestra al cliente. El estado se guarda contra
// PATCH /api/autorizaciones/[slug]/salud (gated con team-code).

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

import type { Salud, SaludRespuestaSiNo, SaludRespuestaSiNoNa } from '@/lib/autorizaciones'
import { evaluarSalud, subtituloSalud, type SaludEvaluation } from '@/lib/autorizaciones/saludLogic'

// ── Paleta ──────────────────────────────────────────────────────────────────
const GREEN = '#1A5C38'
const GREEN_LIGHT = '#16A34A'
const GREEN_HINT_BG = '#F0F7F2'
const GREEN_TINT = '#E8F2EC'
const GREEN_DARK_TEXT = '#0F3C24'
const RED = '#DC2626'
const RED_HINT_BG = '#FEF2F2'
const RED_TINT = '#FEF2F2'
const RED_DARK_TEXT = '#991B1B'
const AMBER = '#F59E0B'
const AMBER_HINT_BG = '#FFFDF5'
const AMBER_BORDER = '#F0E4B8'
const NEUTRAL_BG = '#FAFAF9'
const NEUTRAL_BORDER = '#E5E5E0'
const NEUTRAL_BUTTON_TINT = '#F3F3F0'
const NEUTRAL_BUTTON_BORDER = '#6B6B66'
const NEUTRAL_BUTTON_TEXT = '#3A3A35'
const TEXT_DARK = '#1A1A1A'
const TEXT_MUTED = '#6B6B66'
const TEXT_SOFT = '#5A5A55'
const TEXT_HINT = '#8A8A85'
const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"

// ── Tipos / defaults ────────────────────────────────────────────────────────

/** Estado editable por el usuario en el cliente; metadata (actualizada_en/por)
 *  la setea el server al guardar. */
type SaludEditable = Omit<Salud, 'actualizada_en' | 'actualizada_por'>

const DEFAULT_SALUD: SaludEditable = {
  escritura: null,
  boleto: null,
  planos: null,
  planos_notas: '',
  mensura: null,
  extras: {
    impuestos: false,
    servicios: false,
    reglamento: false,
    libre_deuda: false,
  },
}

function toEditable(salud: Salud | null | undefined): SaludEditable {
  if (!salud) return { ...DEFAULT_SALUD, extras: { ...DEFAULT_SALUD.extras } }
  return {
    escritura: salud.escritura ?? null,
    boleto: salud.boleto ?? null,
    planos: salud.planos ?? null,
    planos_notas: salud.planos_notas ?? '',
    mensura: salud.mensura ?? null,
    extras: {
      impuestos: !!salud.extras?.impuestos,
      servicios: !!salud.extras?.servicios,
      reglamento: !!salud.extras?.reglamento,
      libre_deuda: !!salud.extras?.libre_deuda,
    },
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativo(fecha: Date): string {
  const diff = Math.floor((Date.now() - fecha.getTime()) / 1000)
  if (diff < 5) return 'Guardado recién'
  if (diff < 60) return `Guardado hace ${diff}s`
  if (diff < 3600) return `Guardado hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Guardado hace ${Math.floor(diff / 3600)} h`
  return `Guardado hace ${Math.floor(diff / 86400)} d`
}

interface LucesActivas { rojo: boolean; amarillo: boolean; verde: boolean }

function lucesDe(ev: SaludEvaluation): LucesActivas {
  return {
    rojo: ev.estado === 'sin_datos' || ev.estado === 'rojo',
    amarillo: ev.estado === 'amarillo',
    verde: ev.estado === 'verde',
  }
}

// ── Componente principal ────────────────────────────────────────────────────

interface Props {
  slug: string
  saludInicial: Salud | null | undefined
  teamCode: string
  onSaludRefresh?: (salud: Salud) => void
}

export default function SaludAcuerdoSection({ slug, saludInicial, teamCode, onSaludRefresh }: Props) {
  const inicialEditable = useMemo(() => toEditable(saludInicial), [saludInicial])

  const [salud, setSalud] = useState<SaludEditable>(inicialEditable)
  const [saludGuardada, setSaludGuardada] = useState<SaludEditable>(inicialEditable)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extrasOpen, setExtrasOpen] = useState(false)
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(
    saludInicial?.actualizada_en ? new Date(saludInicial.actualizada_en) : null,
  )
  // tick fuerza re-render para que formatRelativo refresque sin tocar el server
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!ultimoGuardado) return
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [ultimoGuardado])

  const hayCambios = useMemo(
    () => JSON.stringify(salud) !== JSON.stringify(saludGuardada),
    [salud, saludGuardada],
  )

  const ev = useMemo(() => evaluarSalud(salud as Salud), [salud])
  const luces = lucesDe(ev)
  const subtitulo = subtituloSalud(ev)

  const handleGuardar = useCallback(async () => {
    setGuardando(true)
    setError(null)
    try {
      const res = await fetch(`/api/autorizaciones/${slug}/salud`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          'x-team-code': teamCode,
        },
        body: JSON.stringify(salud),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || `Error ${res.status}`)
        return
      }
      const next: Salud = data.salud
      setSaludGuardada({ ...salud })
      setUltimoGuardado(next.actualizada_en ? new Date(next.actualizada_en) : new Date())
      if (onSaludRefresh) onSaludRefresh(next)
    } catch {
      setError('No se pudo guardar. Reintentá.')
    } finally {
      setGuardando(false)
    }
  }, [slug, teamCode, salud, onSaludRefresh])

  // ── Handlers de cada respuesta ────────────────────────────────────────────

  const setSiNo = (campo: 'escritura' | 'boleto' | 'planos') => (valor: SaludRespuestaSiNo) => {
    setSalud(s => ({ ...s, [campo]: s[campo] === valor ? null : valor }))
  }
  const setMensura = (valor: SaludRespuestaSiNoNa) => {
    setSalud(s => ({ ...s, mensura: s.mensura === valor ? null : valor }))
  }
  const setNotas = (v: string) => setSalud(s => ({ ...s, planos_notas: v.slice(0, 1000) }))
  const setExtra = (k: keyof Salud['extras'], v: boolean) =>
    setSalud(s => ({ ...s, extras: { ...s.extras, [k]: v } }))

  return (
    <section
      style={{
        background: '#FFFFFF',
        border: `1px solid ${NEUTRAL_BORDER}`,
        borderRadius: 12,
        padding: 24,
        marginBottom: 18,
        fontFamily: R,
      }}
      className="salud-section"
      aria-label="Salud del acuerdo"
    >
      <Header subtitulo={subtitulo} luces={luces} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 18 }}>
        {/* Subgrupo TÍTULO */}
        <div
          style={{
            background: NEUTRAL_BG,
            border: `1px solid ${NEUTRAL_BORDER}`,
            borderRadius: 10,
            padding: 14,
          }}
        >
          <SectionLabel>Título</SectionLabel>
          <PreguntaSiNo
            label="¿Tiene Escritura?"
            value={salud.escritura}
            onChange={setSiNo('escritura')}
          />
          <PreguntaSiNo
            label="¿Tiene Boleto?"
            value={salud.boleto}
            onChange={setSiNo('boleto')}
            last
          />
        </div>

        {/* PLANOS + notas condicionales */}
        <div>
          <PreguntaSiNo
            label="¿Tiene Planos de Arquitectura?"
            value={salud.planos}
            onChange={setSiNo('planos')}
            last
          />
          {salud.planos !== null && (
            <div style={{ marginTop: 10 }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: P,
                  fontSize: 11,
                  fontWeight: 600,
                  color: TEXT_MUTED,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Notas de regularización · opcional
              </label>
              <textarea
                value={salud.planos_notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Detalle del estado de los planos, gestiones pendientes, etc."
                rows={3}
                maxLength={1000}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: `1px solid ${AMBER_BORDER}`,
                  background: AMBER_HINT_BG,
                  fontSize: 14,
                  fontFamily: R,
                  color: TEXT_DARK,
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: 70,
                  lineHeight: 1.5,
                }}
              />
              <p style={{ marginTop: 4, fontFamily: R, fontSize: 11, color: TEXT_HINT, textAlign: 'right' }}>
                {salud.planos_notas.length}/1000
              </p>
            </div>
          )}
        </div>

        {/* MENSURA / VEP */}
        <PreguntaConNA
          label="¿Tiene VEP o Mensura?"
          value={salud.mensura}
          onChange={setMensura}
          last
        />

        {/* HINT del estado actual */}
        <HintEstado ev={ev} />

        {/* ACORDEÓN complementarios */}
        <div>
          <button
            type="button"
            onClick={() => setExtrasOpen(o => !o)}
            aria-expanded={extrasOpen}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 10,
              border: `1px solid ${NEUTRAL_BORDER}`,
              background: NEUTRAL_BG,
              cursor: 'pointer',
              fontFamily: R,
              fontSize: 14,
              fontWeight: 500,
              color: TEXT_DARK,
            }}
          >
            + Documentación complementaria
            {extrasOpen ? <ChevronUp size={16} color={TEXT_MUTED} /> : <ChevronDown size={16} color={TEXT_MUTED} />}
          </button>
          {extrasOpen && (
            <div
              style={{
                marginTop: 10,
                padding: 14,
                border: `1px solid ${NEUTRAL_BORDER}`,
                borderRadius: 10,
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <ExtraCheck
                checked={salud.extras.impuestos}
                onChange={v => setExtra('impuestos', v)}
                label="Impuestos al día"
              />
              <ExtraCheck
                checked={salud.extras.servicios}
                onChange={v => setExtra('servicios', v)}
                label="Servicios al día"
              />
              <ExtraCheck
                checked={salud.extras.reglamento}
                onChange={v => setExtra('reglamento', v)}
                label="Reglamento de copropiedad / barrio"
              />
              <ExtraCheck
                checked={salud.extras.libre_deuda}
                onChange={v => setExtra('libre_deuda', v)}
                label="Libre deuda de expensas"
              />
            </div>
          )}
        </div>
      </div>

      {/* FOOTER status + botón */}
      <Footer
        hayCambios={hayCambios}
        guardando={guardando}
        ultimoGuardado={ultimoGuardado}
        actualizadaPor={saludInicial?.actualizada_por ?? null}
        onGuardar={() => void handleGuardar()}
      />

      {error && (
        <p
          role="alert"
          style={{
            marginTop: 10,
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#7F1D1D',
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          {error}
        </p>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.18); }
        }
        .salud-spin { animation: spin 1s linear infinite; }
        .salud-dot-pulse { animation: pulse-dot 1.4s ease-in-out infinite; }

        @media (max-width: 560px) {
          .salud-section { padding: 18px 16px !important; }
        }
      `}</style>
    </section>
  )
}

// ── Subcomponentes ──────────────────────────────────────────────────────────

function Header({ subtitulo, luces }: { subtitulo: string; luces: LucesActivas }) {
  return (
    <div style={{ paddingBottom: 14, borderBottom: `1px solid ${NEUTRAL_BORDER}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: GREEN,
              color: '#fff',
            }}
            aria-hidden
          >
            <Check size={13} strokeWidth={3} />
          </span>
          <h3
            style={{
              fontFamily: R,
              fontSize: 16,
              fontWeight: 700,
              color: TEXT_DARK,
              margin: 0,
              letterSpacing: '0.01em',
            }}
          >
            Salud del acuerdo
          </h3>
        </div>
        <Semaforo luces={luces} />
      </div>
      <p
        style={{
          fontFamily: R,
          fontSize: 13,
          color: TEXT_SOFT,
          margin: '6px 0 0',
          lineHeight: 1.5,
        }}
      >
        {subtitulo}
      </p>
    </div>
  )
}

function Semaforo({ luces }: { luces: LucesActivas }) {
  const palette = [
    { on: luces.rojo, onColor: '#DC2626', offColor: '#F3D6D6' },
    { on: luces.amarillo, onColor: '#F59E0B', offColor: '#F3E5C2' },
    { on: luces.verde, onColor: '#16A34A', offColor: '#C7E5D2' },
  ]
  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      aria-hidden
    >
      {palette.map((p, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: p.on ? p.onColor : p.offColor,
            boxShadow: p.on ? `0 0 0 2px ${p.onColor}26` : 'none',
            transition: 'background 200ms ease, box-shadow 200ms ease',
          }}
        />
      ))}
    </span>
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

function PreguntaLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: R,
        fontSize: 15,
        fontWeight: 600,
        color: TEXT_DARK,
        margin: '0 0 8px',
      }}
    >
      {children}
    </p>
  )
}

function PreguntaSiNo({
  label,
  value,
  onChange,
  last,
}: {
  label: string
  value: SaludRespuestaSiNo
  onChange: (v: SaludRespuestaSiNo) => void
  last?: boolean
}) {
  return (
    <div style={{ marginBottom: last ? 0 : 12 }}>
      <PreguntaLabel>{label}</PreguntaLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        <OpcionBoton label="Sí" active={value === 'si'} onClick={() => onChange('si')} tone="si" />
        <OpcionBoton label="No" active={value === 'no'} onClick={() => onChange('no')} tone="no" />
      </div>
    </div>
  )
}

function PreguntaConNA({
  label,
  value,
  onChange,
  last,
}: {
  label: string
  value: SaludRespuestaSiNoNa
  onChange: (v: SaludRespuestaSiNoNa) => void
  last?: boolean
}) {
  return (
    <div style={{ marginBottom: last ? 0 : 12 }}>
      <PreguntaLabel>{label}</PreguntaLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <OpcionBoton label="Sí" active={value === 'si'} onClick={() => onChange('si')} tone="si" />
        <OpcionBoton label="No" active={value === 'no'} onClick={() => onChange('no')} tone="no" />
        <OpcionBoton label="N/A" active={value === 'na'} onClick={() => onChange('na')} tone="na" />
      </div>
    </div>
  )
}

function OpcionBoton({
  label,
  active,
  onClick,
  tone,
}: {
  label: string
  active: boolean
  onClick: () => void
  tone: 'si' | 'no' | 'na'
}) {
  const styleByTone = active
    ? tone === 'si'
      ? { bg: GREEN_TINT, border: GREEN_LIGHT, text: GREEN_DARK_TEXT }
      : tone === 'no'
      ? { bg: RED_TINT, border: RED, text: RED_DARK_TEXT }
      : { bg: NEUTRAL_BUTTON_TINT, border: NEUTRAL_BUTTON_BORDER, text: NEUTRAL_BUTTON_TEXT }
    : { bg: '#fff', border: NEUTRAL_BORDER, text: TEXT_SOFT }
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={{
        padding: '14px 12px',
        borderRadius: 10,
        border: `1.5px solid ${styleByTone.border}`,
        background: styleByTone.bg,
        color: styleByTone.text,
        fontFamily: P,
        fontSize: 14,
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
      }}
    >
      {label}
    </button>
  )
}

function HintEstado({ ev }: { ev: SaludEvaluation }) {
  const cfg = {
    verde: { bg: GREEN_HINT_BG, border: GREEN_LIGHT, color: GREEN_DARK_TEXT },
    amarillo: { bg: AMBER_HINT_BG, border: AMBER, color: '#7C4A03' },
    rojo: { bg: RED_HINT_BG, border: RED, color: RED_DARK_TEXT },
    sin_datos: { bg: NEUTRAL_BG, border: NEUTRAL_BORDER, color: TEXT_SOFT },
  }[ev.estado]

  let texto: React.ReactNode
  if (ev.estado === 'verde') {
    texto = (
      <>
        <strong style={{ fontWeight: 700 }}>Vendible.</strong>{' '}
        Documentación esencial completa: {ev.detalle_verde.join(' · ')}.
      </>
    )
  } else if (ev.estado === 'amarillo') {
    texto = (
      <>
        <strong style={{ fontWeight: 700 }}>Casi vendible.</strong>{' '}
        Falta: {ev.falta.join(', ')}.
      </>
    )
  } else if (ev.estado === 'rojo') {
    texto = (
      <>
        <strong style={{ fontWeight: 700 }}>No vendible.</strong>{' '}
        Falta: {ev.falta.join(', ')}.
      </>
    )
  } else {
    texto = (
      <>
        <strong style={{ fontWeight: 700 }}>Sin datos cargados.</strong>{' '}
        Contestá las 3 preguntas para evaluar la salud del acuerdo.
      </>
    )
  }

  return (
    <div
      style={{
        background: cfg.bg,
        borderLeft: `3px solid ${cfg.border}`,
        borderRadius: 8,
        padding: '12px 14px',
        fontFamily: R,
        fontSize: 13.5,
        color: cfg.color,
        lineHeight: 1.55,
      }}
    >
      {texto}
    </div>
  )
}

function ExtraCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: R,
        fontSize: 14,
        color: TEXT_DARK,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: GREEN, cursor: 'pointer', width: 16, height: 16 }}
      />
      {label}
    </label>
  )
}

function Footer({
  hayCambios,
  guardando,
  ultimoGuardado,
  actualizadaPor,
  onGuardar,
}: {
  hayCambios: boolean
  guardando: boolean
  ultimoGuardado: Date | null
  actualizadaPor: string | null
  onGuardar: () => void
}) {
  // 4 estados visuales del status + botón.
  type Estado = 'sin-datos-nunca' | 'con-cambios' | 'guardando' | 'al-dia'
  const estado: Estado = guardando
    ? 'guardando'
    : hayCambios
    ? 'con-cambios'
    : ultimoGuardado
    ? 'al-dia'
    : 'sin-datos-nunca'

  const statusByEstado: Record<Estado, { color: string; texto: React.ReactNode; pulse: boolean; dot: string }> = {
    'sin-datos-nunca': { color: TEXT_HINT, texto: 'Sin cambios para guardar', pulse: false, dot: '#C4C4BD' },
    'con-cambios': { color: '#92400E', texto: 'Cambios sin guardar', pulse: true, dot: AMBER },
    guardando: { color: TEXT_MUTED, texto: 'Guardando…', pulse: false, dot: TEXT_MUTED },
    'al-dia': { color: GREEN_DARK_TEXT, texto: 'Todo al día', pulse: false, dot: GREEN_LIGHT },
  }

  const buttonByEstado: Record<Estado, { bg: string; color: string; border: string; texto: React.ReactNode; disabled: boolean }> = {
    'sin-datos-nunca': {
      bg: '#F3F3F0',
      color: TEXT_HINT,
      border: NEUTRAL_BORDER,
      texto: 'Guardar cambios',
      disabled: true,
    },
    'con-cambios': {
      bg: GREEN,
      color: '#fff',
      border: GREEN,
      texto: 'Guardar cambios',
      disabled: false,
    },
    guardando: {
      bg: GREEN,
      color: '#fff',
      border: GREEN,
      texto: (
        <>
          <Loader2 size={14} className="salud-spin" />
          Guardando…
        </>
      ),
      disabled: true,
    },
    'al-dia': {
      bg: '#fff',
      color: GREEN_DARK_TEXT,
      border: GREEN_LIGHT,
      texto: '✓ Guardado',
      disabled: true,
    },
  }

  const s = statusByEstado[estado]
  const b = buttonByEstado[estado]

  return (
    <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${NEUTRAL_BORDER}` }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: s.color }}>
          <span
            className={s.pulse ? 'salud-dot-pulse' : undefined}
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: s.dot,
            }}
            aria-hidden
          />
          {s.texto}
        </span>
        <span style={{ fontSize: 11.5, color: TEXT_HINT, fontFamily: R }}>
          {ultimoGuardado ? (
            <>
              {formatRelativo(ultimoGuardado)}
              {actualizadaPor ? ` · por ${actualizadaPor}` : null}
            </>
          ) : (
            'Sin guardar todavía'
          )}
        </span>
      </div>
      <button
        type="button"
        onClick={onGuardar}
        disabled={b.disabled}
        style={{
          width: '100%',
          padding: '13px 18px',
          borderRadius: 12,
          border: `1.5px solid ${b.border}`,
          background: b.bg,
          color: b.color,
          fontFamily: R,
          fontSize: 15,
          fontWeight: 700,
          cursor: b.disabled ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          letterSpacing: '0.01em',
          opacity: b.disabled && estado !== 'guardando' && estado !== 'al-dia' ? 0.85 : 1,
        }}
      >
        {b.texto}
      </button>
    </div>
  )
}
