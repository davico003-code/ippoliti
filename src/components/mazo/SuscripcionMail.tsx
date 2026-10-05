'use client'

import { useEffect, useState } from 'react'
import { Mail } from 'lucide-react'
import { type CriteriosBusqueda, esEmail, leerContacto, textoBusqueda } from '@/lib/feed-en-red'
import { trackEvent } from '@/lib/analytics'
import { suscribirMail } from '@/lib/mazo-consulta'
import { contarTinder, type OrigenTinder } from '@/lib/tinder-contador'
import { VERDE } from './marca-mazo'

/**
 * "Recibí las nuevas por mail" (David, 4-oct): deja el mail y su búsqueda ya
 * filtrada (dónde, qué, hasta cuánto) para los envíos. No es una consulta:
 * nadie lo llama; le llegan las nuevas que entren de lo que busca.
 */
export function SuscripcionMail({ criterios, compacta = false, origen }: { criterios: CriteriosBusqueda; compacta?: boolean; origen?: OrigenTinder }) {
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'listo'>('idle')
  const [error, setError] = useState<string | null>(null)
  const buscaTexto = textoBusqueda(criterios)

  useEffect(() => {
    setEmail(leerContacto().email)
  }, [])

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (estado === 'enviando') return
    const mail = email.trim()
    if (!esEmail(mail)) return setError('Revisá el mail, por ejemplo martina@gmail.com.')
    setError(null)
    setEstado('enviando')
    const ok = await suscribirMail(mail, criterios)
    if (!ok) {
      setEstado('idle')
      return setError('No pudimos anotarte. Probá de nuevo.')
    }
    trackEvent('mazo_suscripcion_mail', { donde: compacta ? 'fila_compu' : 'final' })
    if (origen) contarTinder('busca', origen)
    setEstado('listo')
  }

  if (estado === 'listo') {
    return (
      <div className={`rounded-2xl bg-[#EAF3EE] ${compacta ? 'px-4 py-3' : 'p-4'}`} role="status">
        <p className="text-[15px] font-bold text-gray-900">Listo, te anotamos.</p>
        <p className="text-sm text-gray-700 mt-0.5">
          Te escribimos a {email.trim()} cuando entren {buscaTexto}. Te das de baja cuando quieras.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} noValidate className={`rounded-2xl bg-[#F6F8F6] ${compacta ? 'px-4 py-3 md:flex md:items-center md:gap-4' : 'p-4'}`}>
      <div className={compacta ? 'md:flex-1 md:min-w-0' : ''}>
        <p className="flex items-center gap-2 text-[15px] font-bold text-gray-900">
          <Mail className="w-4 h-4 flex-none" style={{ color: VERDE }} aria-hidden="true" />
          Recibí las nuevas por mail
        </p>
        <p className="text-sm text-gray-600 mt-0.5">Te avisamos cuando entren {buscaTexto}.</p>
      </div>
      <div className={`flex gap-2 ${compacta ? 'mt-2.5 md:mt-0 md:w-[420px]' : 'mt-3'}`}>
        <label htmlFor={`suscripcion-mail-${compacta ? 'c' : 'f'}`} className="sr-only">
          Tu mail
        </label>
        <input
          id={`suscripcion-mail-${compacta ? 'c' : 'f'}`}
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
          {estado === 'enviando' ? 'Anotando…' : 'Quiero recibirlas'}
        </button>
      </div>
      {error && (
        <p className="text-sm text-[#E0245E] mt-2" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
