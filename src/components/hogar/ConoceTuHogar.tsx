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

import { useEffect, useRef, useState } from 'react'
import { highlightMatch } from '@/lib/highlight'
import {
  type BarrioHogar,
  type CriteriosBusqueda,
  type ItemFeed,
  type TipoHogar,
  type ZonaHogar,
  TIPOS_HOGAR,
  TOPES_HOGAR,
  cantidadZona,
  sugerirZonas,
  textoDorm,
  textoTope,
} from '@/lib/feed-en-red'
import { trackEvent } from '@/lib/analytics'
import { contarTinder } from '@/lib/tinder-contador'
import { BarraFija, IconoFlecha, Spinner, cls } from '@/components/tasaciones/ui'
import MazoCasas, { SuscripcionMail, useGuardadas } from '@/components/mazo/MazoCasas'
import { cargarCasasDeBarrios } from '@/lib/mazo-parecidos'

/** Dónde: las tres que cubren casi todas las consultas, en ese orden. */
const CIUDADES = ['Funes', 'Roldán', 'Rosario']

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
  opciones: { v: V; label: string }[]
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

/** `fallo` = no se pudo buscar (sin señal, servidor caído): no es lo mismo que "no hay". */
type Resultado = { clave: string; items: ItemFeed[]; fallo?: boolean }

export default function ConoceTuHogar({
  catalogo,
  zonaInicial,
  tipoInicial,
  topeInicial,
  dormInicial,
  barrioInicial,
}: {
  /** Barrios y ciudades con algo en venta (Hilo). */
  catalogo: ZonaHogar[]
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
  useEffect(() => {
    if (Date.now() - pantallaContadaEn < 3000) return
    pantallaContadaEn = Date.now()
    contarTinder('pantalla', 'home')
  }, [])

  const tipoInfo = TIPOS_HOGAR.find((t) => t.id === tipo)!
  const plural = tipoInfo.plural
  const clave = zona ? `${zona.nombre}|${tipo}|${tope ?? ''}|${dorm ?? ''}|${barrio ?? ''}` : null
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
    const qs = p.toString()
    // `null` y no `window.history.state`: ese trae la marca interna de Next y el
    // router no se enteraba del cambio; al re-renderizar volvía a la URL vieja.
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
  }, [zona, tipo, tope, dorm, barrioElegido])

  // Se cuenta apenas elige: el botón dice cuántas hay y el mazo abre al toque.
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
        // Sin señal o el servidor no respondió: se ofrece reintentar (no es "no hay").
        if (e?.name !== 'AbortError') setResultado({ clave, items: [], fallo: true })
      })
    return () => ctrl.abort()
  }, [zona, tipo, tope, dorm, barrio, clave, intento])

  const abrir = () => {
    if (!zona || !listo || listo.fallo || listo.items.length === 0) return
    trackEvent('hogar_comenzar', { zona: zona.nombre, tipo, tope: tope ?? 0, dorm: dorm ?? 0, barrio: barrio ?? 'indistinto', cantidad: listo.items.length })
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
    setZona(z)
    setQuery('')
    setSugerencias(false)
    // Eligió del buscador: se cierra el teclado del celu y queda a la vista el botón.
    if (document.activeElement instanceof HTMLInputElement) document.activeElement.blur()
  }

  const reintentar = () => {
    setResultado(null)
    setIntento((i) => i + 1)
  }

  const ver = () => {
    if (!zona) return setMarcarDonde(true)
    if (fallo) {
      reintentar()
      return setAbrirAlLlegar(true)
    }
    if (!listo) return setAbrirAlLlegar(true)
    if (listo.items.length === 0) return sinResultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    abrir()
  }

  const titulo = zona ? `${plural[0].toUpperCase()}${plural.slice(1)} en ${barrio ? `barrio ${barrio} de ` : ''}${zona.nombre}` : ''
  const busqueda = `${plural}${dorm ? ` de ${textoDorm(dorm)}` : ''}${barrio ? ` en barrio ${barrio}` : ''}${tope ? ` hasta ${textoTope(tope)}` : ''}`
  const criterios: CriteriosBusqueda = { zona: zona?.nombre ?? null, tipo, topeUsd: tope, dormMin: dorm, barrio, origen: 'conoce_tu_hogar' }
  const ciudadEntera = zona && !zona.esCiudad && zona.ciudad ? zonaPorNombre(catalogo, zona.ciudad) : null
  const esperando = abrirAlLlegar && !listo

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[520px] px-5 pt-5 pb-[140px]">
        <h1 className={cls.h1}>Conocé tu próximo hogar</h1>
        <p className={`${cls.sub} mt-1.5`}>Elegí qué y dónde, y deslizá las que te gusten.</p>

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
            // Los topes cambian con el tipo (un lote de 250 mil no es lo mismo que una casa).
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
            opciones={ciudades.map((c) => ({ v: c.nombre, label: c.nombre }))}
            valor={zona?.nombre ?? null}
            onChange={(n) => elegirZona(ciudades.find((c) => c.nombre === n) ?? null)}
            resaltar={marcarDonde}
          />
        )}

        <Segmentos<number | null>
          etiqueta="Hasta (dólares)"
          opciones={[{ v: null, label: 'Sin tope' }, ...TOPES_HOGAR[tipo].slice(0, 3).map((v) => ({ v, label: textoTope(v).replace('USD ', '') }))]}
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

        {zona && fallo && (
          <div className="mt-6 rounded-2xl bg-[#FFF7E8] px-4 py-3.5" role="alert">
            <p className="text-[15px] font-semibold text-[#7A5A16]">No pudimos buscar ahora. Revisá tu conexión y tocá Reintentar.</p>
          </div>
        )}

        {/* Sin resultados: nunca un callejón sin salida, se ofrece cómo ampliar. */}
        {zona && cantidad === 0 && (
          <div ref={sinResultadosRef} className="mt-6 rounded-2xl bg-[#F6F8F6] px-4 py-3.5">
            <p className="text-[16px] font-semibold text-[#121A15]">
              Todavía no tenemos {plural}
              {dorm ? ` de ${textoDorm(dorm)}` : ''}
              {barrio ? ` en barrio ${barrio}` : ''} en {zona.nombre}
              {tope ? ` hasta ${textoTope(tope)}` : ''}.
            </p>
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
            {/* O que le avisemos cuando entren (David 4-oct: el mail con la búsqueda ya filtrada). */}
            <div className="mt-3">
              <SuscripcionMail criterios={criterios} origen="home" />
            </div>
          </div>
        )}
      </div>

      <BarraFija>
        <button type="button" onClick={ver} className={cls.cta} aria-live="polite">
          {!zona ? (
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

      {abierto && mazo && zona && guardadasApi.montado && (
        <MazoCasas
          items={mazo.items}
          titulo={titulo}
          barrio={zona.nombre}
          guardadasApi={guardadasApi}
          origen="home"
          busqueda={busqueda}
          criterios={criterios}
          cargarParecidos={(barrios, yaVistas) => cargarCasasDeBarrios(barrios, tipo, tope, yaVistas, dorm)}
          afinar={{
            tipo,
            valores: { zona: zona.nombre, tope, dorm, barrio },
            zonas: [...ciudades.map((c) => c.nombre), ...(zona.esCiudad ? [] : [zona.nombre])],
            esCiudad: (z) => !!zonaPorNombre(catalogo, z)?.esCiudad,
            estado: estadoAfinar,
            ronda: rondaAfinar,
            onAplicar: (v) => {
              const nueva = zonaPorNombre(catalogo, v.zona) ?? zona
              setZona(nueva)
              setTope(v.tope)
              setDorm(v.dorm)
              setBarrio(v.barrio)
              setEstadoAfinar('buscando')
            },
          }}
          onCerrar={() => setAbierto(false)}
        />
      )}
    </div>
  )
}
