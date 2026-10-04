'use client'

// Feed tipo Instagram debajo de la ficha (David, 3-oct-2026, maqueta aprobada).
// En la ficha: una fila de tarjetas "En red" de la zona. Al tocar, se abre el
// feed a pantalla completa: primero las nuestras parecidas (sello verde) y
// después las de otras inmobiliarias ("En red", dicho abiertamente). La
// persona desliza fotos, da ♥ y sigue bajando. Al tocar la X para salir, si
// guardó alguna, aparece la hoja para dejar nombre y WhatsApp: la consulta
// entra a Hilo con todo lo que marcó. Nunca se traba el "atrás" del celular.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import {
  type TokkoProperty,
  formatPrice,
  generatePropertySlug,
  getAllPhotos,
  getMainPhoto,
  getTotalSurface,
  tituloVisible,
  translatePropertyType,
} from '@/lib/tokko'
import {
  type FeedEnRed as DatosFeed,
  type GuardadaLocal,
  type ItemFeed,
  escribirContacto,
  escribirGuardadas,
  itemDeEnRed,
  leerContacto,
  leerGuardadas,
  pluralTipo,
} from '@/lib/feed-en-red'
import { trackEvent, trackFbEvent } from '@/lib/analytics'

const VERDE = '#1A5C38'
const OCRE_FONDO = '#F4EAD8'
const OCRE_TEXTO = '#7A5212'

function itemDeNuestra(p: TokkoProperty): ItemFeed {
  const fotos = getAllPhotos(p)
  const principal = getMainPhoto(p)
  const beds = p.suite_amount || p.room_amount || 0
  const baths = p.bathroom_amount || 0
  const m2 = getTotalSurface(p)
  return {
    key: `n:${p.id}`,
    esNuestra: true,
    fotos: fotos.length ? fotos : principal ? [principal] : [],
    precio: formatPrice(p),
    datos: [
      translatePropertyType(p.type?.name),
      beds ? `${beds} dorm` : null,
      baths ? `${baths} baño${baths > 1 ? 's' : ''}` : null,
      m2 ? `${Math.round(m2).toLocaleString('es-AR')} m²` : null,
    ]
      .filter(Boolean)
      .join(' · '),
    titulo: tituloVisible(p) || p.fake_address || p.address || '',
    zona: p.location?.name ?? null,
    href: `/propiedades/${generatePropertySlug(p)}`,
    masVista: false,
  }
}

function Sello() {
  return (
    <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" role="img" aria-label="Verificada">
      <polygon
        fill={VERDE}
        points="24,12 22,14.7 22.4,18 19.4,19.4 18,22.4 14.7,22 12,24 9.3,22 6,22.4 4.6,19.4 1.6,18 2,14.7 0,12 2,9.3 1.6,6 4.6,4.6 6,1.6 9.3,2 12,0 14.7,2 18,1.6 19.4,4.6 22.4,6 22,9.3"
      />
      <path d="M7.2 12.4l3.1 3.1 6.5-6.6" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconoRed() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="5" cy="12" r="2.5" />
      <circle cx="19" cy="6" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <path d="M7.3 10.9l9.4-3.8M7.3 13.1l9.4 3.8" />
    </svg>
  )
}

function Corazon({ lleno, className = 'w-7 h-7' }: { lleno: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.4-9.3-9A5 5 0 0 1 12 6.6a5 5 0 0 1 9.3 4.9c-1.8 4.6-9.3 9-9.3 9z"
        fill={lleno ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Chip({ nuestra }: { nuestra: boolean }) {
  return nuestra ? (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white font-raleway" style={{ background: VERDE }}>
      SI
    </span>
  ) : (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold font-raleway" style={{ background: OCRE_FONDO, color: OCRE_TEXTO }}>
      En red
    </span>
  )
}

/** Fotos que se deslizan de costado; doble toque = ♥, como en Instagram. */
function Carrusel({ item, onDobleToque }: { item: ItemFeed; onDobleToque: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [actual, setActual] = useState(0)
  const [corazon, setCorazon] = useState(false)
  const ultimoToque = useRef(0)
  const onScroll = useCallback(() => {
    const el = ref.current
    if (el) setActual(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)))
  }, [])
  const onClick = () => {
    const ahora = Date.now()
    if (ahora - ultimoToque.current < 320) {
      onDobleToque()
      setCorazon(true)
      window.setTimeout(() => setCorazon(false), 700)
      ultimoToque.current = 0
    } else {
      ultimoToque.current = ahora
    }
  }
  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={onScroll}
        onClick={onClick}
        className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {item.fotos.map((src, i) => (
          <div key={src + i} className="relative w-full flex-none snap-center aspect-[4/3] bg-gray-100">
            <Image src={src} alt={`${item.titulo} — foto ${i + 1}`} fill sizes="(max-width: 480px) 100vw, 430px" className="object-cover" loading="lazy" />
          </div>
        ))}
      </div>
      {corazon && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-white drop-shadow-lg animate-feed-pop motion-reduce:animate-none">
          <Corazon lleno className="w-24 h-24" />
        </div>
      )}
      {item.fotos.length > 1 && (
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/55 text-white text-[11px] font-numeric">
          {actual + 1}/{item.fotos.length}
        </div>
      )}
    </div>
  )
}

function Publicacion({
  item,
  guardada,
  onToggle,
}: {
  item: ItemFeed
  guardada: boolean
  onToggle: () => void
}) {
  return (
    <article id={`feed-${item.key}`} className="border-t border-gray-100 pt-3 pb-4 scroll-mt-2">
      <div className="flex items-center gap-2.5 px-3.5 pb-2.5">
        {item.esNuestra ? (
          <div className="w-9 h-9 rounded-full grid place-items-center flex-none bg-[#E3F0E8]">
            <Image src="/brand/si-isotipo.svg" alt="SI Inmobiliaria" width={24} height={18} />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full grid place-items-center flex-none" style={{ background: OCRE_FONDO, color: OCRE_TEXTO }}>
            <IconoRed />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 font-raleway">
            {item.esNuestra ? (
              <>
                SI Inmobiliaria <Sello />
              </>
            ) : (
              'Trabajamos en red'
            )}
          </div>
          {item.zona && <div className="text-xs text-gray-500 truncate">{item.zona}</div>}
        </div>
        <div className="ml-auto">
          <Chip nuestra={item.esNuestra} />
        </div>
      </div>
      <Carrusel item={item} onDobleToque={() => !guardada && onToggle()} />
      <div className="flex items-center justify-between px-2.5 pt-2">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={guardada}
          aria-label={guardada ? 'Quitar de guardadas' : 'Me gusta'}
          className={`p-1.5 rounded-full transition-transform active:scale-90 ${guardada ? 'text-[#E0245E]' : 'text-gray-900'}`}
        >
          <Corazon lleno={guardada} />
        </button>
        {item.href && (
          <Link href={item.href} className="text-xs font-semibold font-raleway px-2" style={{ color: VERDE }}>
            Ver ficha completa
          </Link>
        )}
      </div>
      <div className="px-3.5">
        <p className="text-lg font-black text-gray-900 font-numeric leading-tight">{item.precio}</p>
        {item.datos && <p className="text-[13px] text-gray-600 font-poppins mt-0.5">{item.datos}</p>}
        {item.masVista && (
          <p className="text-xs font-semibold mt-1.5" style={{ color: OCRE_TEXTO }}>
            De las más vistas de la zona
          </p>
        )}
      </div>
    </article>
  )
}

type EstadoHoja = { motivo: 'salir' | 'boton' } | null

export default function FeedEnRed({ property, nuestras }: { property: TokkoProperty; nuestras: TokkoProperty[] }) {
  const [datos, setDatos] = useState<DatosFeed | null>(null)
  const [abierto, setAbierto] = useState(false)
  const [inicio, setInicio] = useState<string | null>(null)
  const [guardadas, setGuardadas] = useState<GuardadaLocal[]>([])
  const [hoja, setHoja] = useState<EstadoHoja>(null)
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    setMontado(true)
    setGuardadas(leerGuardadas())
  }, [])

  useEffect(() => {
    let cancelado = false
    fetch(`/api/propiedades/en-red?id=${property.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: DatosFeed | null) => {
        if (!cancelado && d && Array.isArray(d.tarjetas)) setDatos(d)
      })
      .catch(() => {})
    return () => {
      cancelado = true
    }
  }, [property.id])

  const enRed = useMemo(() => (datos?.tarjetas ?? []).map(itemDeEnRed), [datos])
  const items = useMemo(
    () => [...nuestras.filter((p) => p.id !== property.id).map(itemDeNuestra).filter((i) => i.fotos.length > 0), ...enRed],
    [nuestras, property.id, enRed],
  )
  const barrio = datos?.barrio || property.location?.name || null
  const plural = pluralTipo(translatePropertyType(property.type?.name))
  const titulo = barrio ? `Más ${plural} en ${barrio}` : `Más ${plural} en la zona`

  const esGuardada = useCallback((key: string) => guardadas.some((g) => g.key === key), [guardadas])
  const toggle = useCallback(
    (item: ItemFeed) => {
      const ya = guardadas.some((g) => g.key === item.key)
      const next = ya
        ? guardadas.filter((g) => g.key !== item.key)
        : [...guardadas, { key: item.key, foto: item.fotos[0] ?? null, precio: item.precio, esNuestra: item.esNuestra }].slice(-12)
      setGuardadas(next)
      escribirGuardadas(next)
      if (!ya) trackEvent('feed_en_red_like', { tipo: item.esNuestra ? 'nuestra' : 'en_red' })
    },
    [guardadas],
  )

  const abrir = (key: string | null) => {
    setInicio(key)
    setAbierto(true)
    trackEvent('feed_en_red_abrir', { cantidad: items.length })
  }
  const cerrarTodo = () => {
    setHoja(null)
    setAbierto(false)
  }
  const salir = () => {
    if (guardadas.length > 0) setHoja({ motivo: 'salir' })
    else setAbierto(false)
  }

  // Sin scroll de la página de atrás mientras el feed está abierto; Escape cierra.
  useEffect(() => {
    if (!abierto) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (hoja) setHoja(null)
      else salir()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previo
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, hoja, guardadas.length])

  // Abrir en la tarjeta que tocó.
  useEffect(() => {
    if (!abierto || !inicio) return
    requestAnimationFrame(() => document.getElementById(`feed-${inicio}`)?.scrollIntoView({ block: 'start' }))
  }, [abierto, inicio])

  if (enRed.length === 0) return null

  return (
    <>
      <section className="mt-4 bg-white rounded-2xl px-5 md:px-8 pt-6 pb-6 shadow-sm border border-gray-100" aria-labelledby="feed-en-red-titulo">
        <h2 id="feed-en-red-titulo" className="text-2xl font-black text-gray-900 [text-wrap:balance]">
          {titulo}
        </h2>
        <p className="text-sm text-gray-600 mt-1 mb-4 max-w-2xl">
          Algunas las publican otras inmobiliarias. Te las mostramos y te coordinamos la visita nosotros.
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x [scrollbar-width:thin]">
          {enRed.map((it) => (
            <button
              key={it.key}
              type="button"
              onClick={() => abrir(it.key)}
              className="group relative flex-none w-44 sm:w-52 snap-start text-left rounded-xl overflow-hidden border border-gray-100 bg-white hover:ring-2 hover:ring-[#1A5C38] focus-visible:ring-2 focus-visible:ring-[#1A5C38] outline-none"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                <Image src={it.fotos[0]} alt={it.titulo} fill sizes="208px" className="object-cover" />
                <div className="absolute top-2 left-2">
                  <Chip nuestra={false} />
                </div>
                {montado && esGuardada(it.key) && (
                  <div className="absolute top-2 right-2 text-[#E0245E] drop-shadow">
                    <Corazon lleno className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="font-black text-gray-900 font-numeric leading-tight">{it.precio}</p>
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{it.datos}</p>
              </div>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => abrir(null)}
          className="mt-3 w-full sm:w-auto px-5 py-3 rounded-xl text-white font-bold font-raleway text-sm"
          style={{ background: VERDE }}
        >
          Ver las {items.length} y guardar las que te gusten
        </button>
      </section>

      {montado &&
        abierto &&
        createPortal(
          <div className="fixed inset-0 z-[10400] bg-black/50 md:flex md:items-center md:justify-center" role="dialog" aria-modal="true" aria-label={titulo}>
            <div className="relative flex flex-col h-[100dvh] w-full bg-white md:h-[92vh] md:max-w-[440px] md:rounded-3xl overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-[max(14px,env(safe-area-inset-top))] pb-2.5">
                <div className="min-w-0">
                  <p className="font-black text-gray-900 font-raleway truncate">{titulo}</p>
                  <p className="text-xs text-gray-500">
                    {items.length} para mirar · {guardadas.length > 0 ? `${guardadas.length} guardada${guardadas.length > 1 ? 's' : ''}` : 'tocá ♥ en las que te gusten'}
                  </p>
                </div>
                <button type="button" onClick={salir} aria-label="Salir" className="w-10 h-10 rounded-full border border-gray-200 grid place-items-center flex-none text-gray-800 hover:bg-gray-50">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mx-4 mb-2.5 rounded-xl bg-gray-50 px-3 py-2.5 text-xs leading-relaxed text-gray-600">
                <strong className="text-gray-900">Algunas las publican otras inmobiliarias.</strong> Te las mostramos y te coordinamos la visita nosotros.
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain pb-24">
                {items.map((it) => (
                  <Publicacion key={it.key} item={it} guardada={esGuardada(it.key)} onToggle={() => toggle(it)} />
                ))}
                <p className="text-center text-sm text-gray-500 px-6 py-8">
                  Esas son todas por ahora.{guardadas.length > 0 ? ' Tocá “Que me contacten” y un asesor te escribe.' : ''}
                </p>
              </div>
              {guardadas.length > 0 && (
                <div className="absolute left-3 right-3 bottom-[max(12px,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 rounded-2xl bg-gray-900 text-white pl-4 pr-2 py-2">
                  <span className="text-sm font-semibold flex items-center gap-1.5">
                    <Corazon lleno className="w-4 h-4 text-[#FF4D7D]" /> {guardadas.length} guardada{guardadas.length > 1 ? 's' : ''}
                  </span>
                  <button type="button" onClick={() => setHoja({ motivo: 'boton' })} className="rounded-xl px-3.5 py-2 text-sm font-bold" style={{ background: VERDE }}>
                    Que me contacten
                  </button>
                </div>
              )}
              {hoja && (
                <HojaContacto
                  guardadas={guardadas}
                  barrio={barrio}
                  onCancelar={() => (hoja.motivo === 'salir' ? cerrarTodo() : setHoja(null))}
                  onListo={() => {
                    setGuardadas([])
                    escribirGuardadas([])
                  }}
                  onCerrar={cerrarTodo}
                />
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

function HojaContacto({
  guardadas,
  barrio,
  onCancelar,
  onListo,
  onCerrar,
}: {
  guardadas: GuardadaLocal[]
  barrio: string | null
  onCancelar: () => void
  onListo: () => void
  onCerrar: () => void
}) {
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState<string | null>(null)
  const nombreRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const c = leerContacto()
    setNombre(c.nombre)
    setWhatsapp(c.whatsapp)
    window.setTimeout(() => nombreRef.current?.focus(), 60)
  }, [])

  const n = guardadas.length
  const nuestras = guardadas.filter((g) => g.esNuestra).length
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
    const nom = nombre.trim()
    if (nom.length < 2) return setError('Poné tu nombre así el asesor sabe cómo llamarte.')
    if (whatsapp.replace(/\D/g, '').length < 10) return setError('Revisá el WhatsApp: con característica, por ejemplo 341 555 1234.')
    setError(null)
    setEnviando(true)
    try {
      const res = await fetch('/api/feed-en-red/consulta', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nombre: nom, whatsapp, guardadas: guardadas.map((g) => g.key), barrio, pageUrl: window.location.href }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'No pudimos enviarlo. Probá de nuevo.')
      escribirContacto({ nombre: nom, whatsapp })
      trackEvent('feed_en_red_consulta', { cantidad: n, en_red: red })
      trackFbEvent('Lead', { content_name: 'feed_en_red', content_ids: guardadas.filter((g) => g.esNuestra).map((g) => g.key.slice(2)) })
      setListo(nom.split(/\s+/)[0])
      onListo()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos enviarlo. Probá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="absolute inset-0 z-10 bg-black/55 flex items-end" onClick={(e) => e.target === e.currentTarget && onCancelar()}>
      <div className="w-full bg-white rounded-t-3xl px-5 pt-4 pb-[max(22px,env(safe-area-inset-bottom))]">
        <div className="w-10 h-1 rounded bg-gray-200 mx-auto mb-4" />
        {listo ? (
          <div className="text-center py-3">
            <div className="text-4xl" style={{ color: VERDE }} aria-hidden="true">
              ✓
            </div>
            <h3 className="text-lg font-black text-gray-900 mt-1 font-raleway">Listo, {listo}</h3>
            <p className="text-sm text-gray-600 mt-1">Un asesor de SI te escribe por WhatsApp con las que guardaste.</p>
            <button type="button" onClick={onCerrar} className="mt-4 w-full h-12 rounded-2xl text-white font-bold" style={{ background: VERDE }}>
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate>
            <div className="flex gap-2 mb-3 overflow-x-auto">
              {guardadas.map((g) =>
                g.foto ? (
                  <div key={g.key} className="relative w-14 h-14 flex-none rounded-xl overflow-hidden bg-gray-100">
                    <Image src={g.foto} alt="" fill sizes="56px" className="object-cover" />
                  </div>
                ) : null,
              )}
            </div>
            <h3 className="text-lg font-black text-gray-900 font-raleway [text-wrap:balance]">
              {n === 1 ? 'Te gustó 1' : `Te gustaron ${n}`}. ¿Te ayudamos?
            </h3>
            <p className="text-[13px] leading-relaxed text-gray-600 mt-1 mb-3.5">{explicacion}</p>
            <label htmlFor="feed-nombre" className="block text-xs font-semibold text-gray-800 mb-1">
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
            <label htmlFor="feed-wsp" className="block text-xs font-semibold text-gray-800 mb-1">
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
              className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[16px] mb-2 outline-none focus:ring-2 focus:ring-[#1A5C38]"
            />
            {error && (
              <p className="text-xs text-[#E0245E] mb-2" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={enviando} className="w-full h-12 rounded-2xl text-white font-bold mt-1 disabled:opacity-70" style={{ background: VERDE }}>
              {enviando ? 'Enviando…' : 'Que me escriba un asesor'}
            </button>
            <button type="button" onClick={onCancelar} className="block mx-auto mt-3 text-sm text-gray-500">
              No, gracias
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
