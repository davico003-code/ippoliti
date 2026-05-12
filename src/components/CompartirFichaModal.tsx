'use client'

// Modal que el equipo SI usa desde el ShareMenu para generar fichas
// white-label en verficha.casa. Flujo de 5 estados:
//
//   0. Código de equipo — gating con SI_TEAM_CODE. localStorage si_team_access
//      con TTL 30d evita reingresar el código cada vez.
//   1. Selección de colega — lista de colegas ya guardados + "+ Nuevo colega".
//   2. Form nuevo colega — nombre, WhatsApp, email opcional + checkbox guardar.
//   3. Confirmación — resumen propiedad+colega + textarea de notas internas.
//   4. Éxito — URL de la ficha + copy + WhatsApp prefill al colega + link a /fichas.
//
// Toda llamada a /api/colegas o /api/ficha/crear lleva header X-Team-Code
// con el valor leído de localStorage.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, Check, Copy, MessageCircle, Sparkles, ArrowLeft } from 'lucide-react'

interface Colega {
  id: string
  nombre: string
  whatsapp: string
  email: string | null
}

interface Props {
  propertyId: number
  propertyTitle: string
  onClose: () => void
}

type Step = 'code' | 'select' | 'new' | 'confirm' | 'success'

const STORAGE_KEY = 'si_team_access'
const STORAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000
const R = "'Raleway', system-ui, sans-serif"
const GREEN = '#1A5C38'

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
  } catch {
    // ignore
  }
}

function clearAccess() {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

export default function CompartirFichaModal({ propertyId, propertyTitle, onClose }: Props) {
  const [step, setStep] = useState<Step>('code')
  const [teamCode, setTeamCode] = useState<string>('')
  const [teamInput, setTeamInput] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [colegas, setColegas] = useState<Colega[]>([])
  const [loadingColegas, setLoadingColegas] = useState(false)
  const [selectedColega, setSelectedColega] = useState<Colega | null>(null)

  // Form nuevo colega
  const [newNombre, setNewNombre] = useState('')
  const [newWhatsapp, setNewWhatsapp] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [guardarColega, setGuardarColega] = useState(true)

  const [notas, setNotas] = useState('')
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<{ slug: string; url: string; expiresAt: string } | null>(null)
  const [urlCopied, setUrlCopied] = useState(false)

  // ── Bootstrap: si hay acceso válido en localStorage, salta al estado 1 ──
  useEffect(() => {
    const stored = readAccess()
    if (stored) {
      setTeamCode(stored)
      setStep('select')
    }
  }, [])

  // ── Fetch colegas cuando entra a 'select' ──
  useEffect(() => {
    if (step !== 'select' || !teamCode) return
    let cancelled = false
    setLoadingColegas(true)
    fetch('/api/colegas', { headers: { 'X-Team-Code': teamCode } })
      .then(async res => {
        if (res.status === 401) {
          clearAccess()
          if (!cancelled) {
            setTeamCode('')
            setStep('code')
            setError('El código de equipo expiró. Volvé a ingresarlo.')
          }
          return
        }
        const data = await res.json()
        if (!cancelled) {
          const list: Colega[] = data.colegas || []
          setColegas(list)
          // Si no hay colegas guardados, ir directo al form de nuevo colega.
          if (list.length === 0) setStep('new')
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar la lista de colegas.')
      })
      .finally(() => {
        if (!cancelled) setLoadingColegas(false)
      })
    return () => { cancelled = true }
  }, [step, teamCode])

  // Esc cierra el modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const verifyCode = async () => {
    const code = teamInput.trim()
    if (!code) return
    setVerifying(true)
    setError(null)
    try {
      const res = await fetch('/api/team/verify', {
        method: 'POST',
        headers: { 'X-Team-Code': code },
      })
      if (res.status === 401) {
        setError('Código incorrecto.')
        return
      }
      if (!res.ok) {
        setError('No se pudo verificar el código. Probá de nuevo.')
        return
      }
      writeAccess(code)
      setTeamCode(code)
      setStep('select')
    } catch {
      setError('Sin conexión al verificar el código.')
    } finally {
      setVerifying(false)
    }
  }

  const goToConfirmWithExisting = (c: Colega) => {
    setSelectedColega(c)
    setStep('confirm')
  }

  const submitNewColega = () => {
    if (!newNombre.trim()) { setError('Nombre requerido'); return }
    if (newWhatsapp.replace(/\D/g, '').length < 10) { setError('WhatsApp inválido'); return }
    setError(null)
    setSelectedColega({
      id: '__nuevo__',
      nombre: newNombre.trim(),
      whatsapp: newWhatsapp.trim(),
      email: newEmail.trim() || null,
    })
    setStep('confirm')
  }

  const generar = async () => {
    if (!selectedColega) return
    setCreating(true)
    setError(null)
    try {
      const body: Record<string, unknown> = { propertyId, notas }
      if (selectedColega.id === '__nuevo__') {
        body.colegaNuevo = {
          nombre: selectedColega.nombre,
          whatsapp: selectedColega.whatsapp,
          email: selectedColega.email,
        }
        body.guardarColega = guardarColega
      } else {
        body.colegaId = selectedColega.id
      }

      const res = await fetch('/api/ficha/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Team-Code': teamCode },
        body: JSON.stringify(body),
      })
      if (res.status === 401) {
        clearAccess()
        setTeamCode('')
        setStep('code')
        setError('El código de equipo expiró. Volvé a ingresarlo.')
        return
      }
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'No se pudo crear la ficha.')
        return
      }
      setResult({ slug: data.slug, url: data.url, expiresAt: data.expiresAt })
      setStep('success')
    } catch {
      setError('Error de red al crear la ficha.')
    } finally {
      setCreating(false)
    }
  }

  const copyUrl = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.url)
      setUrlCopied(true)
      setTimeout(() => setUrlCopied(false), 2000)
    } catch {}
  }

  // ── Estilos compartidos ──────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: R,
    background: '#fff',
    boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
    fontFamily: R,
  }
  const primaryBtn: React.CSSProperties = {
    width: '100%',
    padding: '12px 18px',
    background: GREEN,
    color: '#fff',
    border: 'none',
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: R,
    cursor: 'pointer',
  }
  const ghostBtn: React.CSSProperties = {
    width: '100%',
    padding: '12px 18px',
    background: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 500,
    fontFamily: R,
    cursor: 'pointer',
  }

  // ── Render ───────────────────────────────────────────────────────────────
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
        style={{
          background: '#fff',
          borderRadius: 18,
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
          fontFamily: R,
          color: '#111',
          overflow: 'hidden',
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: '1px solid #F3F4F6',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step !== 'code' && step !== 'success' && (
              <button
                type="button"
                onClick={() => {
                  if (step === 'new' && colegas.length > 0) setStep('select')
                  else if (step === 'confirm') setStep(selectedColega?.id === '__nuevo__' ? 'new' : 'select')
                }}
                aria-label="Volver"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', padding: 4, color: '#6B7280',
                }}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 15, fontWeight: 700, color: '#111',
            }}>
              <Sparkles size={16} color={GREEN} />
              Link para colega
            </div>
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
          {/* ─────────────── Estado 0: Código de equipo ─────────────── */}
          {step === 'code' && (
            <div>
              <p style={{ fontSize: 14, color: '#374151', marginTop: 0, lineHeight: 1.5 }}>
                Esta función la usamos como equipo. Ingresá el código compartido para continuar.
              </p>
              <div style={{ marginTop: 16 }}>
                <label style={labelStyle} htmlFor="team-code">Código de equipo</label>
                <input
                  id="team-code"
                  type="password"
                  autoFocus
                  value={teamInput}
                  onChange={e => { setTeamInput(e.target.value); setError(null) }}
                  onKeyDown={e => { if (e.key === 'Enter') verifyCode() }}
                  placeholder="••••••••••"
                  style={inputStyle}
                />
                {error && <div style={{ color: '#B91C1C', fontSize: 12, marginTop: 8 }}>{error}</div>}
              </div>
              <button
                type="button"
                onClick={verifyCode}
                disabled={verifying || !teamInput.trim()}
                style={{ ...primaryBtn, marginTop: 16, opacity: verifying || !teamInput.trim() ? 0.6 : 1 }}
              >
                {verifying ? 'Verificando…' : 'Continuar'}
              </button>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 12, lineHeight: 1.5 }}>
                El código se guarda en este dispositivo por 30 días.
              </p>
            </div>
          )}

          {/* ─────────────── Estado 1: Selección de colega ─────────────── */}
          {step === 'select' && (
            <div>
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 0 }}>
                Elegí un colega ya guardado o agregá uno nuevo.
              </p>
              {loadingColegas && (
                <div style={{ fontSize: 13, color: '#6B7280', padding: '20px 0' }}>Cargando…</div>
              )}
              {!loadingColegas && colegas.length > 0 && (
                <div style={{
                  marginTop: 12,
                  border: '1px solid #E5E7EB',
                  borderRadius: 12,
                  maxHeight: 280,
                  overflowY: 'auto',
                }}>
                  {colegas.map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => goToConfirmWithExisting(c)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 14px',
                        background: '#fff',
                        border: 'none',
                        borderTop: i === 0 ? 'none' : '1px solid #F3F4F6',
                        cursor: 'pointer',
                        fontFamily: R,
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{c.nombre}</div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                        {c.whatsapp}{c.email ? ` · ${c.email}` : ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setStep('new')}
                style={{ ...ghostBtn, marginTop: 16 }}
              >
                + Nuevo colega
              </button>
              {error && <div style={{ color: '#B91C1C', fontSize: 12, marginTop: 8 }}>{error}</div>}
            </div>
          )}

          {/* ─────────────── Estado 2: Form nuevo colega ─────────────── */}
          {step === 'new' && (
            <div>
              <div>
                <label style={labelStyle} htmlFor="col-nombre">Nombre *</label>
                <input
                  id="col-nombre"
                  type="text"
                  autoFocus
                  value={newNombre}
                  onChange={e => setNewNombre(e.target.value)}
                  placeholder="Ej. Pedro Martínez"
                  style={inputStyle}
                />
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={labelStyle} htmlFor="col-wsp">WhatsApp *</label>
                <input
                  id="col-wsp"
                  type="tel"
                  value={newWhatsapp}
                  onChange={e => setNewWhatsapp(e.target.value)}
                  placeholder="3413..."
                  style={inputStyle}
                />
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={labelStyle} htmlFor="col-email">Email (opcional)</label>
                <input
                  id="col-email"
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="pedro@example.com"
                  style={inputStyle}
                />
              </div>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginTop: 14, fontSize: 13, color: '#374151', cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={guardarColega}
                  onChange={e => setGuardarColega(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                Guardar para futuras fichas
              </label>
              {error && <div style={{ color: '#B91C1C', fontSize: 12, marginTop: 8 }}>{error}</div>}
              <button
                type="button"
                onClick={submitNewColega}
                style={{ ...primaryBtn, marginTop: 18 }}
              >
                Continuar
              </button>
            </div>
          )}

          {/* ─────────────── Estado 3: Confirmar ─────────────── */}
          {step === 'confirm' && selectedColega && (
            <div>
              <div style={{
                background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12,
                padding: 14, fontSize: 13,
              }}>
                <div style={{ color: '#6B7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Propiedad</div>
                <div style={{ fontWeight: 600, color: '#111', marginBottom: 10 }}>{propertyTitle}</div>
                <div style={{ color: '#6B7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Contacto que verá el cliente</div>
                <div style={{ fontWeight: 600, color: '#111' }}>{selectedColega.nombre}</div>
                <div style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>
                  {selectedColega.whatsapp}{selectedColega.email ? ` · ${selectedColega.email}` : ''}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <label style={labelStyle} htmlFor="notas">Notas internas (solo vos las ves)</label>
                <textarea
                  id="notas"
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  rows={3}
                  placeholder="Ej. comisión 50/50, prioridad…"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {error && <div style={{ color: '#B91C1C', fontSize: 12, marginTop: 8 }}>{error}</div>}

              <button
                type="button"
                onClick={generar}
                disabled={creating}
                style={{ ...primaryBtn, marginTop: 18, opacity: creating ? 0.6 : 1 }}
              >
                {creating ? 'Generando…' : 'Generar link'}
              </button>
            </div>
          )}

          {/* ─────────────── Estado 4: Éxito ─────────────── */}
          {step === 'success' && result && selectedColega && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Check size={18} color={GREEN} />
                <div style={{ fontSize: 15, fontWeight: 700, color: GREEN }}>Listo</div>
              </div>

              <div style={{
                background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12,
                padding: 14,
              }}>
                <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Link de la ficha
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
                  onClick={copyUrl}
                  style={{
                    marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', background: '#fff',
                    border: '1px solid #D1D5DB', borderRadius: 999,
                    fontSize: 13, fontFamily: R, cursor: 'pointer', color: '#111',
                  }}
                >
                  {urlCopied ? <Check size={14} color={GREEN} /> : <Copy size={14} />}
                  {urlCopied ? 'Copiado' : 'Copiar link'}
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
                href={`https://wa.me/${selectedColega.whatsapp}?text=${encodeURIComponent(`Te paso esta propiedad: ${result.url}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginTop: 18, padding: '12px 18px',
                  background: '#25D366', color: '#fff',
                  border: 'none', borderRadius: 999,
                  fontSize: 14, fontWeight: 700, fontFamily: R,
                  textDecoration: 'none',
                }}
              >
                <MessageCircle size={16} />
                Compartir por WhatsApp al colega ahora
              </a>

              <Link
                href="/fichas"
                style={{
                  display: 'block', marginTop: 14, textAlign: 'center',
                  fontSize: 13, color: GREEN, textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
                onClick={onClose}
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
