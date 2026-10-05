'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { type GuardadaLocal, type ItemFeed, estiloSinLogo, leerContacto } from '@/lib/feed-en-red'
import { trackEvent } from '@/lib/analytics'
import { mandarConsulta } from '@/lib/mazo-consulta'
import type { OrigenTinder } from '@/lib/tinder-contador'
import { AZUL_VISITA, VERDE } from './marca-mazo'

/**
 * ★ "QUIERO CONOCERLA" sin su WhatsApp todavía: una hoja blanca, igual a las demás
 * de la web, con la casa, nombre y WhatsApp. Antes era el "¡Es un match!" con
 * corazones (también al 1er y 3er ♥); David 5-oct: "no me gusta lo del match,
 * es muy Tinder" → se fue el match del ♥ y la ★ quedó con esta hoja sobria.
 */
export type EstadoVisita = { item: ItemFeed } | null

export default function HojaVisita({
  estado,
  pendientes,
  barrio,
  busqueda,
  origen,
  onSeguir,
  onEnviado,
}: {
  estado: NonNullable<EstadoVisita>
  /** Sus otras ♥ sin mandar: viajan con esta (la de la ★ va primera). */
  pendientes: GuardadaLocal[]
  barrio: string | null
  busqueda: string | null
  origen: OrigenTinder
  onSeguir: () => void
  onEnviado: () => void
}) {
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState<string | null>(null)
  useEffect(() => {
    const c = leerContacto()
    setNombre(c.nombre)
    setWhatsapp(c.whatsapp)
  }, [])
  const { item } = estado
  const keys = Array.from(new Set([item.key, ...pendientes.map((g) => g.key)]))

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enviando) return
    const nom = nombre.trim()
    if (nom.length < 2) return setError('Poné tu nombre así el asesor sabe cómo llamarte.')
    if (whatsapp.replace(/\D/g, '').length < 10) return setError('Revisá el WhatsApp: con característica, por ejemplo 341 555 1234.')
    setError(null)
    setEnviando(true)
    const r = await mandarConsulta({ nombre: nom, whatsapp, keys, barrio, busqueda, origen, visita: true })
    setEnviando(false)
    if (!r.ok) return setError(r.error)
    trackEvent('feed_en_red_visita_datos', { tipo: item.esNuestra ? 'nuestra' : 'en_red' })
    onEnviado()
    setListo(nom.split(/\s+/)[0])
  }

  return (
    <div className="absolute inset-0 z-30 bg-white/70 backdrop-blur-[2px] flex items-end" onClick={(e) => e.target === e.currentTarget && onSeguir()}>
      <div
        className="w-full max-h-full overflow-y-auto bg-white rounded-t-3xl border-t border-gray-200 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] px-5 pt-4 pb-[max(22px,env(safe-area-inset-bottom))]"
        role="dialog"
        aria-modal="true"
        aria-label="Coordinar la visita"
      >
        <div className="w-10 h-1 rounded bg-gray-200 mx-auto mb-4" />
        {listo ? (
          <div className="text-center py-2">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full text-white" style={{ background: VERDE }} aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-gray-900 mt-2 font-raleway">Listo, {listo}</h3>
            <p className="text-[15px] text-gray-600 mt-1">Un asesor de SI te escribe por WhatsApp para coordinar la visita.</p>
            <button type="button" onClick={onSeguir} className="mt-4 w-full h-12 rounded-2xl text-white font-bold" style={{ background: VERDE }} autoFocus>
              Seguir mirando
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative h-16 w-16 flex-none overflow-hidden rounded-2xl bg-gray-100">
                {item.fotos[0] && <Image src={item.fotos[0]} alt="" fill sizes="64px" className="object-cover" style={estiloSinLogo(item.logo)} />}
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-[14px] font-bold" style={{ color: AZUL_VISITA }}>
                  <Star className="h-4 w-4" fill="currentColor" strokeWidth={1.5} aria-hidden="true" /> Quiero conocerla
                </p>
                <h3 className="text-[19px] font-black leading-tight text-gray-900 font-raleway [text-wrap:balance]">¿Coordinamos la visita?</h3>
              </div>
            </div>
            <p className="text-[15px] leading-relaxed text-gray-600 mb-3">
              Dejanos tu nombre y WhatsApp y un asesor te escribe para coordinarla.
              {!item.esNuestra && ' La publica otra inmobiliaria de la zona: la visita te la coordinamos nosotros.'}
            </p>
            <label htmlFor="visita-nombre" className="sr-only">
              Tu nombre
            </label>
            <input
              id="visita-nombre"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value)
                setError(null)
              }}
              autoComplete="name"
              placeholder="Tu nombre"
              className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[16px] mb-2.5 outline-none focus:ring-2 focus:ring-[#1A5C38]"
            />
            <label htmlFor="visita-wsp" className="sr-only">
              Tu WhatsApp
            </label>
            <input
              id="visita-wsp"
              type="tel"
              inputMode="tel"
              value={whatsapp}
              onChange={(e) => {
                setWhatsapp(e.target.value)
                setError(null)
              }}
              autoComplete="tel"
              placeholder="Tu WhatsApp (341 555 1234)"
              className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[16px] mb-2 outline-none focus:ring-2 focus:ring-[#1A5C38]"
            />
            {error && (
              <p className="text-sm text-[#E0245E] mb-2" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={enviando} className="w-full h-12 rounded-2xl text-white font-bold mt-1 disabled:opacity-70" style={{ background: VERDE }}>
              {enviando ? 'Enviando…' : 'Coordinar la visita'}
            </button>
            <button type="button" onClick={onSeguir} className="block mx-auto mt-3 text-sm text-gray-500">
              Ahora no, sigo mirando
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
