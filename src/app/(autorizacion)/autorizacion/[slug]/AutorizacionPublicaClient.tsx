'use client'

// Vista pública del cliente: documento legal completo + form de firma con
// canvas. Live preview de los 4 campos del firmante en el preámbulo.
//
// react-signature-canvas no soporta SSR → cargado vía dynamic con ssr:false.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import SignatureCanvas from 'react-signature-canvas'
import { Loader2 } from 'lucide-react'

import type { Autorizacion } from '@/lib/autorizaciones'
import {
  PLACEHOLDER_TOKENS,
  PREAMBULO_PLANTILLA,
  CIERRE_CONSENTIMIENTO,
  CIERRE_FECHA_PLACEHOLDER,
  formatFechaEncabezado,
  getClausulas,
  getTitulo,
} from '@/lib/autorizaciones/documentoTexto'

// ── Paleta ─────────────────────────────────────────────────────────────────
const GREEN = '#1A5C38'
const TEXT_DARK = '#1A1A1A'
const TEXT_SOFT = '#5A5A55'
const TEXT_MUTED = '#8A8A85'
const TEXT_PLACEHOLDER = '#B5B5AE'
const LABEL_MUTED = '#6B6B66'
const LINE = '#E5E5E0'
const DASH = '#C4C4BD'
const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"

// Largo del subrayado dinámico según campo (visual: simular líneas a completar)
const PLACEHOLDER_UNDERSCORE: Record<(typeof PLACEHOLDER_TOKENS)[number], string> = {
  '{NOMBRE}': '_____________________',
  '{DNI}': '__________',
  '{DOMICILIO}': '_____________________',
  '{EMAIL}': '__________________',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Props {
  auth: Autorizacion
}

export default function AutorizacionPublicaClient({ auth }: Props) {
  const router = useRouter()
  const sigRef = useRef<SignatureCanvas | null>(null)
  const [canvasWidth, setCanvasWidth] = useState(0)
  const [mounted, setMounted] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Montaje client-only: react-signature-canvas toca window en su constructor,
  // así que esperamos al paint inicial para evitar errores SSR.
  useEffect(() => { setMounted(true) }, [])

  // Campos del firmante con pre-carga del agente.
  const [nombre, setNombre] = useState(auth.cliente_precarga.nombre || '')
  const [dni, setDni] = useState(auth.cliente_precarga.dni || '')
  const [domicilio, setDomicilio] = useState('')
  const [email, setEmail] = useState(auth.cliente_precarga.email || '')
  const [acepto, setAcepto] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fecha encabezado: pre-firma usa new Date() (no created_at).
  const fechaEncabezado = useMemo(() => formatFechaEncabezado(new Date()), [])

  const titulo = getTitulo(auth)
  const clausulas = useMemo(() => getClausulas(auth), [auth])

  // Canvas responsive: re-instanciar al cambiar width (signature_pad necesita reset).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const measure = () => {
      const w = wrapRef.current?.clientWidth || 0
      setCanvasWidth(w)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const canvasHeight = typeof window !== 'undefined' && window.matchMedia('(min-width: 720px)').matches ? 220 : 180

  // ── Validaciones ──────────────────────────────────────────────────────────
  const nombreValid = nombre.trim().length >= 5 && /\s/.test(nombre.trim())
  const dniValid = /^\d{7,9}$/.test(dni.trim())
  const domicilioValid = domicilio.trim().length >= 8
  const emailValid = EMAIL_RE.test(email.trim())
  const canSubmit = nombreValid && dniValid && domicilioValid && emailValid && hasSignature && acepto && !submitting

  // ── Submit ────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!canSubmit || !sigRef.current) return
    setSubmitting(true)
    setError(null)
    try {
      const firma_base64 = sigRef.current.toDataURL('image/png')
      const res = await fetch(`/api/autorizaciones/${auth.slug}/firmar`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          dni: dni.trim(),
          domicilio: domicilio.trim(),
          email: email.trim(),
          firma_base64,
          acepto: true,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setError(data?.error || `Error ${res.status}`)
        setSubmitting(false)
        return
      }
      router.push(data.redirect || `/autorizacion/${auth.slug}/firmada`)
    } catch {
      setError('No se pudo enviar la autorización. Revisá tu conexión e intentá de nuevo.')
      setSubmitting(false)
    }
  }

  // ── Render del preámbulo con placeholders dinámicos ───────────────────────
  // Token regex que captura los 4 placeholders. El split deja la posición par
  // como texto plano, la impar como uno de los tokens.
  const preambuloPieces = useMemo(() => splitByPlaceholders(PREAMBULO_PLANTILLA), [])
  const valueFor = (token: (typeof PLACEHOLDER_TOKENS)[number]): string => {
    switch (token) {
      case '{NOMBRE}': return nombre
      case '{DNI}': return dni
      case '{DOMICILIO}': return domicilio
      case '{EMAIL}': return email
    }
  }

  return (
    <div>
      {/* Título + fecha del documento */}
      <h1
        style={{
          fontFamily: R,
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: '0.03em',
          color: TEXT_DARK,
          textAlign: 'center',
          margin: '8px 0 4px',
          lineHeight: 1.3,
        }}
      >
        {titulo}
      </h1>
      <p
        style={{
          fontFamily: R,
          fontSize: 12,
          color: TEXT_MUTED,
          textAlign: 'center',
          margin: '0 0 24px',
        }}
      >
        {fechaEncabezado}
      </p>

      {/* Preámbulo (live preview de los 4 placeholders) */}
      <p style={paragraphStyle}>
        {preambuloPieces.map((p, i) => {
          if (p.kind === 'text') return <span key={i}>{p.text}</span>
          const val = valueFor(p.token).trim()
          if (val) {
            return (
              <span key={i} style={dataInlineStyle}>
                {val}
              </span>
            )
          }
          return (
            <span key={i} style={placeholderStyle}>
              {PLACEHOLDER_UNDERSCORE[p.token]}
            </span>
          )
        })}
      </p>

      {/* Cláusulas — estructura inline "1.- Inmueble: texto..." */}
      {clausulas.map(cl => (
        <p key={cl.key} style={{ ...paragraphStyle, marginTop: 14 }}>
          <span style={clausulaNumStyle}>{cl.numero}.- </span>
          <span style={clausulaTituloStyle}>{cl.titulo}: </span>
          {cl.chunks.map((c, i) => (
            <span key={i} style={c.kind === 'data' ? dataInlineStyle : undefined}>
              {c.text}
            </span>
          ))}
        </p>
      ))}

      {/* Cierre */}
      <p style={{ ...paragraphStyle, marginTop: 20 }}>{CIERRE_CONSENTIMIENTO}</p>
      <p style={{ ...paragraphStyle, marginTop: 8 }}>
        Firmado digitalmente en Funes, el{' '}
        <span style={placeholderStyle}>{CIERRE_FECHA_PLACEHOLDER}</span>.
      </p>

      {/* Separador */}
      <hr style={{ border: 'none', borderTop: `1px solid ${LINE}`, margin: '32px 0 0' }} />

      {/* Badge "Completá para firmar" — solo texto, sin pill */}
      <p
        style={{
          fontFamily: P,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.16em',
          color: GREEN,
          margin: '24px 0 12px',
          textTransform: 'uppercase',
        }}
      >
        Completá para firmar
      </p>

      <FormFields
        nombre={nombre} dni={dni} domicilio={domicilio} email={email}
        onNombre={setNombre} onDni={setDni} onDomicilio={setDomicilio} onEmail={setEmail}
        nombreValid={nombreValid} dniValid={dniValid} domicilioValid={domicilioValid} emailValid={emailValid}
        disabled={submitting}
      />

      {/* Canvas */}
      <div style={{ marginTop: 16 }} ref={wrapRef}>
        <div
          style={{
            position: 'relative',
            border: `1px dashed ${DASH}`,
            borderRadius: 8,
            background: '#fff',
            overflow: 'hidden',
          }}
        >
          {mounted && canvasWidth > 0 ? (
            <SignatureCanvas
              ref={(r: SignatureCanvas | null) => { sigRef.current = r }}
              penColor="#0a0a0a"
              canvasProps={{
                width: canvasWidth,
                height: canvasHeight,
                style: { display: 'block', width: '100%', height: canvasHeight, touchAction: 'none' },
              }}
              onEnd={() => setHasSignature(sigRef.current ? !sigRef.current.isEmpty() : false)}
            />
          ) : (
            <div style={{ width: '100%', height: canvasHeight, background: '#FAFAF9' }} aria-hidden />
          )}
          <button
            type="button"
            onClick={() => {
              sigRef.current?.clear()
              setHasSignature(false)
            }}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(255,255,255,0.92)',
              border: `1px solid ${LINE}`,
              borderRadius: 999,
              padding: '4px 10px',
              fontSize: 11,
              color: TEXT_SOFT,
              fontFamily: R,
              cursor: 'pointer',
            }}
          >
            ↻ Limpiar
          </button>
        </div>
        <p style={{ fontSize: 12, color: TEXT_MUTED, margin: '8px 0 0' }}>
          Firmá con tu dedo o mouse.
        </p>
      </div>

      {/* Checkbox de conformidad */}
      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          marginTop: 20,
          fontSize: 13,
          color: TEXT_DARK,
          lineHeight: 1.5,
          fontFamily: R,
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={acepto}
          onChange={e => setAcepto(e.target.checked)}
          disabled={submitting}
          style={{ accentColor: GREEN, marginTop: 2 }}
        />
        <span>
          Declaro que los datos son verídicos y presto conformidad al contenido del presente acuerdo.
        </span>
      </label>

      {/* CTA */}
      <button
        type="button"
        onClick={() => void submit()}
        disabled={!canSubmit}
        style={{
          marginTop: 18,
          width: '100%',
          padding: '14px 18px',
          borderRadius: 12,
          border: 'none',
          background: canSubmit ? GREEN : '#A8B0A6',
          color: '#fff',
          fontFamily: R,
          fontSize: 15,
          fontWeight: 700,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          letterSpacing: '0.02em',
          opacity: canSubmit ? 1 : 0.85,
        }}
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? 'Procesando…' : 'Firmar y enviar acuerdo'}
      </button>

      {error && (
        <p
          role="alert"
          style={{
            marginTop: 12,
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

      <p
        style={{
          marginTop: 14,
          fontSize: 12,
          color: TEXT_MUTED,
          lineHeight: 1.55,
        }}
      >
        Validez probatoria conforme Ley 25.506. Recibirás copia descargable al finalizar.
      </p>

      {/* Footer minimalista */}
      <div
        style={{
          marginTop: 36,
          textAlign: 'center',
          color: TEXT_MUTED,
          fontFamily: R,
          fontSize: 11,
          lineHeight: 1.6,
        }}
      >
        SI INMOBILIARIA · Funes · Roldán · Rosario
        <br />
        siinmobiliaria.com
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  )
}

// ── Subcomponentes y estilos compartidos ───────────────────────────────────

const paragraphStyle: React.CSSProperties = {
  fontFamily: R,
  fontSize: 13.5,
  fontWeight: 400,
  lineHeight: 1.65,
  color: TEXT_DARK,
  margin: 0,
  textAlign: 'justify',
}

const dataInlineStyle: React.CSSProperties = {
  fontWeight: 600,
  color: TEXT_DARK,
}

const placeholderStyle: React.CSSProperties = {
  fontWeight: 400,
  color: TEXT_PLACEHOLDER,
}

const clausulaNumStyle: React.CSSProperties = {
  fontWeight: 600,
  color: TEXT_DARK,
}

const clausulaTituloStyle: React.CSSProperties = {
  fontWeight: 700,
  color: TEXT_DARK,
}

type Token = (typeof PLACEHOLDER_TOKENS)[number]

function splitByPlaceholders(s: string): Array<{ kind: 'text'; text: string } | { kind: 'token'; token: Token }> {
  const re = /(\{NOMBRE\}|\{DNI\}|\{DOMICILIO\}|\{EMAIL\})/g
  const out: Array<{ kind: 'text'; text: string } | { kind: 'token'; token: Token }> = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) out.push({ kind: 'text', text: s.slice(last, m.index) })
    out.push({ kind: 'token', token: m[1] as Token })
    last = m.index + m[0].length
  }
  if (last < s.length) out.push({ kind: 'text', text: s.slice(last) })
  return out
}

// ── Form inputs ────────────────────────────────────────────────────────────

interface FormFieldsProps {
  nombre: string; dni: string; domicilio: string; email: string
  onNombre: (v: string) => void
  onDni: (v: string) => void
  onDomicilio: (v: string) => void
  onEmail: (v: string) => void
  nombreValid: boolean; dniValid: boolean; domicilioValid: boolean; emailValid: boolean
  disabled: boolean
}

function FormFields({
  nombre, dni, domicilio, email,
  onNombre, onDni, onDomicilio, onEmail,
  nombreValid, dniValid, domicilioValid, emailValid,
  disabled,
}: FormFieldsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Input
        label="Nombre y apellido"
        value={nombre}
        onChange={onNombre}
        placeholder="Tu nombre completo"
        autoComplete="name"
        invalid={nombre.length > 0 && !nombreValid}
        disabled={disabled}
        helper={nombre.length > 0 && !nombreValid ? 'Ingresá nombre y apellido (mínimo 5 caracteres)' : undefined}
      />
      <Input
        label="DNI"
        value={dni}
        onChange={v => onDni(v.replace(/\D/g, '').slice(0, 9))}
        placeholder="Solo números"
        inputMode="numeric"
        invalid={dni.length > 0 && !dniValid}
        disabled={disabled}
        helper={dni.length > 0 && !dniValid ? 'El DNI debe tener entre 7 y 9 dígitos' : undefined}
      />
      <Input
        label="Domicilio"
        value={domicilio}
        onChange={onDomicilio}
        placeholder="Calle, número, localidad"
        autoComplete="street-address"
        invalid={domicilio.length > 0 && !domicilioValid}
        disabled={disabled}
        helper={domicilio.length > 0 && !domicilioValid ? 'Ingresá tu domicilio completo (mínimo 8 caracteres)' : undefined}
      />
      <Input
        label="Email"
        value={email}
        onChange={onEmail}
        placeholder="tu@email.com"
        type="email"
        autoComplete="email"
        invalid={email.length > 0 && !emailValid}
        disabled={disabled}
        helper={email.length > 0 && !emailValid ? 'Ingresá un email válido' : undefined}
      />
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  autoComplete,
  invalid,
  helper,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  inputMode?: 'text' | 'numeric' | 'email'
  autoComplete?: string
  invalid?: boolean
  helper?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontFamily: P,
          fontSize: 11,
          fontWeight: 600,
          color: LABEL_MUTED,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        disabled={disabled}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '11px 14px',
          borderRadius: 10,
          border: `1px solid ${invalid ? '#FCA5A5' : LINE}`,
          fontSize: 15,
          fontFamily: R,
          outline: 'none',
          background: disabled ? '#FAFAF9' : '#fff',
          color: TEXT_DARK,
        }}
      />
      {helper && (
        <p style={{ marginTop: 4, fontSize: 12, color: '#B91C1C' }}>{helper}</p>
      )}
    </div>
  )
}
