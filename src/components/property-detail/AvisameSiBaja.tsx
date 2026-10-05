'use client'

// "Avisame si baja" (David, 4-oct-2026: "deja el mail y automáticamente le
// enviamos una notificación si baja, a través de emBlue"). Abajo del precio de
// la ficha (compu y celu). Deja el mail → Hilo guarda el pedido de ESTA
// propiedad (y su búsqueda, con permiso de email) y el aviso automático de
// bajas por emBlue le escribe si baja: 24 h después del último cambio, solo
// bajas, nunca dos veces el mismo precio.

import { useEffect, useRef, useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { esEmail, escribirContacto, leerContacto } from '@/lib/feed-en-red'
import { trackEvent, trackFbEvent } from '@/lib/analytics'

const VERDE = '#1A5C38'
const CLAVE = 'si-avisame-baja'

function yaPidio(id: number): boolean {
  try {
    const v = JSON.parse(window.localStorage.getItem(CLAVE) ?? '[]')
    return Array.isArray(v) && v.includes(id)
  } catch {
    return false
  }
}

function marcarPedido(id: number): void {
  try {
    const v = JSON.parse(window.localStorage.getItem(CLAVE) ?? '[]')
    const lista = Array.isArray(v) ? v : []
    if (!lista.includes(id)) window.localStorage.setItem(CLAVE, JSON.stringify([...lista, id].slice(-50)))
  } catch {
    /* sin almacenamiento: se vuelve a ofrecer */
  }
}

export default function AvisameSiBaja({ propertyId }: { propertyId: number }) {
  const [abierto, setAbierto] = useState(false)
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'listo' | 'ya'>('idle')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (yaPidio(propertyId)) setEstado('ya')
    setEmail(leerContacto().email)
  }, [propertyId])

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (estado === 'enviando') return
    const mail = email.trim()
    if (!esEmail(mail)) return setError('Revisá el mail, por ejemplo martina@gmail.com.')
    setError(null)
    setEstado('enviando')
    try {
      const res = await fetch('/api/avisame-si-baja', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: mail, nombre: leerContacto().nombre, propiedadId: propertyId, pageUrl: window.location.href }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'No pudimos anotarte. Probá de nuevo.')
      escribirContacto({ email: mail })
      marcarPedido(propertyId)
      trackEvent('avisame_si_baja', { propiedad: propertyId })
      trackFbEvent('Lead', { content_name: 'avisame_si_baja', content_ids: [String(propertyId)] })
      setEstado('listo')
    } catch (err) {
      setEstado('idle')
      setError(err instanceof Error ? err.message : 'No pudimos anotarte. Probá de nuevo.')
    }
  }

  if (estado === 'ya' || estado === 'listo') {
    return (
      <p className="mt-3 inline-flex items-center gap-2 text-[15px] font-semibold" style={{ color: VERDE }} role="status">
        <Check className="w-4 h-4" aria-hidden="true" />
        {estado === 'listo' ? `Listo: si baja, te escribimos a ${email.trim()}.` : 'Te avisamos por mail si baja.'}
      </p>
    )
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => {
          setAbierto(true)
          window.setTimeout(() => inputRef.current?.focus(), 50)
        }}
        className="mt-3 inline-flex items-center gap-2 h-10 px-4 rounded-full border text-[15px] font-semibold transition-colors hover:bg-[#EAF3EE]"
        style={{ borderColor: VERDE, color: VERDE, fontFamily: "'Raleway', system-ui, sans-serif" }}
      >
        <Bell className="w-4 h-4" aria-hidden="true" /> Avisame si baja
      </button>
    )
  }

  return (
    <form onSubmit={enviar} noValidate className="mt-3 max-w-md rounded-2xl bg-[#F6F8F6] p-3.5">
      <p className="text-[15px] font-semibold text-gray-900">Te avisamos por mail si baja de precio.</p>
      <div className="mt-2.5 flex gap-2">
        <label htmlFor={`avisame-${propertyId}`} className="sr-only">
          Tu mail
        </label>
        <input
          id={`avisame-${propertyId}`}
          ref={inputRef}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError(null)
          }}
          placeholder="martina@gmail.com"
          className="min-w-0 flex-1 h-11 rounded-xl border border-gray-200 bg-white px-3 text-[16px] outline-none focus:ring-2 focus:ring-[#1A5C38]"
        />
        <button type="submit" disabled={estado === 'enviando'} className="flex-none h-11 px-4 rounded-xl text-white font-bold disabled:opacity-70" style={{ background: VERDE }}>
          {estado === 'enviando' ? 'Anotando…' : 'Avisame'}
        </button>
      </div>
      {error && (
        <p className="text-sm text-[#E0245E] mt-2" role="alert">
          {error}
        </p>
      )}
      <p className="text-[13px] text-gray-500 mt-2">Y de vez en cuando, propiedades parecidas. Te das de baja cuando quieras.</p>
    </form>
  )
}
