'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { type GuardadaLocal, type ItemFeed, type PosicionLogo, estiloSinLogo, leerContacto } from '@/lib/feed-en-red'
import { trackEvent } from '@/lib/analytics'
import { mandarConsulta } from '@/lib/mazo-consulta'
import type { OrigenTinder } from '@/lib/tinder-contador'
import { CORAZON, Corazon, IsotipoSI, VERDE } from './marca-mazo'

/**
 * EL MATCH (David 4-oct: "que no termine sin sacarle algún dato o sin que nos
 * consulte por una propiedad o por varias"). Como el "¡Es un match!" de Tinder:
 * al primer ♥ de la visita, al tercero, y al tocar ★ "Quiero verla". Solo si
 * todavía no sabemos su WhatsApp; si ya lo dejó, no se interrumpe nada.
 */
export type EstadoMatch = { modo: 'match' | 'tres' | 'visita'; item: ItemFeed } | null

/** Hasta 3 fotos en abanico, como las cartas de Tinder (match y "No pierdas tus elegidas"). */
export function AbanicoFotos({ fotos }: { fotos: { src: string | null; logo?: PosicionLogo | null }[] }) {
  const tres = fotos.filter((f) => f.src).slice(-3)
  const giros = tres.length === 1 ? [0] : tres.length === 2 ? [-7, 7] : [-10, 0, 10]
  return (
    <div className="relative mx-auto h-[118px] w-[210px]" aria-hidden="true">
      {tres.map((f, i) => (
        <div
          key={`${f.src}-${i}`}
          className="absolute left-1/2 top-1 h-[108px] w-[84px] overflow-hidden rounded-2xl border-[3px] border-white bg-gray-100 shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
          style={{ transform: `translateX(calc(-50% + ${(i - (tres.length - 1) / 2) * 52}px)) rotate(${giros[i]}deg)`, zIndex: i === Math.floor(tres.length / 2) ? 2 : 1 }}
        >
          <Image src={f.src!} alt="" fill sizes="84px" className="object-cover" style={estiloSinLogo(f.logo)} />
        </div>
      ))}
    </div>
  )
}

/**
 * "¡Es un match!" (Tinder): la casa que le gustó + el isotipo de SI, y ahí
 * mismo nombre y WhatsApp. "Seguir mirando" siempre a mano: no es una traba.
 */
export default function MatchMazo({
  estado,
  pendientes,
  barrio,
  busqueda,
  origen,
  onSeguir,
  onEnviado,
}: {
  estado: NonNullable<EstadoMatch>
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
  const { modo, item } = estado
  const keys = Array.from(new Set([item.key, ...pendientes.map((g) => g.key)]))
  const cantidad = keys.length
  const titulo = modo === 'visita' ? '¡Vamos a verla!' : modo === 'tres' ? `¡Ya van ${cantidad}!` : '¡Es un match!'
  const bajada =
    modo === 'visita'
      ? 'Dejanos tu nombre y WhatsApp y un asesor te escribe para coordinar la visita.'
      : modo === 'tres'
        ? `¿Te mandamos las ${cantidad} por WhatsApp? Un asesor te pasa la info de cada una y te coordina las visitas.`
        : 'Te gustó esta casa. Un asesor te pasa toda la info y te coordina la visita.'
  const fotos = modo === 'tres' ? [...pendientes.filter((g) => g.key !== item.key).map((g) => ({ src: g.foto, logo: g.logo })), { src: item.fotos[0] ?? null, logo: item.logo }] : []

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enviando) return
    const nom = nombre.trim()
    if (nom.length < 2) return setError('Poné tu nombre así el asesor sabe cómo llamarte.')
    if (whatsapp.replace(/\D/g, '').length < 10) return setError('Revisá el WhatsApp: con característica, por ejemplo 341 555 1234.')
    setError(null)
    setEnviando(true)
    const r = await mandarConsulta({ nombre: nom, whatsapp, keys, barrio, busqueda, origen, visita: modo === 'visita' })
    setEnviando(false)
    if (!r.ok) return setError(r.error)
    trackEvent('feed_en_red_match_datos', { modo })
    onEnviado()
    setListo(nom.split(/\s+/)[0])
  }

  return (
    <div
      className="absolute inset-0 z-30 overflow-y-auto bg-white"
      style={{ background: 'radial-gradient(120% 60% at 50% 0%, rgba(26,92,56,0.16) 0%, rgba(255,255,255,0) 60%), #fff' }}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      {/* Corazones que suben (como el match de Tinder) */}
      <div className="pointer-events-none absolute inset-x-0 top-[34%] h-0" aria-hidden="true">
        {[12, 28, 46, 64, 80, 90].map((x, i) => (
          <span key={x} className="mazo-corazon-sube absolute" style={{ left: `${x}%`, color: i % 2 ? CORAZON : '#3FA36B', animationDelay: `${i * 0.38}s` }}>
            <Corazon lleno className={i % 3 === 0 ? 'w-5 h-5' : 'w-3.5 h-3.5'} />
          </span>
        ))}
      </div>
      <div className="relative mx-auto flex min-h-full max-w-sm flex-col justify-center px-6 pb-[max(22px,env(safe-area-inset-bottom))] pt-[max(22px,env(safe-area-inset-top))] text-center">
        {listo ? (
          <div className="mazo-entrar">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full text-white" style={{ background: VERDE }} aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
            <p className="mt-4 text-[28px] font-black text-gray-900 font-raleway">¡Listo, {listo}!</p>
            <p className="mt-2 text-[17px] text-gray-700">Un asesor de SI te escribe por WhatsApp. Seguí mirando: si te gusta otra, tocá ♥ arriba y te la sumamos.</p>
            <button type="button" onClick={onSeguir} className="mt-6 h-[52px] w-full rounded-2xl text-[17px] font-bold text-white" style={{ background: VERDE }} autoFocus>
              Seguir mirando
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate>
            <p
              className="mazo-entrar text-[42px] [@media(max-width:400px)]:text-[34px] leading-none font-black italic font-raleway bg-clip-text text-transparent [text-wrap:balance]"
              style={{ backgroundImage: `linear-gradient(90deg, ${VERDE}, #3FA36B)` }}
            >
              {titulo}
            </p>
            {modo === 'tres' ? (
              <div className="mt-5">
                <AbanicoFotos fotos={fotos} />
              </div>
            ) : (
              // La casa y SI, juntas (en Tinder son las dos personas).
              <div className="mazo-entrar mt-5 flex items-center justify-center" aria-hidden="true">
                <div className="relative h-[104px] w-[104px] -rotate-6 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                  {item.fotos[0] && <Image src={item.fotos[0]} alt="" fill sizes="104px" className="object-cover" style={estiloSinLogo(item.logo)} />}
                </div>
                <div className="-ml-5 grid h-[104px] w-[104px] rotate-6 place-items-center rounded-full border-4 border-white bg-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                  <IsotipoSI className="h-11 w-auto" />
                </div>
              </div>
            )}
            <p className="mt-4 text-[17px] leading-snug text-gray-700">{bajada}</p>
            {!item.esNuestra && modo !== 'tres' && (
              <p className="mt-1.5 text-[14px] text-gray-500">La publica otra inmobiliaria de la zona: la visita te la coordinamos nosotros.</p>
            )}
            <div className="mt-5 space-y-2.5 text-left">
              <label htmlFor="match-nombre" className="sr-only">
                Tu nombre
              </label>
              <input
                id="match-nombre"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value)
                  setError(null)
                }}
                autoComplete="name"
                placeholder="Tu nombre"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-[17px] outline-none focus:ring-2 focus:ring-[#1A5C38]"
              />
              <label htmlFor="match-wsp" className="sr-only">
                Tu WhatsApp
              </label>
              <input
                id="match-wsp"
                type="tel"
                inputMode="tel"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value)
                  setError(null)
                }}
                autoComplete="tel"
                placeholder="Tu WhatsApp (341 555 1234)"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-[17px] outline-none focus:ring-2 focus:ring-[#1A5C38]"
              />
            </div>
            {error && (
              <p className="mt-2 text-left text-sm text-[#E0245E]" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={enviando} className="mt-4 h-[52px] w-full rounded-2xl text-[17px] font-bold text-white disabled:opacity-70" style={{ background: VERDE }}>
              {enviando ? 'Enviando…' : modo === 'visita' ? 'Coordinar la visita' : 'Que me escriba un asesor'}
            </button>
            <button type="button" onClick={onSeguir} className="mt-2 h-12 w-full rounded-2xl text-[16px] font-semibold text-gray-600">
              Seguir mirando
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
