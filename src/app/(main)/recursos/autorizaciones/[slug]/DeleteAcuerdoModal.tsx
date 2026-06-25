'use client'

// Modal de eliminación de acuerdo con clave de confirmación.
// Pide la SI_DELETE_CODE al usuario; el servidor valida y ejecuta el delete.
//
// Diseño: overlay fijo + card centrada, header con ícono rojo, box de
// contexto (dirección + estado + fecha), input password, botones cancelar
// / eliminar definitivamente.

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Loader2, Trash2 } from 'lucide-react'

import type { Autorizacion } from '@/lib/autorizaciones'

const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"
const GREEN = '#1A5C38'
const RED = '#B91C1C'
const RED_BORDER = '#FECACA'
const RED_BG = '#FEE2E2'
const RED_TEXT_SOFT = '#7F1D1D'
const LINE = '#E5E5E0'
const BG = '#FAFAF9'
const TEXT_DARK = '#1A1A1A'
const TEXT_MUTED = '#6B6B66'
const TEXT_SOFT = '#5A5A55'

interface Props {
  auth: Autorizacion
  teamCode: string
  onClose: () => void
  /** Callback tras delete exitoso (caller decide redirect/toast). */
  onDeleted: () => void
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function statusLabel(s: Autorizacion['status']): string {
  return s === 'firmada' ? 'Firmada' : s === 'expirada' ? 'Expirada' : 'Pendiente'
}

export default function DeleteAcuerdoModal({ auth, teamCode, onClose, onDeleted }: Props) {
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus al input al abrir + cierra con Escape
  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, submitting])

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!code.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/autorizaciones/${auth.slug}`, {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
          'x-team-code': teamCode,
        },
        body: JSON.stringify({ delete_code: code.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 403) {
        setError('Clave incorrecta')
        setSubmitting(false)
        return
      }
      if (!res.ok) {
        setError(data?.error || `Error ${res.status}`)
        setSubmitting(false)
        return
      }
      onDeleted()
    } catch {
      setError('Error de red')
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-acuerdo-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 16,
        fontFamily: R,
      }}
      onClick={e => {
        if (e.target === e.currentTarget && !submitting) onClose()
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          background: '#fff',
          borderRadius: 14,
          maxWidth: 420,
          width: '100%',
          padding: 26,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header con ícono rojo */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
          <div
            style={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: RED_BG,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trash2 size={20} color={RED} />
          </div>
          <div>
            <h2
              id="delete-acuerdo-title"
              style={{
                fontFamily: R,
                fontSize: 17,
                fontWeight: 700,
                color: TEXT_DARK,
                margin: '0 0 4px',
                lineHeight: 1.3,
              }}
            >
              Eliminar acuerdo
            </h2>
            <p style={{ fontFamily: R, fontSize: 13, fontWeight: 400, color: TEXT_SOFT, margin: 0, lineHeight: 1.5 }}>
              Esta acción no se puede deshacer. Se borrará el registro y el link compartido dejará de funcionar.
            </p>
          </div>
        </div>

        {/* Box gris de contexto */}
        <div
          style={{
            background: BG,
            border: `1px solid ${LINE}`,
            borderRadius: 10,
            padding: 12,
            marginBottom: 18,
          }}
        >
          <p
            style={{
              fontFamily: P,
              fontSize: 10,
              fontWeight: 600,
              color: TEXT_MUTED,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              margin: '0 0 4px',
            }}
          >
            Vas a eliminar
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: TEXT_DARK, margin: '0 0 2px' }}>
            {auth.direccion}
          </p>
          <p style={{ fontSize: 12, color: TEXT_MUTED, margin: 0 }}>
            {statusLabel(auth.status)} · creado el {fmtDate(auth.created_at)}
          </p>
        </div>

        {/* Input de clave */}
        <label htmlFor="delete-code-input" style={{ display: 'block', marginBottom: 14 }}>
          <span
            style={{
              display: 'block',
              fontFamily: P,
              fontSize: 11,
              fontWeight: 600,
              color: TEXT_MUTED,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 6,
            }}
          >
            Clave de eliminación
          </span>
          <input
            ref={inputRef}
            id="delete-code-input"
            type="password"
            autoComplete="off"
            value={code}
            onChange={e => { setCode(e.target.value); if (error) setError(null) }}
            placeholder="Ingresá la clave para confirmar"
            disabled={submitting}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '11px 14px',
              borderRadius: 10,
              border: `1.5px solid ${error ? RED_BORDER : LINE}`,
              fontSize: 15,
              fontFamily: R,
              outline: 'none',
              background: '#fff',
              color: TEXT_DARK,
            }}
            onFocus={e => {
              if (!error) e.currentTarget.style.borderColor = GREEN
            }}
            onBlur={e => {
              if (!error) e.currentTarget.style.borderColor = LINE
            }}
          />
          {error && (
            <p
              role="alert"
              style={{
                marginTop: 6,
                fontSize: 12,
                color: RED_TEXT_SOFT,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <AlertCircle size={13} />
              {error}
            </p>
          )}
          <p style={{ marginTop: 8, fontSize: 11, color: TEXT_MUTED, lineHeight: 1.5 }}>
            Clave fija para acciones destructivas. No es la misma del panel.
          </p>
        </label>

        {/* Botones */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginTop: 6,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: '11px 14px',
              borderRadius: 10,
              border: `1px solid ${LINE}`,
              background: '#fff',
              color: TEXT_DARK,
              fontFamily: R,
              fontSize: 14,
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || !code.trim()}
            style={{
              padding: '11px 14px',
              borderRadius: 10,
              border: 'none',
              background: !code.trim() || submitting ? '#D8A0A0' : RED,
              color: '#fff',
              fontFamily: R,
              fontSize: 14,
              fontWeight: 600,
              cursor: submitting || !code.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? 'Eliminando…' : 'Eliminar definitivamente'}
          </button>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      ` }} />
    </div>
  )
}
