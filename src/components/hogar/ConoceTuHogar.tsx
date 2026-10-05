'use client'

// "Conocé tu próximo hogar" (David, 3-oct-2026): la puerta de la home al mazo
// tipo Tinder. Que lo usen pero que no sea lo principal: en la home es un link
// debajo del buscador. 4-oct, "esta pantalla intermedia no me convence": ya no
// es un formulario: un toque abre el mismo mazo de la ficha (MazoCasas),
// nuestras primero y después las "En red". Orden (David, mismo día): buscador
// ARRIBA DE TODO → Casa/Lote/Depto + Precio + Dormitorios + Barrio (opcionales,
// a la vista; Barrio de entrada "me da igual": "hay gente que es indiferente")
// → la CIUDAD (Funes · Roldán · Rosario: 2 de cada 3 consultas son de barrio
// abierto) → los barrios cerrados en una tira aparte, con la foto DEL BARRIO,
// nunca de una casa. Nunca se abre un mazo vacío: sin resultados se ofrece
// cómo ampliar.

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { highlightMatch } from '@/lib/highlight'
import {
  type BarrioHogar,
  type CriteriosBusqueda,
  type ItemFeed,
  type TipoHogar,
  type ZonaHogar,
  TIPOS_HOGAR,
  TOPES_HOGAR,
  DORMS_HOGAR,
  cantidadZona,
  sugerirZonas,
  textoDorm,
  textoTope,
} from '@/lib/feed-en-red'
import { trackEvent } from '@/lib/analytics'
import { Spinner, cls } from '@/components/tasaciones/ui'
import type { BarrioCerrado, CiudadHogar } from '@/lib/hogar-portadas'
import MazoCasas, { CORAZON, SuscripcionMail, useGuardadas } from '@/components/mazo/MazoCasas'
import { cargarCasasDeBarrios } from '@/lib/mazo-parecidos'

const chip = 'si-tap inline-flex h-11 items-center whitespace-nowrap rounded-full border-[1.5px] px-[15px] text-[14.5px] font-semibold transition-colors motion-reduce:transition-none'
const chipOff = `${chip} border-[#E1E6E1] bg-white text-[#3C4A42] hover:border-[#17613C]/50`
const chipOn = `${chip} border-[#17613C] bg-[#17613C] font-bold text-white`

/**
 * Filtro opcional como chip: muestra el valor (o el nombre del filtro, así se
 * lee como filtro) y el select nativo va encima, invisible — en el iPhone abre
 * la ruedita. El chip mide lo que dice, no la opción más larga.
 */
function ChipSelect<V extends string | number>({
  nombre,
  valor,
  textoValor,
  textoCualquiera,
  opciones,
  onChange,
}: {
  nombre: string
  valor: V | null
  textoValor: string | null
  /** La opción "sin filtro" ("Precio: cualquiera", "Barrio: me da igual"). */
  textoCualquiera?: string
  opciones: { v: V; label: string }[]
  onChange: (v: V | null) => void
}) {
  const on = valor != null
  return (
    <label
      className={`${on ? 'border-[#17613C] bg-[#17613C] text-white' : 'border-[#E1E6E1] bg-white text-[#3C4A42]'} relative inline-flex h-10 items-center gap-1 whitespace-nowrap rounded-full border-[1.5px] pl-3.5 pr-2.5 text-[14px] font-semibold focus-within:ring-2 focus-within:ring-[#17613C]/40`}
    >
      {on ? textoValor : nombre}
      <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-4 w-4 ${on ? 'text-white/80' : 'text-[#6B766E]'}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
      <select
        aria-label={nombre}
        value={valor ?? ''}
        onChange={(e) => onChange(opciones.find((o) => String(o.v) === e.target.value)?.v ?? null)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
      >
        <option value="">{textoCualquiera ?? `${nombre}: cualquiera`}</option>
        {opciones.map((o) => (
          <option key={String(o.v)} value={String(o.v)}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/** Tarjeta de ciudad o barrio: foto del LUGAR con el nombre encima; sin foto, verde de marca. */
function TarjetaLugar({
  nombre,
  sub,
  foto,
  label,
  elegido,
  cargando,
  onClick,
  className,
  grande,
  priority,
}: {
  nombre: string
  sub: string | null
  foto: string | null
  label: string
  elegido: boolean
  cargando: boolean
  onClick: () => void
  className: string
  grande?: boolean
  priority?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`si-tap relative overflow-hidden rounded-2xl text-left outline-none focus-visible:ring-[3px] focus-visible:ring-[#17613C] focus-visible:ring-offset-2 ${foto ? 'bg-[#EEF1EE]' : 'bg-[#17613C]'} ${elegido ? 'ring-[3px] ring-[#17613C] ring-offset-2' : ''} ${className}`}
    >
      {foto && <Image src={foto} alt="" fill sizes={grande ? '(max-width: 520px) 50vw, 250px' : '160px'} priority={priority} className="object-cover" />}
      {foto && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/75 via-black/30 to-transparent" />}
      <span className={`absolute inset-x-0 bottom-0 ${grande ? 'px-3.5 pb-3' : 'px-3 pb-2.5'}`}>
        <span className={`block font-poppins font-bold leading-[1.15] tracking-[-0.01em] text-white [text-wrap:balance] ${grande ? 'text-[22px]' : 'text-[14.5px]'}`}>{nombre}</span>
        {sub && <span className="mt-0.5 block text-[12.5px] font-medium text-white/85">{sub}</span>}
      </span>
      {cargando && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/35" role="status" aria-label={`Buscando en ${nombre}`}>
          <Spinner />
        </span>
      )}
    </button>
  )
}

const normal = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

function zonaPorNombre(catalogo: ZonaHogar[], nombre: string | null | undefined): ZonaHogar | null {
  if (!nombre?.trim()) return null
  return catalogo.find((z) => normal(z.nombre) === normal(nombre)) ?? null
}

/** `fallo` = no se pudo buscar (sin señal, servidor caído): no es lo mismo que "no hay". */
type Resultado = { clave: string; items: ItemFeed[]; fallo?: boolean }

export default function ConoceTuHogar({
  catalogo,
  ciudades,
  cerrados,
  zonaInicial,
  tipoInicial,
  topeInicial,
  dormInicial,
  barrioInicial,
}: {
  /** Barrios y ciudades con algo en venta (Hilo). */
  catalogo: ZonaHogar[]
  /** Funes · Roldán · Rosario, con la aérea de la ciudad si la hay. */
  ciudades: CiudadHogar[]
  /** Por tipo: los barrios cerrados con más del tipo, con la foto DEL BARRIO si la hay. */
  cerrados: Record<TipoHogar, BarrioCerrado[]>
  zonaInicial: string | null
  tipoInicial: TipoHogar
  topeInicial: number | null
  dormInicial: number | null
  barrioInicial: BarrioHogar | null
}) {
  const [zona, setZona] = useState<ZonaHogar | null>(() => zonaPorNombre(catalogo, zonaInicial))
  const [tipo, setTipo] = useState<TipoHogar>(tipoInicial)
  const [tope, setTope] = useState<number | null>(topeInicial)
  /** Dormitorios o más (los lotes no tienen). */
  const [dormElegido, setDorm] = useState<number | null>(dormInicial)
  const dorm = tipo === 'lot' ? null : dormElegido
  /** Barrio cerrado/abierto; null = me da igual. Solo cuenta al elegir una ciudad (un barrio ya lo dice). */
  const [barrioElegido, setBarrio] = useState<BarrioHogar | null>(barrioInicial)
  const barrio = zona && !zona.esCiudad ? null : barrioElegido
  const [query, setQuery] = useState('')
  const [sugerencias, setSugerencias] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [abierto, setAbierto] = useState(false)
  /** Tocó un barrio: el mazo abre apenas llegan las casas (con link a un barrio, abre solo). */
  const [abrirAlLlegar, setAbrirAlLlegar] = useState(() => zonaPorNombre(catalogo, zonaInicial) != null)
  /** Sube con "Reintentar" para volver a contar. */
  const [intento, setIntento] = useState(0)
  const sinResultadosRef = useRef<HTMLDivElement>(null)
  const buscadorRef = useRef<HTMLDivElement>(null)
  const guardadasApi = useGuardadas('home')

  const tipoInfo = TIPOS_HOGAR.find((t) => t.id === tipo)!
  const clave = zona ? `${zona.nombre}|${tipo}|${tope ?? ''}|${dorm ?? ''}|${barrio ?? ''}` : null
  const listo = resultado && resultado.clave === clave ? resultado : null
  const fallo = !!listo?.fallo
  const cantidad = listo && !fallo ? listo.items.length : null
  const filtradas = sugerirZonas(catalogo, query, tipo, 7)
  // Escribió algo que no está: se ofrecen las ciudades (nunca queda trabado).
  const sinCoincidencias = query.trim().length >= 3 && filtradas.length === 0
  const ciudadesZona = useMemo(() => ciudades.map((c) => c.zona).filter((z) => cantidadZona(z, tipo) > 0), [ciudades, tipo])
  const ciudadesConFoto = ciudades.filter((c) => c.foto && cantidadZona(c.zona, tipo) > 0)
  const ciudadesSinFoto = ciudades.filter((c) => !c.foto && cantidadZona(c.zona, tipo) > 0)
  const tira = cerrados[tipo] ?? []

  // Lo que eligió queda en la URL: se puede compartir y viaja con la consulta.
  useEffect(() => {
    const p = new URLSearchParams()
    if (zona) p.set('zona', zona.nombre)
    if (tipo !== 'house') p.set('tipo', tipo)
    if (tope) p.set('tope', String(tope))
    if (dorm) p.set('dorm', String(dorm))
    if (barrioElegido) p.set('barrio', barrioElegido)
    const qs = p.toString()
    // `null` y no `window.history.state`: ese trae la marca interna de Next y el
    // router no se enteraba del cambio; al re-renderizar volvía a la URL vieja.
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
  }, [zona, tipo, tope, dorm, barrioElegido])

  // Se cuenta apenas elige (así el botón dice cuántas hay y el mazo abre al toque).
  useEffect(() => {
    if (!zona || !clave) return
    const ctrl = new AbortController()
    const p = new URLSearchParams({ zona: zona.nombre, tipo })
    if (tope) p.set('tope', String(tope))
    if (dorm) p.set('dorm', String(dorm))
    if (barrio) p.set('barrio', barrio)
    fetch(`/api/propiedades/hogar?${p.toString()}`, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d: { items?: ItemFeed[] }) => setResultado({ clave, items: Array.isArray(d.items) ? d.items : [] }))
      .catch((e) => {
        // Sin señal o el servidor no respondió: se ofrece reintentar (antes decía "Todavía no tenemos").
        if (e?.name !== 'AbortError') setResultado({ clave, items: [], fallo: true })
      })
    return () => ctrl.abort()
  }, [zona, tipo, tope, dorm, barrio, clave, intento])

  const reintentar = () => {
    setResultado(null)
    setIntento((i) => i + 1)
  }

  useEffect(() => {
    if (!abrirAlLlegar || !listo || !zona) return
    setAbrirAlLlegar(false)
    if (listo.fallo || listo.items.length === 0) return
    trackEvent('hogar_comenzar', { zona: zona.nombre, tipo, tope: tope ?? 0, dorm: dorm ?? 0, barrio: barrio ?? 'indistinto', cantidad: listo.items.length })
    setAbierto(true)
  }, [abrirAlLlegar, listo, zona, tipo, tope, dorm, barrio])

  // Cerrar las sugerencias al tocar afuera. pointerdown (no mousedown): en el
  // iPhone un toque en una parte "no clickeable" de la página no dispara mousedown.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (buscadorRef.current && !buscadorRef.current.contains(e.target as Node)) setSugerencias(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [])

  // Un toque y arranca: elige y el mazo abre apenas llegan las casas.
  const abrirZona = (z: ZonaHogar) => {
    setZona(z)
    setQuery('')
    setSugerencias(false)
    setAbrirAlLlegar(true)
  }

  // Sin resultados: el aviso con cómo ampliar queda a la vista (puede estar abajo del mosaico).
  useEffect(() => {
    if (cantidad === 0) sinResultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [cantidad])

  const plural = tipoInfo.plural
  const titulo = zona ? `${plural[0].toUpperCase()}${plural.slice(1)} en ${barrio ? `barrio ${barrio} de ` : ''}${zona.nombre}` : ''
  const busqueda = `${plural}${dorm ? ` de ${textoDorm(dorm)}` : ''}${barrio ? ` en barrio ${barrio}` : ''}${tope ? ` hasta ${textoTope(tope)}` : ''}`
  const criterios: CriteriosBusqueda = { zona: zona?.nombre ?? null, tipo, topeUsd: tope, dormMin: dorm, barrio, origen: 'conoce_tu_hogar' }
  const ciudadEntera = zona && !zona.esCiudad && zona.ciudad ? zonaPorNombre(catalogo, zona.ciudad) : null
  const cargandoZona = abrirAlLlegar && !listo ? zona?.nombre : null

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[520px] px-5 pt-3 pb-16">
        <p className={`${cls.lbl} mt-2`}>
          <span style={{ color: CORAZON }} aria-hidden="true">
            ♥
          </span>{' '}
          Conocé tu próximo hogar
        </p>
        <h1 className={`${cls.h1} mt-1.5`}>¿Dónde buscás?</h1>
        {/* Buscador de barrios: arriba de todo (David, 4-oct) */}
        <div ref={buscadorRef} className="relative mt-4">
          <label htmlFor="hogar-zona" className="sr-only">
            Barrio o ciudad
          </label>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8A958D]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            id="hogar-zona"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSugerencias(e.target.value.trim().length >= 2)
            }}
            onFocus={() => query.trim().length >= 2 && setSugerencias(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filtradas[0]) {
                e.preventDefault()
                abrirZona(filtradas[0])
              }
            }}
            placeholder="Escribí un barrio o una ciudad"
            autoComplete="off"
            enterKeyHint="search"
            className="h-12 w-full rounded-2xl border-[1.5px] border-[#E1E6E1] bg-white pl-11 pr-4 text-[16px] font-medium text-[#121A15] outline-none placeholder:text-[#8A958D] focus:border-[#17613C]"
          />
          {sugerencias && (filtradas.length > 0 || sinCoincidencias) && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-[300px] overflow-auto rounded-2xl border border-[#E1E6E1] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              {filtradas.map((z) => {
                const n = cantidadZona(z, tipo)
                return (
                  <button
                    key={`${z.nombre}|${z.ciudad ?? ''}`}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => abrirZona(z)}
                    className="flex w-full items-baseline gap-2 border-b border-[#F3F4F3] px-4 py-3 text-left text-[15px] text-[#121A15] last:border-b-0 hover:bg-[#F6F8F6]"
                  >
                    <span className="flex-1">{highlightMatch(z.nombre, query)}</span>
                    <span className="shrink-0 text-xs text-[#8A958D]">
                      {z.esCiudad ? 'Ciudad' : z.ciudad}
                      {n === 0 && z.casas + z.lotes + z.deptos > 0 ? ` · sin ${plural}` : ''}
                    </span>
                  </button>
                )
              })}
              {sinCoincidencias && (
                <div className="px-4 py-3">
                  <p className="text-[14px] text-[#3C4A42]">
                    No encontramos «{query.trim()}». Buscá en toda la ciudad:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ciudadesZona.map((c) => (
                      <button key={c.nombre} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => abrirZona(c)} className={chipOff}>
                        {c.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Qué + precio + dormitorios + barrio (opcionales, a la vista) */}
        <div role="group" aria-label="Qué buscás" className="mt-3 flex gap-1.5">
          {TIPOS_HOGAR.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tipo === t.id}
              onClick={() => {
                setTipo(t.id)
                // Los topes cambian con el tipo (un lote de 250 mil no es lo mismo que una casa).
                if (t.id !== tipo) setTope(null)
              }}
              className={`${tipo === t.id ? chipOn : chipOff} !h-10 !px-3.5`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <ChipSelect
            nombre="Precio"
            valor={tope}
            textoValor={tope ? `Hasta ${textoTope(tope)}` : null}
            opciones={TOPES_HOGAR[tipo].map((v) => ({ v, label: `Hasta ${textoTope(v)}` }))}
            onChange={setTope}
          />
          {tipo !== 'lot' && (
            <ChipSelect
              nombre="Dormitorios"
              valor={dorm}
              textoValor={dorm ? `${dorm}+ dormitorios` : null}
              opciones={DORMS_HOGAR.map((v) => ({ v, label: textoDorm(v) }))}
              onChange={setDorm}
            />
          )}
          <ChipSelect<BarrioHogar>
            nombre="Barrio"
            valor={barrioElegido}
            textoValor={barrioElegido === 'cerrado' ? 'Barrio cerrado' : barrioElegido === 'abierto' ? 'Barrio abierto' : null}
            textoCualquiera="Barrio: me da igual"
            opciones={[
              { v: 'cerrado', label: 'Barrio cerrado' },
              { v: 'abierto', label: 'Barrio abierto' },
            ]}
            onChange={setBarrio}
          />
        </div>

        {/* Dónde: la ciudad. Un toque y arranca. */}
        <p className={`${cls.lbl} mt-6`}>Elegí dónde</p>
        <div role="list" aria-label="Ciudades" className="mt-2.5 grid grid-cols-2 gap-2.5">
          {ciudadesConFoto.map(({ zona: z, foto }) => (
            <div key={z.nombre} role="listitem">
              <TarjetaLugar
                nombre={z.nombre}
                sub={null}
                foto={foto}
                label={`${plural[0].toUpperCase()}${plural.slice(1)} en ${z.nombre}`}
                elegido={zona?.nombre === z.nombre}
                cargando={cargandoZona === z.nombre}
                onClick={() => abrirZona(z)}
                className="aspect-[4/4.4] w-full"
                grande
                priority
              />
            </div>
          ))}
        </div>
        {ciudadesSinFoto.map(({ zona: z }) => (
          <button
            key={z.nombre}
            type="button"
            onClick={() => abrirZona(z)}
            aria-label={`${plural[0].toUpperCase()}${plural.slice(1)} en ${z.nombre}`}
            className={`si-tap mt-2.5 flex h-14 w-full items-center justify-between rounded-2xl bg-[#EEF4F0] px-4 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-[#17613C] ${zona?.nombre === z.nombre ? 'ring-[3px] ring-[#17613C]' : ''}`}
          >
            <span className="font-poppins text-[18px] font-bold tracking-[-0.01em] text-[#121A15]">{z.nombre}</span>
            {cargandoZona === z.nombre ? (
              <span className="[&>span]:h-5 [&>span]:w-5 [&>span]:border-[#17613C]/30 [&>span]:border-t-[#17613C]">
                <Spinner />
              </span>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-[#17613C]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            )}
          </button>
        ))}

        {/* Barrios cerrados: aparte, en una tira (no es lo que busca la mayoría) */}
        {tira.length > 0 && (
          <>
            <p className={`${cls.lbl} mt-7`}>Barrios cerrados</p>
            <div role="list" aria-label="Barrios cerrados" className="-mx-5 mt-2.5 flex snap-x gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tira.map(({ zona: z, foto, nombre }) => (
                <div key={z.nombre} role="listitem" className="shrink-0 snap-start">
                  <TarjetaLugar
                    nombre={nombre}
                    sub={z.ciudad}
                    foto={foto}
                    label={`${plural[0].toUpperCase()}${plural.slice(1)} en ${nombre}`}
                    elegido={zona?.nombre === z.nombre}
                    cargando={cargandoZona === z.nombre}
                    onClick={() => abrirZona(z)}
                    className="aspect-[4/3.6] w-[150px]"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {zona && fallo && (
          <div className="mt-5 rounded-2xl bg-[#FFF7E8] px-4 py-3.5" role="alert">
            <p className="text-[15px] font-semibold text-[#7A5A16]">No pudimos buscar ahora. Revisá tu conexión y probá de nuevo.</p>
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => {
                  reintentar()
                  setAbrirAlLlegar(true)
                }}
                className={chipOff}
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Sin resultados: nunca un callejón sin salida, se ofrece cómo ampliar. */}
        {zona && cantidad === 0 && (
          <div ref={sinResultadosRef} className="mt-5 rounded-2xl bg-[#F6F8F6] px-4 py-3.5">
            <p className="text-[15px] font-semibold text-[#121A15]">
              Todavía no tenemos {plural}
              {dorm ? ` de ${textoDorm(dorm)}` : ''}
              {barrio ? ` en barrio ${barrio}` : ''} en {zona.nombre}
              {tope ? ` hasta ${textoTope(tope)}` : ''}.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {tope != null && (
                <button
                  type="button"
                  onClick={() => {
                    setTope(null)
                    setAbrirAlLlegar(true)
                  }}
                  className={chipOff}
                >
                  Ver sin tope
                </button>
              )}
              {barrio != null && (
                <button
                  type="button"
                  onClick={() => {
                    setBarrio(null)
                    setAbrirAlLlegar(true)
                  }}
                  className={chipOff}
                >
                  Cerrado o abierto, me da igual
                </button>
              )}
              {dorm != null && (
                <button
                  type="button"
                  onClick={() => {
                    setDorm(null)
                    setAbrirAlLlegar(true)
                  }}
                  className={chipOff}
                >
                  Cualquier cantidad de dormitorios
                </button>
              )}
              {ciudadEntera && (
                <button type="button" onClick={() => abrirZona(ciudadEntera)} className={chipOff}>
                  Ver todo {ciudadEntera.nombre}
                </button>
              )}
            </div>
            {/* O que le avisemos cuando entren (David 4-oct: el mail con la búsqueda ya filtrada). */}
            <div className="mt-3">
              <SuscripcionMail criterios={criterios} origen="home" />
            </div>
          </div>
        )}
      </div>

      {abierto && listo && zona && guardadasApi.montado && (
        <MazoCasas
          items={listo.items}
          titulo={titulo}
          barrio={zona.nombre}
          guardadasApi={guardadasApi}
          origen="home"
          busqueda={busqueda}
          criterios={criterios}
          cargarParecidos={(barrios, yaVistas) => cargarCasasDeBarrios(barrios, tipo, tope, yaVistas, dorm)}
          onCerrar={() => setAbierto(false)}
        />
      )}
    </div>
  )
}
