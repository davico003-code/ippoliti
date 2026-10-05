'use client'

import { useEffect, useState } from 'react'
import { type CriteriosBusqueda, esEmail, escribirContacto, leerContacto, textoBusqueda } from '@/lib/feed-en-red'
import { trackEvent, trackFbEvent } from '@/lib/analytics'
import { listaBarrios } from '@/lib/barrios-parecidos'
import { suscribirMail } from '@/lib/mazo-consulta'
import { contarTinder, type OrigenTinder } from '@/lib/tinder-contador'
import { VERDE } from './marca-mazo'

const MOTIVOS = ['Más económicas', 'Más grandes', 'Otra zona', 'Otro tipo de propiedad', 'Solo estaba mirando'] as const

/**
 * El RESCATE (David, 3-oct: "si pone no me gusta, tratar de rescatarlo… un
 * feedback rápido para no perder ese cliente"). No en cada ✕ (cansa): cuando
 * pasa 4 seguidas sin ningún ♥, cuando se va sin guardar ninguna o cuando
 * termina el mazo sin guardar. Un toque para decir qué busca y, si quiere, su
 * WhatsApp para avisarle cuando entre algo así (entra a Hilo por turno). Sin
 * WhatsApp, lo que eligió igual se guarda (anónimo).
 */
export default function Rescate({
  origen,
  momento,
  barrio,
  busqueda = null,
  criterios = null,
  vistas,
  parecidos = [],
  onVerParecidos,
  onListo,
  onSecundario,
}: {
  origen: OrigenTinder
  momento: 'mazo' | 'salir' | 'fin'
  barrio: string | null
  busqueda?: string | null
  /** Con la búsqueda, el campo acepta también un mail (David 4-oct): queda suscripto a las nuevas. */
  criterios?: CriteriosBusqueda | null
  vistas: number
  /** Barrios parecidos al que mira (barrios-parecidos.ts). */
  parecidos?: string[]
  /**
   * Con "Otra zona" marcado, ofrece verlos ahí mismo (David 4-oct). Devuelve
   * false si no había ninguna. Sin esto (ya se le preguntó), no se ofrece.
   */
  onVerParecidos?: () => Promise<boolean>
  /** Ya contestó (con o sin WhatsApp). */
  onListo: () => void
  /** "Seguir mirando" / "No, gracias" / "Verlas de nuevo". */
  onSecundario: () => void
}) {
  const [motivos, setMotivos] = useState<string[]>([])
  // WhatsApp o mail (con un "@" es mail: queda suscripto a las nuevas de su búsqueda).
  const [whatsapp, setWhatsapp] = useState('')
  const [porMail, setPorMail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState(false)
  const [parecidasEstado, setParecidasEstado] = useState<'idle' | 'cargando' | 'vacio'>('idle')
  const ofrecerParecidos = !!onVerParecidos && parecidos.length > 0 && motivos.includes('Otra zona')

  const verParecidas = async () => {
    if (!onVerParecidos || parecidasEstado === 'cargando') return
    // Lo que marcó igual le sirve al equipo (anónimo, como "Seguir mirando").
    void fetch('/api/feed-en-red/consulta', { method: 'POST', headers: { 'content-type': 'application/json' }, body: cuerpo(false), keepalive: true }).catch(() => {})
    setParecidasEstado('cargando')
    const ok = await onVerParecidos().catch(() => false)
    if (!ok) setParecidasEstado('vacio')
  }

  useEffect(() => {
    const c = leerContacto()
    setWhatsapp(c.whatsapp || (criterios ? c.email : ''))
    trackEvent('feed_en_red_rescate', { momento })
    // Solo al montar (el criterio no cambia mientras está abierto).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [momento])

  const titulo = momento === 'mazo' ? '¿No es lo que buscás?' : momento === 'salir' ? '¿Te vas sin guardar ninguna?' : '¿No encontraste lo que buscabas?'
  const bajada =
    momento === 'mazo'
      ? 'Contanos en un toque qué buscás y te ayudamos a encontrarla.'
      : 'Contanos qué buscás y te avisamos cuando entre algo así.'
  const secundario = momento === 'mazo' ? 'Seguir mirando' : momento === 'salir' ? 'No, gracias' : 'Verlas de nuevo'

  const cuerpo = (conWhatsapp: boolean) =>
    JSON.stringify({
      tipo: conWhatsapp ? 'busca' : 'feedback',
      // Si ya lo dejó antes en este navegador, el asesor sabe cómo llamarlo.
      nombre: conWhatsapp ? leerContacto().nombre : '',
      whatsapp: conWhatsapp ? whatsapp : '',
      motivos,
      barrio,
      busqueda,
      vistas,
      pageUrl: window.location.href,
    })

  const enviar = async (conWhatsapp: boolean) => {
    if (enviando) return
    const dato = whatsapp.trim()
    if (conWhatsapp && criterios && dato.includes('@')) {
      if (!esEmail(dato)) return setError('Revisá el mail.')
      setError(null)
      setEnviando(true)
      // Lo que marcó igual le sirve al equipo (anónimo).
      if (motivos.length) {
        void fetch('/api/feed-en-red/consulta', { method: 'POST', headers: { 'content-type': 'application/json' }, body: cuerpo(false), keepalive: true }).catch(() => {})
      }
      const ok = await suscribirMail(dato, criterios, motivos)
      setEnviando(false)
      if (!ok) return setError('No pudimos anotarte. Probá de nuevo.')
      trackEvent('mazo_suscripcion_mail', { donde: `rescate_${momento}` })
      contarTinder('busca', origen)
      setPorMail(dato)
      setListo(true)
      return
    }
    if (conWhatsapp && whatsapp.replace(/\D/g, '').length < 10) {
      return setError(criterios ? 'Dejá tu WhatsApp con característica (341 555 1234) o tu mail.' : 'Dejá tu WhatsApp con característica, por ejemplo 341 555 1234.')
    }
    setError(null)
    setEnviando(true)
    try {
      const res = await fetch('/api/feed-en-red/consulta', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: cuerpo(conWhatsapp),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(typeof data.error === 'string' ? data.error : 'No pudimos enviarlo. Probá de nuevo.')
      }
      if (conWhatsapp) {
        escribirContacto({ nombre: leerContacto().nombre, whatsapp })
        trackFbEvent('Lead', { content_name: 'feed_en_red_rescate' })
        contarTinder('busca', origen)
        setListo(true)
      } else {
        onListo()
      }
    } catch (err) {
      if (conWhatsapp) setError(err instanceof Error ? err.message : 'No pudimos enviarlo. Probá de nuevo.')
      else onListo()
    } finally {
      setEnviando(false)
    }
  }

  if (listo) {
    return (
      <div className="text-center py-3">
        <div className="text-4xl" style={{ color: VERDE }} aria-hidden="true">
          ✓
        </div>
        <h3 className="text-lg font-black text-gray-900 mt-1 font-raleway">Listo</h3>
        <p className="text-sm text-gray-600 mt-1">
          {porMail ? `Te escribimos a ${porMail} cuando entren ${textoBusqueda(criterios)}.` : 'Un asesor de SI te escribe por WhatsApp apenas tengamos algo así.'}
        </p>
        <button type="button" onClick={onListo} className="mt-4 w-full h-12 rounded-2xl text-white font-bold" style={{ background: VERDE }}>
          {momento === 'mazo' ? 'Seguir mirando' : 'Cerrar'}
        </button>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-black text-gray-900 font-raleway [text-wrap:balance]">{titulo}</h3>
      <p className="text-[14px] leading-relaxed text-gray-600 mt-1 mb-3.5">{bajada}</p>
      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Qué buscás">
        {MOTIVOS.map((m) => {
          const on = motivos.includes(m)
          return (
            <button
              key={m}
              type="button"
              aria-pressed={on}
              onClick={() => setMotivos((xs) => (on ? xs.filter((x) => x !== m) : [...xs, m]))}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition-colors ${on ? 'text-white border-transparent' : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'}`}
              style={on ? { background: VERDE } : undefined}
            >
              {m}
            </button>
          )
        })}
      </div>
      {ofrecerParecidos && (
        <div className="mb-4 rounded-2xl p-3.5" style={{ background: '#EAF3EE' }}>
          <p className="text-[16px] font-bold text-gray-900">¿Te muestro casas en barrios parecidos?</p>
          <p className="text-[15px] text-gray-700 mt-0.5">{listaBarrios(parecidos)}</p>
          {parecidasEstado === 'vacio' ? (
            <p className="text-[15px] text-gray-700 mt-2">Por ahora no hay otras en esos barrios con lo que buscás.</p>
          ) : (
            <button
              type="button"
              onClick={() => void verParecidas()}
              disabled={parecidasEstado === 'cargando'}
              className="mt-2.5 w-full h-11 rounded-xl text-white font-bold disabled:opacity-70"
              style={{ background: VERDE }}
            >
              {parecidasEstado === 'cargando' ? 'Buscando…' : 'Sí, mostrame'}
            </button>
          )}
        </div>
      )}
      <label htmlFor={`rescate-wsp-${momento}`} className="block text-sm font-semibold text-gray-800 mb-1">
        {criterios ? 'Tu WhatsApp o tu mail, si querés que te avisemos' : 'Tu WhatsApp, si querés que te avisemos'}
      </label>
      <input
        id={`rescate-wsp-${momento}`}
        type={criterios ? 'text' : 'tel'}
        inputMode={criterios ? 'text' : 'tel'}
        value={whatsapp}
        onChange={(e) => {
          setWhatsapp(e.target.value)
          setError(null)
        }}
        autoComplete={criterios ? 'on' : 'tel'}
        autoCapitalize="none"
        placeholder={criterios ? '341 555 1234 o martina@gmail.com' : '341 555 1234'}
        className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[16px] mb-2 outline-none focus:ring-2 focus:ring-[#1A5C38]"
      />
      {error && (
        <p className="text-sm text-[#E0245E] mb-2" role="alert">
          {error}
        </p>
      )}
      <button type="button" disabled={enviando} onClick={() => void enviar(true)} className="w-full h-12 rounded-2xl text-white font-bold mt-1 disabled:opacity-70" style={{ background: VERDE }}>
        {enviando ? 'Enviando…' : 'Avisame cuando entre algo así'}
      </button>
      <button
        type="button"
        disabled={enviando}
        onClick={() => {
          // Sin WhatsApp: lo que eligió igual sirve (anónimo, sin esperar la respuesta).
          if (motivos.length) {
            void fetch('/api/feed-en-red/consulta', { method: 'POST', headers: { 'content-type': 'application/json' }, body: cuerpo(false), keepalive: true }).catch(() => {})
          }
          onSecundario()
        }}
        className="block mx-auto mt-3 text-sm text-gray-500"
      >
        {secundario}
      </button>
    </div>
  )
}
