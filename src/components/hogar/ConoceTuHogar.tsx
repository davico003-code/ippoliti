'use client'

// "Conocé tu próximo hogar" (David, 3-oct-2026): la puerta de la home al mazo
// tipo Tinder. Que lo usen pero que no sea lo principal: en la home es un link
// debajo del buscador; acá, una sola pantalla — dónde busca (obligatorio), qué
// y hasta cuánto (opcional) — y "Comenzá la experiencia" abre el mismo mazo de
// la ficha (MazoCasas): nuestras primero y después las "En red". El botón dice
// cuántas hay antes de entrar: nunca se abre un mazo vacío.

import { useEffect, useMemo, useRef, useState } from 'react'
import { buscarZonas, ZONAS, type Zona } from '@/lib/zonas'
import { highlightMatch } from '@/lib/highlight'
import { type ItemFeed, type TipoHogar, TIPOS_HOGAR, TOPES_HOGAR, esBarrioConNombre, textoTope } from '@/lib/feed-en-red'
import { trackEvent } from '@/lib/analytics'
import { BarraFija, IconoFlecha, Spinner, cls } from '@/components/tasaciones/ui'
import MazoCasas, { ROSA, useGuardadas } from '@/components/mazo/MazoCasas'

const chip = 'si-tap inline-flex h-11 items-center whitespace-nowrap rounded-full border-[1.5px] px-[15px] text-[14.5px] font-semibold transition-colors motion-reduce:transition-none'
const chipOff = `${chip} border-[#E1E6E1] bg-white text-[#3C4A42] hover:border-[#17613C]/50`
const chipOn = `${chip} border-[#17613C] bg-[#17613C] font-bold text-white`

/** Las zonas a un toque: donde más se busca (y donde hay más casas en la red). */
const RAPIDAS: { id: string; label: string }[] = [
  { id: 'funes', label: 'Funes' },
  { id: 'roldan', label: 'Roldán' },
  { id: 'funes-funes-lakes', label: 'Funes Lakes' },
  { id: 'funes-kentucky', label: 'Kentucky' },
  { id: 'funes-vida-lagoon', label: 'Vida Lagoon' },
  { id: 'rosario-fisherton', label: 'Fisherton' },
]

const zonaPorNombre = (nombre: string | null | undefined): Zona | null =>
  nombre ? ZONAS.find((z) => z.nombre.toLowerCase() === nombre.trim().toLowerCase()) ?? null : null

type Resultado = { clave: string; items: ItemFeed[] }

export default function ConoceTuHogar({
  zonaInicial,
  tipoInicial,
  topeInicial,
}: {
  zonaInicial: string | null
  tipoInicial: TipoHogar
  topeInicial: number | null
}) {
  const [zona, setZona] = useState<Zona | null>(() => zonaPorNombre(zonaInicial))
  const [tipo, setTipo] = useState<TipoHogar>(tipoInicial)
  const [tope, setTope] = useState<number | null>(topeInicial)
  const [query, setQuery] = useState('')
  const [sugerencias, setSugerencias] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [abierto, setAbierto] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const buscadorRef = useRef<HTMLDivElement>(null)
  const guardadasApi = useGuardadas()

  const tipoInfo = TIPOS_HOGAR.find((t) => t.id === tipo)!
  const clave = zona ? `${zona.nombre}|${tipo}|${tope ?? ''}` : null
  const listo = resultado && resultado.clave === clave ? resultado : null
  const cantidad = listo?.items.length ?? null
  const filtradas = buscarZonas(query, 6)

  // Lo que eligió queda en la URL: se puede compartir y viaja con la consulta.
  useEffect(() => {
    const p = new URLSearchParams()
    if (zona) p.set('zona', zona.nombre)
    if (tipo !== 'house') p.set('tipo', tipo)
    if (tope) p.set('tope', String(tope))
    const qs = p.toString()
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
  }, [zona, tipo, tope])

  // Se cuenta apenas elige (así el botón dice cuántas hay y el mazo abre al toque).
  useEffect(() => {
    if (!zona || !clave) return
    const ctrl = new AbortController()
    const p = new URLSearchParams({ zona: zona.nombre, tipo })
    if (tope) p.set('tope', String(tope))
    fetch(`/api/propiedades/hogar?${p.toString()}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items?: ItemFeed[] }) => setResultado({ clave, items: Array.isArray(d.items) ? d.items : [] }))
      .catch((e) => {
        if (e?.name !== 'AbortError') setResultado({ clave, items: [] })
      })
    return () => ctrl.abort()
  }, [zona, tipo, tope, clave])

  // Cerrar las sugerencias al tocar afuera.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (buscadorRef.current && !buscadorRef.current.contains(e.target as Node)) setSugerencias(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const elegirZona = (z: Zona) => {
    setZona(z)
    setQuery('')
    setSugerencias(false)
    setError(null)
  }

  const comenzar = () => {
    if (!zona) {
      setError('Elegí dónde buscás: un barrio o una ciudad.')
      inputRef.current?.focus()
      return
    }
    if (!listo || listo.items.length === 0) return
    trackEvent('hogar_comenzar', { zona: zona.nombre, tipo, tope: tope ?? 0, cantidad: listo.items.length })
    setAbierto(true)
  }

  // La zona elegida, aunque no esté entre las rápidas, queda como chip prendido.
  const rapidas = useMemo(() => {
    const base = RAPIDAS.map((r) => ({ ...r, zona: ZONAS.find((z) => z.id === r.id) ?? null })).filter((r) => r.zona)
    if (zona && !base.some((r) => r.zona!.id === zona.id)) base.unshift({ id: zona.id, label: zona.nombre, zona })
    return base
  }, [zona])

  const plural = tipoInfo.plural
  const titulo = zona ? `${plural[0].toUpperCase()}${plural.slice(1)} en ${zona.nombre}` : ''
  const busqueda = `${plural}${tope ? ` hasta ${textoTope(tope)}` : ''}`
  const ciudadEntera = zona && esBarrioConNombre(zona.nombre) ? ZONAS.find((z) => z.nombre === zona.ciudad && z.tipo === 'zona') ?? null : null

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
          {sugerencias && filtradas.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-[280px] overflow-auto rounded-2xl border border-[#E1E6E1] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              {filtradas.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => elegirZona(z)}
                  className="flex w-full items-baseline gap-2 border-b border-[#F3F4F3] px-4 py-3 text-left text-[15px] text-[#121A15] last:border-b-0 hover:bg-[#F6F8F6]"
                >
                  <span className="flex-1">{highlightMatch(z.nombre, query)}</span>
                  <span className="shrink-0 text-xs text-[#8A958D]">{z.tipo === 'barrio_cerrado' ? `${z.ciudad} · Country` : z.ciudad}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div role="group" aria-label="Zonas" className="mt-3 flex flex-wrap gap-2">
          {rapidas.map((r) => {
            const on = zona?.id === r.zona!.id
            return (
              <button key={r.id} type="button" aria-pressed={on} onClick={() => (on ? setZona(null) : elegirZona(r.zona!))} className={on ? chipOn : chipOff}>
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
          </div>
        )}
      </div>

      <BarraFija>
        <button type="button" onClick={comenzar} className={cls.cta} aria-describedby="hogar-cantidad">
          Comenzá la experiencia <IconoFlecha />
        </button>
        <p id="hogar-cantidad" className={`${cls.fine} mt-1.5 flex min-h-[18px] items-center justify-center gap-2`} aria-live="polite">
          {!zona ? (
            'Deslizá las que te gusten y guardalas con ♥'
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
          onCerrar={() => setAbierto(false)}
        />
      )}
    </div>
  )
}
