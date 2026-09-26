'use client'

// Gate de acceso para SI School. Mismo patrón que /recursos/autorizaciones:
// valida el código contra el endpoint protegido /api/autorizaciones/listar
// (que ya requiere SI_TEAM_CODE) y guarda en localStorage la key compartida
// `si_team_access`. Así, si el agente ya entró por autorizaciones, no le
// vuelve a pedir el código.
//
// La clave guardada se re-valida en segundo plano: si el equipo cambió la
// clave, antes el agente entraba igual con la vieja y después cada
// capacitación le daba {"error":"Unauthorized"}. Ahora se la vuelve a pedir.

import { useCallback, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'si_team_access'

type Validacion = 'ok' | 'invalido' | 'error'

async function validarCodigo(code: string): Promise<Validacion> {
  try {
    const res = await fetch('/api/autorizaciones/listar?status=all&limit=1', {
      headers: { 'x-team-code': code },
    })
    if (res.status === 401) return 'invalido'
    return res.ok ? 'ok' : 'error'
  } catch {
    return 'error'
  }
}

// Sesión de agente (cookie JWT del panel). Si la hay, SI School deja pasar
// sin clave de equipo: la API de capacitaciones ya acepta esa cookie.
async function haySesionAgente(): Promise<boolean> {
  try {
    const res = await fetch('/api/agentes/me', { cache: 'no-store' })
    if (!res.ok) return false
    const data = (await res.json()) as { agent?: unknown }
    return !!data.agent
  } catch {
    return false
  }
}

interface Props {
  /** teamCode llega vacío si se entró por sesión de agente (permitirAgente). */
  children: (ctx: { teamCode: string; onLogout: () => void }) => ReactNode
  /** Deja pasar a un agente logueado sin pedir la clave de equipo. */
  permitirAgente?: boolean
  /** Copy de la pantalla de acceso (default: SI School). */
  eyebrow?: string
  title?: string
  subtitle?: string
}

export default function TeamCodeGate({ children, permitirAgente = false, eyebrow, title, subtitle }: Props) {
  const [teamCode, setTeamCode] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [vencida, setVencida] = useState(false)
  const [agente, setAgente] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const guardado = window.localStorage.getItem(STORAGE_KEY)
    let vivo = true
    if (!guardado) {
      if (!permitirAgente) {
        setChecking(false)
        return
      }
      void haySesionAgente().then((ok) => {
        if (!vivo) return
        setAgente(ok)
        setChecking(false)
      })
      return () => {
        vivo = false
      }
    }
    setTeamCode(guardado)
    setChecking(false)
    // No frena la carga: se entra con la guardada y, si el server la rechaza,
    // se vuelve a pedir (salvo que haya sesión de agente). Un error de red no
    // la borra.
    void validarCodigo(guardado).then(async (r) => {
      if (!vivo || r !== 'invalido') return
      window.localStorage.removeItem(STORAGE_KEY)
      const ok = permitirAgente && (await haySesionAgente())
      if (!vivo) return
      setAgente(ok)
      setTeamCode(null)
      setVencida(!ok)
    })
    return () => {
      vivo = false
    }
  }, [permitirAgente])

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

  if (!teamCode && !agente) {
    return (
      <AccessGate
        onAuth={onAuth}
        eyebrow={eyebrow}
        title={title}
        subtitle={vencida ? 'La clave del equipo cambió. Ingresá la nueva para seguir.' : subtitle}
      />
    )
  }

  return <>{children({ teamCode: teamCode ?? '', onLogout })}</>
}

function AccessGate({
  onAuth,
  eyebrow = '● SI School',
  title = 'Acceso de equipo',
  subtitle = 'Ingresá el código del equipo SI para entrar al sistema operativo del agente.',
}: {
  onAuth: (code: string) => void
  eyebrow?: string
  title?: string
  subtitle?: string
}) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!code.trim()) return
    setSubmitting(true)
    setError(null)
    const r = await validarCodigo(code.trim())
    setSubmitting(false)
    if (r === 'invalido') setError('Código incorrecto')
    else if (r === 'error') setError('No se pudo validar. Probá de nuevo.')
    else onAuth(code.trim())
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
          {eyebrow}
        </p>
        <h1 className="text-[22px] font-bold m-0 mb-2" style={{ color: '#1A1A1A' }}>
          {title}
        </h1>
        <p className="text-[14px] mb-5 leading-relaxed" style={{ color: '#5A5A55' }}>
          {subtitle}
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
