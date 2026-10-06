'use client'

// "Conocé tu próximo hogar" (David, 3-oct-2026): la puerta de la home al mazo
// tipo Tinder. Que lo usen pero que no sea lo principal: en la home es un link
// debajo del buscador.
//
// 4-oct, después de tres vueltas (formulario → mosaico de barrios con fotos →
// ciudades con fotos), David: "me la estoy recomplicando, tiene que ser bien
// sencillo, minimalista, como lo haría un diseñador de Apple; ni siquiera
// fotos". Lo que se aprendió:
//   · Lo escondido no se encuentra: el precio dentro de un menú "Sin tope ▾" no
//     se vio. Todo a la vista, en controles segmentados (como un ajuste del
//     iPhone), con la opción elegida resaltada.
//   · Las fotos no ayudan a elegir: el mazo ya es puro fotos.
//   · Un solo camino: se elige y UN botón abre el mazo, diciendo cuántas hay.
//   · Los datos (90 días de consultas): Funes, Roldán y Rosario son el 99%; el
//     84% busca hasta USD 250 mil; 2 de cada 3, barrio abierto → "Barrio" de
//     entrada "me da igual" ("hay gente que es indiferente").
// El buscador queda arriba de todo (David) para el que ya sabe el barrio.
// Nunca se abre un mazo vacío: sin resultados se ofrece cómo ampliar.
//
// 5-oct, David: "buscar casas cerca tuyo" → "Cerca mío" es una opción más de
// Dónde: pide la ubicación del navegador y el mazo sale de la más cercana a la
// más lejana (nuestras y de colegas mezcladas), con "a 1,2 km" en cada una. El
// punto viaja redondeado a ~100 m y NUNCA va a la URL (no se comparte dónde
// está la persona en un link).

import { type ReactNode, useEffect, useRef, useState } from 'react'
import { highlightMatch } from '@/lib/highlight'
import {
  type BarrioHogar,
  type CriteriosBusqueda,
  type ItemFeed,
  type PuntoCerca,
  type TipoHogar,
  type ZonaHogar,
  TIPOS_HOGAR,
  TOPES_HOGAR,
  cantidadZona,
  sugerirZonas,
  textoDorm,
  textoPrecio,
} from '@/lib/feed-en-red'
import { trackEvent } from '@/lib/analytics'
import { contarTinder, fijarCanalTinder } from '@/lib/tinder-contador'
import { BarraFija, IconoFlecha, Spinner, cls } from '@/components/tasaciones/ui'
import MazoCasas, { SuscripcionMail, useGuardadas } from '@/components/mazo/MazoCasas'
import { cargarCasasDeBarrios } from '@/lib/mazo-parecidos'
import { type FalloUbicacion, pedirUbicacion } from '@/lib/mi-ubicacion'

/** Dónde: las tres que cubren casi todas las consultas, en ese orden. */
const CIUDADES = ['Funes', 'Roldán', 'Rosario']
/** La opción "Cerca mío" de Dónde (y de "Afiná tu búsqueda" adentro del mazo). */
const CERCA_MIO = 'Cerca mío'

/** Última vez que se contó la entrada (el modo estricto de React monta dos veces en desarrollo). */
let pantallaContadaEn = 0

/** Dormitorios a la vista ("N o más"); 1 y 5+ no hacen falta para elegir. */
const DORMS = [2, 3, 4]

const chipSecundario =
  'si-tap inline-flex h-10 items-center whitespace-nowrap rounded-full border-[1.5px] border-[#E1E6E1] bg-white px-4 text-[14.5px] font-semibold text-[#3C4A42] transition-colors hover:border-[#17613C]/50 motion-reduce:transition-none'

const normal = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

function zonaPorNombre(catalogo: ZonaHogar[], nombre: string | null | undefined): ZonaHogar | null {
  if (!nombre?.trim()) return null
  return catalogo.find((z) => normal(z.nombre) === normal(nombre)) ?? null
}

/**
 * Control segmentado, como en el iPhone: todas las opciones a la vista, la
 * elegida en blanco sobre gris. Es un grupo de radios (teclado y lector de
 * pantalla lo leen como "una de N").
 */
function Segmentos<V extends string | number | null>({
  etiqueta,
  opciones,
  valor,
  onChange,
  resaltar,
}: {
  etiqueta: string
  opciones: { v: V; label: ReactNode }[]
  valor: V
  onChange: (v: V) => void
  /** Marca la fila cuando tocó "Ver" sin elegirla (sin carteles de error). */
  resaltar?: boolean
}) {
  const id = `seg-${normal(etiqueta).replace(/[^a-z]+/g, '-')}`
  return (
    <div className="mt-5">
      <p id={id} className={`${cls.lbl} transition-colors ${resaltar ? '!text-[#17613C]' : ''}`}>
        {etiqueta}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={id}
        className={`mt-2 flex gap-1 rounded-[14px] bg-[#F1F3F1] p-1 transition-shadow ${resaltar ? 'shadow-[0_0_0_2px_#17613C]' : ''}`}
      >
        {opciones.map((o) => {
          const on = o.v === valor
          return (
            <button
              key={String(o.v)}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.v)}
              className={`si-tap h-11 min-w-0 flex-1 truncate rounded-[11px] px-1 text-[15px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#17613C] motion-reduce:transition-none ${
                on ? 'bg-white text-[#121A15] shadow-[0_1px_3px_rgba(18,26,21,0.14)]' : 'text-[#5B665F] hover:text-[#121A15]'
              }`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * `fallo` = no se pudo buscar (sin señal, servidor caído): no es lo mismo que "no hay".
 * `ciudad`: en "Cerca mío", la de la más cercana (va como su zona en la consulta y el mail).
 */
type Resultado = { clave: string; items: ItemFeed[]; fallo?: boolean; ciudad?: string | null }

function IconoUbicacion() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-1 inline-block h-[15px] w-[15px] -translate-y-px" fill="currentColor">
      <path d="M21.2 2.8a1 1 0 0 0-1.06-.23l-16.5 6.6a1 1 0 0 0 .1 1.9l6.9 1.6 1.6 6.9a1 1 0 0 0 1.9.1l6.6-16.5a1 1 0 0 0-.23-1.07Z" />
    </svg>
  )
}

export default function ConoceTuHogar({
  catalogo,
  zonaInicial,
  tipoInicial,
  topeInicial,
  dormInicial,
  barrioInicial,
  cliente = null,
  desdePauta = false,
  abrirAlCargar = false,
}: {
  /** Barrios y ciudades con algo en venta (Hilo). */
  catalogo: ZonaHogar[]
  zonaInicial: string | null
  tipoInicial: TipoHogar
  topeInicial: number | null
  dormInicial: number | null
  barrioInicial: BarrioHogar | null
  /** El link que le mandó su asesor (?s=): lo que marque va a SU selección (David 5-oct). */
  cliente?: { token: string; nombre: string | null; asesor: string | null; soloMirar: boolean } | null
  /** Llegó desde un anuncio: el contador lo cuenta aparte. */
  desdePauta?: boolean
  /** ?abrir=1 (links de la pauta): el mazo abre apenas cuenta, sin un toque más. */
  abrirAlCargar?: boolean
}) {
  const [zona, setZona] = useState<ZonaHogar | null>(() => zonaPorNombre(catalogo, zonaInicial))
  /** "Cerca mío": dónde está (redondeado a ~100 m). Excluye a `zona`. */
  const [cerca, setCerca] = useState<PuntoCerca | null>(null)
  const [ubicacion, setUbicacion] = useState<'buscando' | FalloUbicacion | null>(null)
  /** Sube con cada pedido de ubicación o elección de zona: una respuesta vieja no pisa lo que eligió después. */
  const pedidoUbicacion = useRef(0)
  const [tipo, setTipo] = useState<TipoHogar>(tipoInicial)
  const [tope, setTope] = useState<number | null>(topeInicial)
  /** Dormitorios o más (los lotes no tienen). */
  const [dormElegido, setDorm] = useState<number | null>(dormInicial)
  const dorm = tipo === 'lot' ? null : dormElegido
  /** Barrio cerrado/abierto; null = me da igual. Solo cuenta con una ciudad (un barrio ya lo dice). */
  const [barrioElegido, setBarrio] = useState<BarrioHogar | null>(barrioInicial)
  const barrio = zona && !zona.esCiudad ? null : barrioElegido
  const [query, setQuery] = useState('')
  const [sugerencias, setSugerencias] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [abierto, setAbierto] = useState(false)
  /**
   * Las casas que tiene el mazo abierto. Al afinar la búsqueda desde adentro
   * (David 5-oct) cambian los filtros de acá y se vuelve a contar; el mazo NO se
   * cierra mientras tanto: recibe las nuevas cuando llegan.
   */
  const [mazo, setMazo] = useState<{ clave: string; items: ItemFeed[] } | null>(null)
  const [estadoAfinar, setEstadoAfinar] = useState<'listo' | 'buscando' | 'vacio'>('listo')
  const [rondaAfinar, setRondaAfinar] = useState(0)
  /** Tocó "Ver" mientras contaba: el mazo abre apenas llegan las casas. */
  const [abrirAlLlegar, setAbrirAlLlegar] = useState(false)
  /** Tocó "Ver" sin elegir dónde: se marca esa fila un momento. */
  const [marcarDonde, setMarcarDonde] = useState(false)
  /** Sube con "Reintentar" para volver a contar. */
  const [intento, setIntento] = useState(0)
  const sinResultadosRef = useRef<HTMLDivElement>(null)
  const buscadorRef = useRef<HTMLDivElement>(null)
  const guardadasApi = useGuardadas('home')

  // Contador: entró a la pantalla (en /tinder de Hilo: de los que entran, cuántos abren el mazo).
  // Antes de contar: si vino del link del asesor o de un anuncio, se cuenta aparte (y la vista previa del asesor no cuenta).
  useEffect(() => {
    if (cliente) fijarCanalTinder(cliente.soloMirar ? 'asesor' : 'cliente')
    else if (desdePauta) fijarCanalTinder('pauta')
    if (abrirAlCargar && zonaInicial) setAbrirAlLlegar(true)
    if (Date.now() - pantallaContadaEn < 3000) return
    pantallaContadaEn = Date.now()
    contarTinder('pantalla', 'home')
    // Solo al entrar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tipoInfo = TIPOS_HOGAR.find((t) => t.id === tipo)!
  const plural = tipoInfo.plural
  const donde = zona ? zona.nombre : cerca ? `cerca:${cerca.lat},${cerca.lng}` : null
  const clave = donde ? `${donde}|${tipo}|${tope ?? ''}|${dorm ?? ''}|${barrio ?? ''}` : null
  const listo = resultado && resultado.clave === clave ? resultado : null
  const fallo = !!listo?.fallo
  const cantidad = listo && !fallo ? listo.items.length : null
  const filtradas = sugerirZonas(catalogo, query, tipo, 7)
  const sinCoincidencias = query.trim().length >= 3 && filtradas.length === 0
  const ciudades = CIUDADES.map((n) => zonaPorNombre(catalogo, n)).filter((z): z is ZonaHogar => z != null && cantidadZona(z, tipo) > 0)
  // Eligió un barrio en el buscador: ocupa la fila "Dónde" hasta que lo saque.
  const barrioBuscado = zona && !ciudades.some((c) => c.nombre === zona.nombre) ? zona : null

  // Lo que eligió queda en la URL: se puede compartir y viaja con la consulta.
  useEffect(() => {
    const p = new URLSearchParams()
    if (zona) p.set('zona', zona.nombre)
    if (tipo !== 'house') p.set('tipo', tipo)
    if (tope) p.set('tope', String(tope))
    if (dorm) p.set('dorm', String(dorm))
    if (barrioElegido) p.set('barrio', barrioElegido)
    // Su link sigue siendo SU link (si recarga, lo que marque le sigue llegando al asesor).
    if (cliente) p.set('s', cliente.token)
    if (cliente?.soloMirar) p.set('vista', 'asesor')
    const qs = p.toString()
    // `null` y no `window.history.state`: ese trae la marca interna de Next y el
    // router no se enteraba del cambio; al re-renderizar volvía a la URL vieja.
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
  }, [zona, tipo, tope, dorm, barrioElegido, cliente])

  // Se cuenta apenas elige: el botón dice cuántas hay y el mazo abre al toque.
  useEffect(() => {
    if (!clave || (!zona && !cerca)) return
    const ctrl = new AbortController()
    const p = new URLSearchParams(zona ? { zona: zona.nombre, tipo } : { cerca: `${cerca!.lat},${cerca!.lng}`, tipo })
    if (tope) p.set('tope', String(tope))
    if (dorm) p.set('dorm', String(dorm))
    if (barrio) p.set('barrio', barrio)
    fetch(`/api/propiedades/hogar?${p.toString()}`, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d: { items?: ItemFeed[]; zona?: string }) => setResultado({ clave, items: Array.isArray(d.items) ? d.items : [], ciudad: d.zona || null }))
      .catch((e) => {
        // Sin señal o el servidor no respondió: se ofrece reintentar (no es "no hay").
        if (e?.name !== 'AbortError') setResultado({ clave, items: [], fallo: true })
      })
    return () => ctrl.abort()
  }, [zona, cerca, tipo, tope, dorm, barrio, clave, intento])

  const abrir = () => {
    if (!donde || !listo || listo.fallo || listo.items.length === 0) return
    trackEvent('hogar_comenzar', { zona: zona?.nombre ?? 'cerca', tipo, tope: tope ?? 0, dorm: dorm ?? 0, barrio: barrio ?? 'indistinto', cantidad: listo.items.length })
    setMazo({ clave: listo.clave, items: listo.items })
    setEstadoAfinar('listo')
    setAbierto(true)
  }

  useEffect(() => {
    if (!abrirAlLlegar || !listo) return
    setAbrirAlLlegar(false)
    abrir()
    // `abrir` lee el estado de este mismo render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abrirAlLlegar, listo])

  // Afinó con el mazo abierto: cuando llegan las nuevas, el mazo arranca con ellas.
  useEffect(() => {
    if (!abierto || !listo || !mazo || listo.clave === mazo.clave) return
    if (listo.fallo || listo.items.length === 0) {
      setEstadoAfinar('vacio')
      return
    }
    setMazo({ clave: listo.clave, items: listo.items })
    setEstadoAfinar('listo')
    setRondaAfinar((r) => r + 1)
  }, [abierto, listo, mazo])

  // Sin resultados: el aviso con cómo ampliar queda a la vista.
  useEffect(() => {
    if (cantidad === 0) sinResultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [cantidad])

  useEffect(() => {
    if (!marcarDonde) return
    const t = setTimeout(() => setMarcarDonde(false), 1600)
    return () => clearTimeout(t)
  }, [marcarDonde])

  // Cerrar las sugerencias al tocar afuera. pointerdown (no mousedown): en el
  // iPhone un toque en una parte "no clickeable" de la página no dispara mousedown.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (buscadorRef.current && !buscadorRef.current.contains(e.target as Node)) setSugerencias(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [])

  const elegirZona = (z: ZonaHogar | null) => {
    pedidoUbicacion.current++
    setCerca(null)
    setUbicacion(null)
    setZona(z)
    setQuery('')
    setSugerencias(false)
    // Eligió del buscador: se cierra el teclado del celu y queda a la vista el botón.
    if (document.activeElement instanceof HTMLInputElement) document.activeElement.blur()
  }

  // "Cerca mío". Al analytics va solo si salió o no (nunca el punto).
  const ubicar = () => {
    if (cerca) return
    const pedido = ++pedidoUbicacion.current
    setUbicacion('buscando')
    pedirUbicacion().then(
      (punto) => {
        if (pedido !== pedidoUbicacion.current) return
        trackEvent('hogar_cerca', { resultado: 'ok' })
        setZona(null)
        setCerca(punto)
        setUbicacion(null)
      },
      (motivo: FalloUbicacion) => {
        if (pedido !== pedidoUbicacion.current) return
        trackEvent('hogar_cerca', { resultado: motivo })
        setUbicacion(motivo)
      },
    )
  }

  const reintentar = () => {
    setResultado(null)
    setIntento((i) => i + 1)
  }

  const ver = () => {
    if (!donde) return ubicacion === 'buscando' ? undefined : setMarcarDonde(true)
    if (fallo) {
      reintentar()
      return setAbrirAlLlegar(true)
    }
    if (!listo) return setAbrirAlLlegar(true)
    if (listo.items.length === 0) return sinResultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    abrir()
  }

  const Plural = `${plural[0].toUpperCase()}${plural.slice(1)}`
  const ciudadCerca = cerca ? listo?.ciudad ?? null : null
  const titulo = zona ? `${Plural} en ${barrio ? `barrio ${barrio} de ` : ''}${zona.nombre}` : cerca ? `${Plural} cerca tuyo` : ''
  // Lo lee el asesor en Hilo ("Buscó en la web: …").
  const busqueda = `${plural}${dorm ? ` de ${textoDorm(dorm)}` : ''}${barrio ? ` en barrio ${barrio}` : ''}${
    cerca ? ` cerca de su ubicación${ciudadCerca ? `, en ${ciudadCerca},` : ''}` : ''
  }${tope ? ` ${textoPrecio(tope)}` : ''}`
  // En "Cerca mío" la zona del mail y de la consulta es la ciudad de la más cercana.
  const criterios: CriteriosBusqueda = { zona: zona?.nombre ?? ciudadCerca, tipo, topeUsd: tope, dormMin: dorm, barrio, origen: 'conoce_tu_hogar' }
  const ciudadEntera = zona && !zona.esCiudad && zona.ciudad ? zonaPorNombre(catalogo, zona.ciudad) : null
  const esperando = abrirAlLlegar && !listo
  const textoSinResultados = `${plural}${dorm ? ` de ${textoDorm(dorm)}` : ''}${barrio ? ` en barrio ${barrio}` : ''}`

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[520px] px-5 pt-5 pb-[140px]">
        <h1 className={cls.h1}>Conocé tu próximo hogar</h1>
        <p className={`${cls.sub} mt-1.5`}>
          {cliente
            ? `${cliente.nombre ? `${cliente.nombre}, deslizá` : 'Deslizá'} las que te gusten: le llegan a ${cliente.asesor ?? 'tu asesor'}.`
            : 'Elegí qué y dónde, y deslizá las que te gusten.'}
        </p>
        {cliente?.soloMirar && (
          <p className="mt-3 rounded-[12px] bg-[#FFF7E8] px-3.5 py-2.5 text-[15px] font-semibold text-[#7A5A16]">Vista del asesor: lo que toques no se manda.</p>
        )}

        {/* Buscador de barrios: arriba de todo (David, 4-oct), para el que ya sabe cuál. */}
        <div ref={buscadorRef} className="relative mt-5">
          <label htmlFor="hogar-zona" className="sr-only">
            Buscar un barrio
          </label>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8A958D]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
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
                elegirZona(filtradas[0])
              }
            }}
            placeholder="Buscar un barrio"
            autoComplete="off"
            enterKeyHint="search"
            className="h-11 w-full rounded-[12px] bg-[#F1F3F1] pl-10 pr-4 text-[16px] font-medium text-[#121A15] outline-none placeholder:text-[#8A958D] focus:bg-white focus:shadow-[0_0_0_2px_#17613C]"
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
                    onClick={() => elegirZona(z)}
                    className="flex w-full items-baseline gap-2 border-b border-[#F3F4F3] px-4 py-3 text-left text-[15px] text-[#121A15] last:border-b-0 hover:bg-[#F6F8F6]"
                  >
                    <span className="flex-1">{highlightMatch(z.nombre, query)}</span>
                    <span className="shrink-0 text-[13px] text-[#6B766E]">
                      {z.esCiudad ? 'Ciudad' : z.ciudad}
                      {n === 0 && z.casas + z.lotes + z.deptos > 0 ? ` · sin ${plural}` : ''}
                    </span>
                  </button>
                )
              })}
              {sinCoincidencias && (
                <p className="px-4 py-3 text-[14px] text-[#3C4A42]">No encontramos «{query.trim()}». Elegí la ciudad abajo.</p>
              )}
            </div>
          )}
        </div>

        <Segmentos<TipoHogar>
          etiqueta="Qué buscás"
          opciones={TIPOS_HOGAR.map((t) => ({ v: t.id, label: t.label }))}
          valor={tipo}
          onChange={(t) => {
            // Los precios cambian con el tipo (un lote de 250 mil no es lo mismo que una casa).
            if (t !== tipo) setTope(null)
            setTipo(t)
          }}
        />

        {barrioBuscado ? (
          <div className="mt-5">
            <p className={cls.lbl}>Dónde</p>
            <div className="mt-2 flex h-[52px] items-center gap-2 rounded-[14px] bg-[#F1F3F1] p-1">
              <span className="flex h-11 min-w-0 flex-1 items-center rounded-[11px] bg-white px-3.5 text-[15px] font-semibold text-[#121A15] shadow-[0_1px_3px_rgba(18,26,21,0.14)]">
                <span className="truncate">{barrioBuscado.nombre}</span>
                {barrioBuscado.ciudad && !barrioBuscado.esCiudad && <span className="ml-1.5 shrink-0 font-medium text-[#6B766E]">· {barrioBuscado.ciudad}</span>}
              </span>
              <button
                type="button"
                onClick={() => elegirZona(null)}
                aria-label={`Sacar ${barrioBuscado.nombre}`}
                className="si-tap flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] text-[#5B665F] hover:text-[#121A15]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <Segmentos<string | null>
            etiqueta="Dónde"
            opciones={[
              ...ciudades.map((c) => ({ v: c.nombre, label: c.nombre })),
              {
                v: CERCA_MIO,
                // En el celu no entra "Cerca mío" en un cuarto de la fila: pin + "Cerca" (nunca texto cortado).
                label: (
                  <>
                    <IconoUbicacion />
                    Cerca<span className="sr-only sm:not-sr-only"> mío</span>
                  </>
                ),
              },
            ]}
            valor={ubicacion === 'buscando' || cerca ? CERCA_MIO : zona?.nombre ?? null}
            onChange={(n) => (n === CERCA_MIO ? ubicar() : elegirZona(ciudades.find((c) => c.nombre === n) ?? null))}
            resaltar={marcarDonde}
          />
        )}

        {/* Sin ubicación nunca es un callejón: las ciudades siguen ahí. */}
        {(ubicacion === 'denegada' || ubicacion === 'fallo') && (
          <p role="status" className="mt-2 text-[15px] leading-snug text-[#3C4A42]">
            {ubicacion === 'denegada'
              ? 'Para ver las casas cerca tuyo, permití la ubicación en tu navegador. O elegí una ciudad.'
              : 'No pudimos saber dónde estás. Tocá «Cerca mío» de nuevo o elegí una ciudad.'}
          </p>
        )}

        <Segmentos<number | null>
          // Un valor, no un techo: busca ±20 % (David 5-oct). Los 4 precios ("500 mil" también) en miles para que entren en el celu.
          etiqueta="Precio (miles de dólares)"
          opciones={[{ v: null, label: 'Todos' }, ...TOPES_HOGAR[tipo].map((v) => ({ v, label: String(v / 1000) }))]}
          valor={tope}
          onChange={setTope}
        />

        {tipo !== 'lot' && (
          <Segmentos<number | null>
            etiqueta="Dormitorios"
            opciones={[{ v: null, label: 'Todos' }, ...DORMS.map((v) => ({ v, label: `${v}+` }))]}
            valor={dorm}
            onChange={setDorm}
          />
        )}

        {!barrioBuscado && (
          <Segmentos<BarrioHogar | null>
            etiqueta="Barrio"
            opciones={[
              { v: null, label: 'Me da igual' },
              { v: 'cerrado', label: 'Cerrado' },
              { v: 'abierto', label: 'Abierto' },
            ]}
            valor={barrioElegido}
            onChange={setBarrio}
          />
        )}

        {donde && fallo && (
          <div className="mt-6 rounded-2xl bg-[#FFF7E8] px-4 py-3.5" role="alert">
            <p className="text-[15px] font-semibold text-[#7A5A16]">No pudimos buscar ahora. Revisá tu conexión y tocá Reintentar.</p>
          </div>
        )}

        {/* Sin resultados: nunca un callejón sin salida, se ofrece cómo ampliar. */}
        {donde && cantidad === 0 && (
          <div ref={sinResultadosRef} className="mt-6 rounded-2xl bg-[#F6F8F6] px-4 py-3.5">
            <p className="text-[16px] font-semibold text-[#121A15]">
              {zona ? `Todavía no tenemos ${textoSinResultados} en ${zona.nombre}` : `No hay ${textoSinResultados} a menos de 15 km tuyo`}
              {tope ? ` ${textoPrecio(tope)}` : ''}.
            </p>
            {cerca && <p className="mt-1 text-[15px] text-[#3C4A42]">Elegí Funes, Roldán o Rosario arriba.</p>}
            <div className="mt-2.5 flex flex-wrap gap-2">
              {tope != null && (
                <button type="button" onClick={() => setTope(null)} className={chipSecundario}>
                  Cualquier precio
                </button>
              )}
              {dorm != null && (
                <button type="button" onClick={() => setDorm(null)} className={chipSecundario}>
                  Cualquier cantidad de dormitorios
                </button>
              )}
              {barrio != null && (
                <button type="button" onClick={() => setBarrio(null)} className={chipSecundario}>
                  Cerrado o abierto
                </button>
              )}
              {ciudadEntera && (
                <button type="button" onClick={() => elegirZona(ciudadEntera)} className={chipSecundario}>
                  Todo {ciudadEntera.nombre}
                </button>
              )}
            </div>
            {/* O que le avisemos cuando entren (David 4-oct: el mail con la búsqueda ya filtrada).
                Lejos de todo ("Cerca mío" sin nada a 15 km) no hay zona que avisarle. */}
            {zona && (
              <div className="mt-3">
                <SuscripcionMail criterios={criterios} origen="home" />
              </div>
            )}
          </div>
        )}
      </div>

      <BarraFija>
        <button type="button" onClick={ver} className={cls.cta} aria-live="polite">
          {ubicacion === 'buscando' ? (
            <>
              <Spinner />
              Buscando tu ubicación…
            </>
          ) : !donde ? (
            'Elegí dónde buscar'
          ) : fallo ? (
            'Reintentar'
          ) : cantidad == null || esperando ? (
            <>
              <Spinner />
              Buscando {plural}…
            </>
          ) : cantidad === 0 ? (
            `No hay ${plural} con esto`
          ) : (
            <>
              Ver {cantidad} {cantidad === 1 ? plural.replace(/s$/, '') : plural} <IconoFlecha />
            </>
          )}
        </button>
      </BarraFija>

      {abierto && mazo && donde && guardadasApi.montado && (
        <MazoCasas
          items={mazo.items}
          titulo={titulo}
          barrio={zona?.nombre ?? ciudadCerca}
          guardadasApi={guardadasApi}
          origen="home"
          busqueda={busqueda}
          criterios={criterios}
          cargarParecidos={(barrios, yaVistas) => cargarCasasDeBarrios(barrios, tipo, tope, yaVistas, dorm)}
          afinar={{
            tipo,
            valores: { zona: zona?.nombre ?? CERCA_MIO, tope, dorm, barrio },
            zonas: [...(cerca ? [CERCA_MIO] : []), ...ciudades.map((c) => c.nombre), ...(zona && !zona.esCiudad ? [zona.nombre] : [])],
            esCiudad: (z) => z === CERCA_MIO || !!zonaPorNombre(catalogo, z)?.esCiudad,
            estado: estadoAfinar,
            ronda: rondaAfinar,
            onAplicar: (v) => {
              // "Cerca mío" sigue con el mismo punto; una ciudad o barrio lo reemplaza.
              const nueva = v.zona === CERCA_MIO ? null : zonaPorNombre(catalogo, v.zona)
              if (nueva) {
                setCerca(null)
                setZona(nueva)
              }
              setTope(v.tope)
              setDorm(v.dorm)
              setBarrio(v.barrio)
              setEstadoAfinar('buscando')
            },
          }}
          aprender={!cerca}
          cliente={cliente ? { token: cliente.token, soloMirar: cliente.soloMirar } : null}
          onCerrar={() => setAbierto(false)}
        />
      )}
    </div>
  )
}
