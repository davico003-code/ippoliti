'use client'

// Gate de acceso para SI School. Mismo patrón que /recursos/autorizaciones:
// valida el código contra el endpoint protegido /api/autorizaciones/listar
// (que ya requiere SI_TEAM_CODE) y guarda en localStorage la key compartida
// `si_team_access`. Así, si el agente ya entró por autorizaciones, no le
// vuelve a pedir el código.

import { useCallback, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'si_team_access'

interface Props {
  children: (ctx: { teamCode: string; onLogout: () => void }) => ReactNode
}

export default function TeamCodeGate({ children }: Props) {
  const [teamCode, setTeamCode] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setTeamCode(window.localStorage.getItem(STORAGE_KEY))
    setChecking(false)
  }, [])

  const onAuth = useCallback((code: string) => {
    window.localStorage.setItem(STORAGE_KEY, code)
    setTeamCode(code)
  }, [])

  const onLogout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setTeamCode(null)
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAF9' }}>
        <div className="text-sm text-zinc-500 font-raleway">Cargando…</div>
      </div>
    )
  }

  if (!teamCode) return <AccessGate onAuth={onAuth} />

  return <>{children({ teamCode, onLogout })}</>
}

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
      className="min-h-screen flex items-center justify-center px-6 font-raleway"
      style={{ background: '#FAFAF9' }}
    >
      <div className="w-full max-w-[400px] bg-white rounded-2xl p-7 border" style={{ borderColor: '#E5E5E0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <p
          className="font-poppins text-[11px] uppercase font-semibold mb-2"
          style={{ color: '#1A5C38', letterSpacing: '0.18em' }}
        >
          ● SI School
        </p>
        <h1 className="text-[22px] font-bold m-0 mb-2" style={{ color: '#1A1A1A' }}>
          Acceso de equipo
        </h1>
        <p className="text-[14px] mb-5 leading-relaxed" style={{ color: '#5A5A55' }}>
          Ingresá el código del equipo SI para entrar al sistema operativo del agente.
        </p>
        <input
          type="password"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void submit()
          }}
          placeholder="Código de equipo"
          disabled={submitting}
          className="w-full box-border px-3.5 py-3 rounded-[10px] border text-[15px] outline-none mb-3 bg-white"
          style={{ borderColor: '#E5E5E0', fontFamily: "'Raleway', system-ui, sans-serif" }}
        />
        {error && (
          <p className="text-[13px] mb-3" style={{ color: '#B32230' }}>
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting || !code.trim()}
          className="w-full py-3 rounded-[10px] text-[14px] font-semibold transition disabled:opacity-50"
          style={{ background: '#1A5C38', color: '#fff', fontFamily: "'Poppins', system-ui, sans-serif" }}
        >
          {submitting ? 'Validando…' : 'Entrar'}
        </button>
        <p className="text-[12px] mt-4 text-center" style={{ color: '#8B847A' }}>
          Si no tenés el código, hablá con David.
        </p>
      </div>
    </div>
  )
}
