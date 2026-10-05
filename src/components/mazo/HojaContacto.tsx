'use client'

// "¿Te ayudamos?" / "¡No pierdas tus elegidas!": nombre y WhatsApp con sus ♥.
// En hoja (al salir o desde ♥ N) o en línea (el final del mazo).

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { type CriteriosBusqueda, type GuardadaLocal, esEmail, estiloSinLogo, leerContacto, textoBusqueda } from '@/lib/feed-en-red'
import { trackEvent } from '@/lib/analytics'
import { contactoListo, mandarConsulta } from '@/lib/mazo-consulta'
import type { OrigenTinder } from '@/lib/tinder-contador'
import { AbanicoFotos } from './MatchMazo'
import { CORAZON, Corazon, VERDE } from './marca-mazo'

export default function HojaContacto({
  origen,
  guardadas,
  enviadas,
  barrio,
  busqueda = null,
  criterios = null,
  onCancelar,
  onListo,
  onCerrar,
  enLinea = false,
  motivo = 'salir',
  textoCancelar = 'No, gracias',
}: {
  origen: OrigenTinder
  guardadas: GuardadaLocal[]
  /** Las que ya tiene un asesor (match o ★): no se vuelven a mandar. */
  enviadas: ReadonlySet<string>
  barrio: string | null
  busqueda?: string | null
  criterios?: CriteriosBusqueda | null
  onCancelar: () => void
  onListo: () => void
  onCerrar: () => void
  /** true = el CTA del final del mazo (sin velo ni hoja que sube). */
  enLinea?: boolean
  /** 'salir' = se va con ♥ sin mandar ("¡No pierdas tus elegidas!"); 'boton' = tocó ♥ N arriba. */
  motivo?: 'salir' | 'boton'
  textoCancelar?: string
}) {
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  // Opcional: con el mail, además de la consulta, recibe las nuevas de su búsqueda.
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState<string | null>(null)
  /** Ya dejó nombre y WhatsApp antes: se muestra "Te las mandamos a …" con un toque (y "Cambiar"). */
  const [conocido, setConocido] = useState(false)
  const nombreRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const c = leerContacto()
    setNombre(c.nombre)
    setWhatsapp(c.whatsapp)
    setEmail(c.email)
    const ya = !!contactoListo()
    setConocido(ya)
    // En el final del mazo no se abre el teclado solo: primero ve sus elegidas.
    if (!enLinea && !ya) window.setTimeout(() => nombreRef.current?.focus(), 60)
  }, [enLinea])

  // Solo las que todavía no tiene un asesor (las del match o ★ ya se mandaron).
  const pendientes = listo ? guardadas : guardadas.filter((g) => !enviadas.has(g.key))
  const n = pendientes.length
  const nuestras = pendientes.filter((g) => g.esNuestra).length
  const red = n - nuestras
  const explicacion =
    red === 0
      ? 'Un asesor de SI te pasa toda la info y te coordina la visita.'
      : `${
          nuestras === 0
            ? red === 1
              ? 'La publica otra inmobiliaria'
              : 'Las publican otras inmobiliarias'
            : `${nuestras === 1 ? 'Una es nuestra' : `${nuestras} son nuestras`} y ${red === 1 ? 'una la publica otra inmobiliaria' : `${red} las publican otras inmobiliarias`}`
        } de la zona. Trabajamos en red: te coordinamos las visitas y te acompañamos en la compra.`

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enviando) return
    const nom = nombre.trim()
    if (nom.length < 2) return setError('Poné tu nombre así el asesor sabe cómo llamarte.')
    if (whatsapp.replace(/\D/g, '').length < 10) return setError('Revisá el WhatsApp: con característica, por ejemplo 341 555 1234.')
    const mail = email.trim()
    if (mail && !esEmail(mail)) return setError('Revisá el mail (o dejalo vacío).')
    setError(null)
    setEnviando(true)
    const r = await mandarConsulta({ nombre: nom, whatsapp, email: mail, criterios, keys: pendientes.map((g) => g.key), barrio, busqueda, origen })
    setEnviando(false)
    if (!r.ok) return setError(r.error)
    if (mail) trackEvent('mazo_suscripcion_mail', { donde: 'formulario' })
    setListo(nom.split(/\s+/)[0])
    onListo()
  }

  const textoCerrar = motivo === 'boton' && !enLinea ? 'Seguir mirando' : 'Cerrar'
  const yaTodas = !listo && n === 0 && guardadas.length > 0

  const contenido = (
    <>
        {listo || yaTodas ? (
          <div className="text-center py-3">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full text-white" style={{ background: VERDE }} aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-gray-900 mt-2 font-raleway">{listo ? `Listo, ${listo}` : 'Ya las tiene un asesor'}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {listo ? 'Un asesor de SI te escribe por WhatsApp con las que guardaste.' : 'Tus elegidas ya se las pasamos: te escribe por WhatsApp. Si te gusta otra, tocá ♥ y te la sumamos.'}
            </p>
            {listo && email.trim() && criterios && <p className="text-sm text-gray-600 mt-1">Y te avisamos por mail cuando entren {textoBusqueda(criterios)}.</p>}
            <button type="button" onClick={onCerrar} className="mt-4 w-full h-12 rounded-2xl text-white font-bold" style={{ background: VERDE }}>
              {textoCerrar}
            </button>
            {enLinea && yaTodas && (
              <button type="button" onClick={onCancelar} className="block mx-auto mt-3 text-sm text-gray-500">
                {textoCancelar}
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={enviar} noValidate>
            {enLinea ? (
              // Final del mazo: las elegidas bien a la vista, con su precio.
              <div className="grid grid-cols-2 gap-2 mb-4">
                {pendientes.map((g) => (
                  <div key={g.key} className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      {g.foto && <Image src={g.foto} alt="" fill sizes="(max-width: 480px) 50vw, 200px" className="object-cover" style={estiloSinLogo(g.logo)} />}
                      <span className="absolute top-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm" style={{ color: CORAZON }}>
                        <Corazon lleno className="w-4 h-4" />
                      </span>
                    </div>
                    <p className="px-2 py-1.5 text-[13px] font-black text-gray-900 font-numeric truncate">{g.precio}</p>
                  </div>
                ))}
              </div>
            ) : (
              // Hoja: sus elegidas en abanico, como cartas de Tinder.
              <div className="mb-3">
                <AbanicoFotos fotos={pendientes.map((g) => ({ src: g.foto, logo: g.logo }))} />
              </div>
            )}
            <h3 className={`text-lg font-black text-gray-900 font-raleway [text-wrap:balance] ${enLinea ? '' : 'text-center'}`}>
              {motivo === 'salir' && !enLinea ? '¡No pierdas tus elegidas!' : `${n === 1 ? 'Te gustó 1' : `Te gustaron ${n}`}. ¿Te ayudamos?`}
            </h3>
            <p className={`text-[14px] leading-relaxed text-gray-600 mt-1 mb-3.5 ${enLinea ? '' : 'text-center'}`}>
              {motivo === 'salir' && !enLinea ? `${n === 1 ? 'Te gustó 1' : `Te gustaron ${n}`}: te ${n === 1 ? 'la' : 'las'} mandamos por WhatsApp. ` : ''}
              {explicacion}
            </p>
            {conocido ? (
              // Ya lo conocemos: un toque.
              <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
                <p className="min-w-0 text-[15px] text-gray-800">
                  <span className="block font-bold truncate">{nombre}</span>
                  <span className="block text-gray-600 truncate">{whatsapp}</span>
                </p>
                <button type="button" onClick={() => setConocido(false)} className="flex-none text-[14px] font-semibold underline underline-offset-2" style={{ color: VERDE }}>
                  Cambiar
                </button>
              </div>
            ) : (
              <>
                <label htmlFor="feed-nombre" className="block text-sm font-semibold text-gray-800 mb-1">
                  Tu nombre
                </label>
                <input
                  id="feed-nombre"
                  ref={nombreRef}
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value)
                    setError(null)
                  }}
                  autoComplete="name"
                  placeholder="Martina"
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[16px] mb-2.5 outline-none focus:ring-2 focus:ring-[#1A5C38]"
                />
                <label htmlFor="feed-wsp" className="block text-sm font-semibold text-gray-800 mb-1">
                  Tu WhatsApp
                </label>
                <input
                  id="feed-wsp"
                  type="tel"
                  inputMode="tel"
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value)
                    setError(null)
                  }}
                  autoComplete="tel"
                  placeholder="341 555 1234"
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[16px] mb-2.5 outline-none focus:ring-2 focus:ring-[#1A5C38]"
                />
                {criterios && (
                  <>
                    <label htmlFor="feed-mail" className="block text-sm font-semibold text-gray-800 mb-1">
                      Tu mail <span className="font-normal text-gray-500">(opcional · te avisamos cuando entren {textoBusqueda(criterios)})</span>
                    </label>
                    <input
                      id="feed-mail"
                      type="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError(null)
                      }}
                      autoComplete="email"
                      placeholder="martina@gmail.com"
                      className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[16px] mb-2 outline-none focus:ring-2 focus:ring-[#1A5C38]"
                    />
                  </>
                )}
              </>
            )}
            {error && (
              <p className="text-sm text-[#E0245E] mb-2" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={enviando} className="w-full h-12 rounded-2xl text-white font-bold mt-1 disabled:opacity-70" style={{ background: VERDE }}>
              {enviando ? 'Enviando…' : conocido ? `Mandámel${n === 1 ? 'a' : 'as'} por WhatsApp` : 'Que me escriba un asesor'}
            </button>
            <button type="button" onClick={onCancelar} className="block mx-auto mt-3 text-sm text-gray-500">
              {motivo === 'boton' && !enLinea ? 'Seguir mirando' : textoCancelar}
            </button>
          </form>
        )}
    </>
  )
  if (enLinea) return <div className="w-full">{contenido}</div>
  return (
    <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex items-end" onClick={(e) => e.target === e.currentTarget && onCancelar()}>
      <div className="w-full max-h-full overflow-y-auto bg-white rounded-t-3xl border-t border-gray-200 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] px-5 pt-4 pb-[max(22px,env(safe-area-inset-bottom))]">
        <div className="w-10 h-1 rounded bg-gray-200 mx-auto mb-4" />
        {contenido}
      </div>
    </div>
  )
}
