'use client'

// "Conocé tu próximo hogar" (David, 3-oct-2026): la puerta de la home al mazo
// tipo Tinder. Que lo usen pero que no sea lo principal: en la home es un link
// debajo del buscador; acá, una sola pantalla — dónde busca (obligatorio), qué
// y hasta cuánto (opcional) — y "Comenzá la experiencia" abre el mismo mazo de
// la ficha (MazoCasas): nuestras primero y después las "En red". El botón dice
// cuántas hay antes de entrar: nunca se abre un mazo vacío.

import { useEffect, useMemo, useRef, useState } from 'react'
import { highlightMatch } from '@/lib/highlight'
import {
  type ItemFeed,
  type TipoHogar,
  type ZonaHogar,
  TIPOS_HOGAR,
  TOPES_HOGAR,
  cantidadZona,
  sugerirZonas,
  textoTope,
} from '@/lib/feed-en-red'
import { trackEvent } from '@/lib/analytics'
import { BarraFija, IconoFlecha, Spinner, cls } from '@/components/tasaciones/ui'
import MazoCasas, { ROSA, SuscripcionMail, useGuardadas } from '@/components/mazo/MazoCasas'
import { cargarCasasDeBarrios } from '@/lib/mazo-parecidos'

const chip = 'si-tap inline-flex h-11 items-center whitespace-nowrap rounded-full border-[1.5px] px-[15px] text-[14.5px] font-semibold transition-colors motion-reduce:transition-none'
const chipOff = `${chip} border-[#E1E6E1] bg-white text-[#3C4A42] hover:border-[#17613C]/50`
const chipOn = `${chip} border-[#17613C] bg-[#17613C] font-bold text-white`

/** Las zonas a un toque: donde más se busca (y donde hay más casas en la red). */
const RAPIDAS: { nombre: string; label: string }[] = [
  { nombre: 'Funes', label: 'Funes' },
  { nombre: 'Roldán', label: 'Roldán' },
  { nombre: 'Funes Lakes', label: 'Funes Lakes' },
  { nombre: 'Kentucky Club de Campo', label: 'Kentucky' },
  { nombre: 'Vida Lagoon', label: 'Vida Lagoon' },
  { nombre: 'Fisherton', label: 'Fisherton' },
]

const normal = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

function zonaPorNombre(catalogo: ZonaHogar[], nombre: string | null | undefined): ZonaHogar | null {
  if (!nombre?.trim()) return null
  return catalogo.find((z) => normal(z.nombre) === normal(nombre)) ?? null
}

/** `fallo` = no se pudo buscar (sin señal, servidor caído): no es lo mismo que "no hay". */
type Resultado = { clave: string; items: ItemFeed[]; fallo?: boolean }

export default function ConoceTuHogar({
  catalogo,
  zonaInicial,
  tipoInicial,
  topeInicial,
}: {
  /** Barrios y ciudades con algo en venta (Hilo). */
  catalogo: ZonaHogar[]
  zonaInicial: string | null
  tipoInicial: TipoHogar
  topeInicial: number | null
}) {
  const [zona, setZona] = useState<ZonaHogar | null>(() => zonaPorNombre(catalogo, zonaInicial))
  const [tipo, setTipo] = useState<TipoHogar>(tipoInicial)
  const [tope, setTope] = useState<number | null>(topeInicial)
  const [query, setQuery] = useState('')
  const [sugerencias, setSugerencias] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [abierto, setAbierto] = useState(false)
  /** Tocó "Comenzá" con el barrio escrito pero sin elegir: se elige solo y el mazo abre cuando llega. */
  const [abrirAlLlegar, setAbrirAlLlegar] = useState(false)
  /** Sube con "Reintentar" para volver a contar. */
  const [intento, setIntento] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const buscadorRef = useRef<HTMLDivElement>(null)
  const guardadasApi = useGuardadas('home')

  const tipoInfo = TIPOS_HOGAR.find((t) => t.id === tipo)!
  const clave = zona ? `${zona.nombre}|${tipo}|${tope ?? ''}` : null
  const listo = resultado && resultado.clave === clave ? resultado : null
  const fallo = !!listo?.fallo
  const cantidad = listo && !fallo ? listo.items.length : null
  const filtradas = sugerirZonas(catalogo, query, tipo, 7)
  // Escribió algo que no está: se ofrecen las ciudades (nunca queda trabado).
  const sinCoincidencias = query.trim().length >= 3 && filtradas.length === 0
  const ciudades = useMemo(() => catalogo.filter((z) => z.esCiudad && z.casas + z.lotes + z.deptos >= 5).slice(0, 3), [catalogo])

  // Lo que eligió queda en la URL: se puede compartir y viaja con la consulta.
  useEffect(() => {
    const p = new URLSearchParams()
    if (zona) p.set('zona', zona.nombre)
    if (tipo !== 'house') p.set('tipo', tipo)
    if (tope) p.set('tope', String(tope))
    const qs = p.toString()
    // `null` y no `window.history.state`: ese trae la marca interna de Next y el
    // router no se enteraba del cambio; al re-renderizar volvía a la URL vieja.
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
  }, [zona, tipo, tope])

  // Se cuenta apenas elige (así el botón dice cuántas hay y el mazo abre al toque).
  useEffect(() => {
    if (!zona || !clave) return
    const ctrl = new AbortController()
    const p = new URLSearchParams({ zona: zona.nombre, tipo })
    if (tope) p.set('tope', String(tope))
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
  }, [zona, tipo, tope, clave, intento])

  const reintentar = () => {
    setResultado(null)
    setIntento((i) => i + 1)
  }

  useEffect(() => {
    if (!abrirAlLlegar || !listo || !zona) return
    setAbrirAlLlegar(false)
    if (listo.fallo || listo.items.length === 0) return
    trackEvent('hogar_comenzar', { zona: zona.nombre, tipo, tope: tope ?? 0, cantidad: listo.items.length })
    setAbierto(true)
  }, [abrirAlLlegar, listo, zona, tipo, tope])

  // Cerrar las sugerencias al tocar afuera. pointerdown (no mousedown): en el
  // iPhone un toque en una parte "no clickeable" de la página no dispara mousedown.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (buscadorRef.current && !buscadorRef.current.contains(e.target as Node)) setSugerencias(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [])

  const elegirZona = (z: ZonaHogar) => {
    setZona(z)
    setQuery('')
    setSugerencias(false)
    setError(null)
  }

  const comenzar = () => {
    // Escribió otro barrio (sin tocarlo en la lista) teniendo uno elegido: manda lo escrito.
    if (zona && query.trim().length >= 2 && filtradas[0] && filtradas[0].nombre !== zona.nombre) {
      elegirZona(filtradas[0])
      setAbrirAlLlegar(true)
      return
    }
    if (!zona) {
      // Escribió el barrio pero no lo tocó en la lista: se toma la primera sugerencia.
      if (filtradas[0]) {
        elegirZona(filtradas[0])
        setAbrirAlLlegar(true)
        return
      }
      setError(query.trim() ? 'Elegí el barrio de la lista, o una de las ciudades.' : 'Elegí dónde buscás: un barrio o una ciudad.')
      setSugerencias(true)
      inputRef.current?.focus()
      return
    }
    // Todavía contando: abre solo apenas llega.
    if (!listo) return setAbrirAlLlegar(true)
    if (listo.fallo) {
      reintentar()
      return setAbrirAlLlegar(true)
    }
    if (listo.items.length === 0) return
    trackEvent('hogar_comenzar', { zona: zona.nombre, tipo, tope: tope ?? 0, cantidad: listo.items.length })
    setAbierto(true)
  }

  // La zona elegida, aunque no esté entre las rápidas, queda como chip prendido.
  const rapidas = useMemo(() => {
    const base = RAPIDAS.map((r) => ({ label: r.label, zona: zonaPorNombre(catalogo, r.nombre) })).filter(
      (r): r is { label: string; zona: ZonaHogar } => r.zona != null,
    )
    if (zona && !base.some((r) => r.zona.nombre === zona.nombre)) base.unshift({ label: zona.nombre, zona })
    return base
  }, [zona, catalogo])

  const plural = tipoInfo.plural
  const titulo = zona ? `${plural[0].toUpperCase()}${plural.slice(1)} en ${zona.nombre}` : ''
  const busqueda = `${plural}${tope ? ` hasta ${textoTope(tope)}` : ''}`
  const ciudadEntera = zona && !zona.esCiudad && zona.ciudad ? zonaPorNombre(catalogo, zona.ciudad) : null

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[520px] px-5 pt-3 pb-[170px]">
        <p className={`${cls.lbl} mt-2`}>
          <span style={{ color: ROSA }} aria-hidden="true">
            ♥
          </span>{' '}
          Conocé tu próximo hogar
        </p>
        <h1 className={`${cls.h1} mt-1.5`}>¿Dónde buscás?</h1>
        <p className={`${cls.sub} mt-2`}>Mientras mejor nos detalles, más cerca estarás de tu hogar.</p>

        {/* Dónde */}
        <div ref={buscadorRef} className="relative mt-4">
          <label htmlFor="hogar-zona" className="sr-only">
            Barrio o ciudad
          </label>
          <input
            id="hogar-zona"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSugerencias(e.target.value.trim().length >= 2)
              setError(null)
            }}
            onFocus={() => query.trim().length >= 2 && setSugerencias(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filtradas[0]) {
                e.preventDefault()
                elegirZona(filtradas[0])
              }
            }}
            placeholder="Escribí un barrio o una ciudad"
            autoComplete="off"
            className="h-12 w-full rounded-2xl border-[1.5px] border-[#E1E6E1] bg-white px-4 text-[16px] font-medium text-[#121A15] outline-none placeholder:text-[#8A958D] focus:border-[#17613C]"
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
                    {ciudades.map((c) => (
                      <button key={c.nombre} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => elegirZona(c)} className={chipOff}>
                        {c.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div role="group" aria-label="Zonas" className="mt-3 flex flex-wrap gap-2">
          {rapidas.map((r) => {
            const on = zona?.nombre === r.zona.nombre
            return (
              <button key={r.zona.nombre} type="button" aria-pressed={on} onClick={() => (on ? setZona(null) : elegirZona(r.zona))} className={on ? chipOn : chipOff}>
                {r.label}
              </button>
            )
          })}
        </div>

        {/* Qué */}
        <p className={`${cls.lbl} mt-6`} id="lbl-hogar-tipo">
          ¿Qué buscás?
        </p>
        <div role="group" aria-labelledby="lbl-hogar-tipo" className="mt-2 flex flex-wrap gap-2">
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
              className={tipo === t.id ? chipOn : chipOff}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Hasta cuánto */}
        <p className={`${cls.lbl} mt-6`} id="lbl-hogar-tope">
          ¿Hasta cuánto? <span className="normal-case tracking-normal font-medium">(opcional)</span>
        </p>
        <div role="group" aria-labelledby="lbl-hogar-tope" className="mt-2 flex flex-wrap gap-2">
          {TOPES_HOGAR[tipo].map((v) => (
            <button key={v} type="button" aria-pressed={tope === v} onClick={() => setTope(tope === v ? null : v)} className={tope === v ? chipOn : chipOff}>
              <span className="font-poppins">{textoTope(v)}</span>
            </button>
          ))}
          <button type="button" aria-pressed={tope == null} onClick={() => setTope(null)} className={tope == null ? chipOn : chipOff}>
            Sin tope
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-[#FFF7E8] px-3.5 py-2.5 text-[13.5px] font-medium text-[#7A5A16]">
            {error}
          </p>
        )}

        {zona && fallo && (
          <div className="mt-5 rounded-2xl bg-[#FFF7E8] px-4 py-3.5" role="alert">
            <p className="text-[15px] font-semibold text-[#7A5A16]">No pudimos buscar ahora. Revisá tu conexión y probá de nuevo.</p>
            <div className="mt-2.5">
              <button type="button" onClick={reintentar} className={chipOff}>
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Sin resultados: nunca un callejón sin salida, se ofrece cómo ampliar. */}
        {zona && cantidad === 0 && (
          <div className="mt-5 rounded-2xl bg-[#F6F8F6] px-4 py-3.5">
            <p className="text-[15px] font-semibold text-[#121A15]">
              Todavía no tenemos {plural} en {zona.nombre}
              {tope ? ` hasta ${textoTope(tope)}` : ''}.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {tope != null && (
                <button type="button" onClick={() => setTope(null)} className={chipOff}>
                  Ver sin tope
                </button>
              )}
              {ciudadEntera && (
                <button type="button" onClick={() => elegirZona(ciudadEntera)} className={chipOff}>
                  Ver todo {ciudadEntera.nombre}
                </button>
              )}
            </div>
            {/* O que le avisemos cuando entren (David 4-oct: el mail con la búsqueda ya filtrada). */}
            <div className="mt-3">
              <SuscripcionMail criterios={{ zona: zona.nombre, tipo, topeUsd: tope, origen: 'conoce_tu_hogar' }} origen="home" />
            </div>
          </div>
        )}
      </div>

      <BarraFija>
        <button type="button" onClick={comenzar} className={cls.cta} aria-describedby="hogar-cantidad" disabled={cantidad === 0 && !query.trim()}>
          Comenzá la experiencia <IconoFlecha />
        </button>
        <p id="hogar-cantidad" className={`${cls.fine} mt-1.5 flex min-h-[18px] items-center justify-center gap-2`} aria-live="polite">
          {!zona ? (
            'Deslizá las que te gusten y guardalas con ♥'
          ) : fallo ? (
            'No pudimos buscar. Tocá para reintentar.'
          ) : cantidad == null ? (
            <>
              <span className="[&>span]:h-3.5 [&>span]:w-3.5 [&>span]:border-[#17613C]/30 [&>span]:border-t-[#17613C]">
                <Spinner />
              </span>
              Buscando {plural}…
            </>
          ) : cantidad > 0 ? (
            `${cantidad} ${cantidad === 1 ? plural.replace(/s$/, '') : plural} para ver en ${zona.nombre}`
          ) : (
            'Probá con otra zona o sin tope'
          )}
        </p>
      </BarraFija>

      {abierto && listo && zona && guardadasApi.montado && (
        <MazoCasas
          items={listo.items}
          titulo={titulo}
          barrio={zona.nombre}
          guardadasApi={guardadasApi}
          origen="home"
          busqueda={busqueda}
          criterios={{ zona: zona.nombre, tipo, topeUsd: tope, origen: 'conoce_tu_hogar' }}
          cargarParecidos={(barrios, yaVistas) => cargarCasasDeBarrios(barrios, tipo, tope, yaVistas)}
          onCerrar={() => setAbierto(false)}
        />
      )}
    </div>
  )
}
