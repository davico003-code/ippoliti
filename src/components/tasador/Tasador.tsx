'use client'

// EL TASADOR (David, 8-oct-2026: "el mismo tasador por barrio, en
// siinmobiliaria.com"): qué es, en qué barrio está, cuántos metros y qué
// antigüedad. Con eso y los números del barrio (Hilo los arma con todos los
// avisos en venta: terreno y construcción por m², ajuste por tamaño y
// antigüedad, y el margen real de cada barrio) sale el valor al instante. Si
// Hilo dice que ahí no se da número, no se inventa: queda el pedido.
// Debajo, siempre, el pedido de la tasación a un corredor, ahí mismo
// (PedidoTasacion): el que ve su número y quiere vender no cambia de página.
//
// En las landings arranca con el barrio ya elegido (`inicial`); en /tasar y
// /vender, con ?barrio=&tipo= del link (`leerLink`).

import Link from 'next/link'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import { EDADES, estimar, porcentaje, resultado, tramoEdad } from '@/lib/tasador/estimar'
import { HILO_DE, TEXTO_TIPO, TIPOS_TASAR, filtrarOpciones, opcionDeLink, sugeridas, tieneDatos, type OpcionTasar, type TipoTasar } from '@/lib/tasador/opciones'
import type { ModeloTasador } from '@/lib/tasador/tipos'
import PedidoTasacion from './PedidoTasacion'

type Props = {
  opciones: OpcionTasar[]
  modelo: Pick<ModeloTasador, 'curvaEdad' | 'beta'>
  /** 'vender' cambia los textos del pedido (la persona ya dijo que quiere vender). */
  modo: 'tasar' | 'vender'
  tipoInicial?: TipoTasar
  /** La clave de la zona ya elegida (la landing de un barrio). */
  inicial?: string | null
  /** En los índices: debajo del valor, el link a la página del barrio. */
  conLinkAlBarrio?: boolean
  /** En los índices: arrancar con ?barrio=&tipo= del link (anuncios, WhatsApp). */
  leerLink?: boolean
  /** En la landing, los números del barrio ya están al lado: el resultado no los repite. */
  sinDatosDelBarrio?: boolean
}

const soloNumero = (s: string) => s.replace(/\D/g, '').slice(0, 6)
const n = (x: number) => x.toLocaleString('es-AR')
const usd = (x: number) => `USD ${n(x)}`

const TIPO_LINK: Record<string, TipoTasar> = { casa: 'casa', lote: 'lote', terreno: 'lote', depto: 'departamento', departamento: 'departamento' }

export default function Tasador({ opciones, modelo, modo, tipoInicial = 'casa', inicial = null, conLinkAlBarrio = false, leerLink = false, sinDatosDelBarrio = false }: Props) {
  const zonaIni = inicial ? opciones.find((o) => o.clave === inicial) ?? null : null
  const pIni = zonaIni?.params[tipoInicial]
  const [tipo, setTipo] = useState<TipoTasar>(tipoInicial)
  const [zona, setZona] = useState<OpcionTasar | null>(zonaIni)
  const [texto, setTexto] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [m2, setM2] = useState(pIni ? String(pIni.m2Tipico) : '')
  const [lote, setLote] = useState('')
  const [edad, setEdad] = useState<number | null>(pIni?.antTipica != null ? tramoEdad(pIni.antTipica) : null)
  // ¿Los metros y la antigüedad los cargó la persona, o son los típicos del barrio que
  // pusimos de arranque? Al corredor le llegan solo los suyos (arquitecto, 8-oct).
  const [m2Propio, setM2Propio] = useState(false)
  const [edadPropia, setEdadPropia] = useState(false)
  const entrada = useRef<HTMLInputElement>(null)
  const ids = { buscar: useId(), lista: useId(), m2: useId(), lote: useId() }

  // ?barrio=kentucky&tipo=lote (una vez, al llegar).
  useEffect(() => {
    if (!leerLink) return
    const sp = new URLSearchParams(window.location.search)
    const t = TIPO_LINK[(sp.get('tipo') ?? '').toLowerCase()] ?? tipo
    const o = opcionDeLink(opciones, sp.get('barrio') ?? sp.get('zona'), t)
    if (t !== tipo) setTipo(t)
    if (o) {
      setZona(o)
      const po = o.params[t]
      if (po) {
        setM2(String(po.m2Tipico))
        if (po.antTipica != null) setEdad(tramoEdad(po.antTipica))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const p = zona && tieneDatos(zona, tipo) ? zona.params[tipo] ?? null : null
  const lista = useMemo(() => (texto.trim() ? filtrarOpciones(opciones, tipo, texto) : sugeridas(opciones, tipo)), [opciones, tipo, texto])
  const metros = Number(m2) || 0
  const loteNum = Number(lote) || null
  const anios = edad != null ? EDADES[edad].anios : null
  const valor = zona && p?.daNumero && metros > 0 ? estimar({ tipo: HILO_DE[tipo], m2: metros, lote: loteNum, ant: tipo === 'lote' ? null : anios }, p, modelo, zona.mixto) : null
  const r = p?.daNumero ? resultado(valor, p.error) : null
  const t = TEXTO_TIPO[tipo]
  const lugar = zona ? (zona.esCiudad ? zona.etiqueta : zona.nombre) : ''
  const slugBarrio = zona?.slugs[tipo]

  // Medición: la persona vio un valor que pidió ella (una vez por página).
  const medido = useRef(false)
  useEffect(() => {
    if (medido.current || !r || !zona) return
    if (zona.clave === inicial && m2 === String(pIni?.m2Tipico ?? '') && !lote) return
    medido.current = true
    trackEvent('tasar_valor', { barrio: zona.nombre, tipo, modo })
  }, [r, zona, m2, lote, inicial, pIni, tipo, modo])

  const elegir = (o: OpcionTasar) => {
    setZona(o)
    setTexto('')
    setAbierto(false)
    const po = o.params[tipo]
    if (po) {
      setM2(String(po.m2Tipico))
      setLote('')
      setM2Propio(false)
      if (po.antTipica != null) {
        setEdad(tramoEdad(po.antTipica))
        setEdadPropia(false)
      }
    }
  }
  const cambiarTipo = (x: TipoTasar) => {
    if (x === tipo) return
    setTipo(x)
    setLote('')
    const po = zona && tieneDatos(zona, x) ? zona.params[x] : null
    if (zona && !po) setZona(null)
    setM2(po ? String(po.m2Tipico) : '')
    setM2Propio(false)
    if (po?.antTipica != null) {
      setEdad(tramoEdad(po.antTipica))
      setEdadPropia(false)
    }
  }
  const abrirBuscador = () => {
    setAbierto(true)
    requestAnimationFrame(() => {
      entrada.current?.focus()
      entrada.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
  }

  const buscando = !zona || abierto

  return (
    <div className="rounded-[24px] border border-[#E1E6E1] bg-white p-5 shadow-[0_10px_32px_rgba(18,26,21,0.07)] sm:p-7">
      <div role="group" aria-label="Qué querés tasar" className="inline-flex rounded-full bg-[#F3F7F4] p-1">
        {TIPOS_TASAR.map((x) => (
          <button
            key={x}
            type="button"
            aria-pressed={tipo === x}
            onClick={() => cambiarTipo(x)}
            className={`min-h-11 rounded-full px-5 text-[15.5px] font-bold transition-colors ${tipo === x ? 'bg-[#17613C] text-white' : 'text-[#3C4A42] hover:text-[#121A15]'}`}
          >
            {TEXTO_TIPO[x].corto}
          </button>
        ))}
      </div>

      {/* 1. Dónde está */}
      <div className="mt-6">
        <label htmlFor={ids.buscar} className="block text-[16.5px] font-bold text-[#121A15]">
          ¿Dónde está {t.tu}?
        </label>
        {!buscando && zona ? (
          <div className="mt-2 flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-[#F3F7F4] px-4 py-2.5">
            <span className="min-w-0">
              <span className="block text-[16.5px] font-bold leading-tight text-[#121A15]">{lugar}</span>
              {!zona.esCiudad && <span className="block text-[14px] text-[#5B6B62]">{zona.ciudad}</span>}
            </span>
            <button type="button" onClick={abrirBuscador} className="inline-flex min-h-10 flex-none items-center rounded-full px-3 text-[15px] font-semibold text-[#17613C] hover:bg-[#e7f2eb]">
              Cambiar
            </button>
          </div>
        ) : (
          <div className="relative mt-2">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-[27px] h-5 w-5 -translate-y-1/2 text-[#5B6B62]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              ref={entrada}
              id={ids.buscar}
              type="search"
              value={texto}
              onChange={(ev) => {
                setTexto(ev.target.value)
                setAbierto(true)
              }}
              onFocus={() => setAbierto(true)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' && texto.trim() && lista[0]) {
                  ev.preventDefault()
                  elegir(lista[0])
                }
                if (ev.key === 'Escape' && zona) setAbierto(false)
              }}
              placeholder="Tu barrio: Kentucky, Fisherton…"
              autoComplete="off"
              enterKeyHint="search"
              role="combobox"
              aria-expanded
              aria-controls={ids.lista}
              aria-autocomplete="list"
              className="h-[54px] w-full rounded-2xl border-[1.5px] border-[#E1E6E1] bg-white pl-12 pr-4 text-[16.5px] font-semibold text-[#121A15] outline-none placeholder:font-normal placeholder:text-[#8A958E] focus:border-[#17613C] focus:ring-4 focus:ring-[#17613C]/10"
            />
            <p className="mt-3 text-[14px] font-semibold text-[#5B6B62]" aria-live="polite">
              {texto.trim()
                ? lista.length
                  ? 'Elegí el tuyo:'
                  : `No tenemos avisos suficientes de ${t.plural} en ese barrio. Probá con otro nombre o elegí la ciudad.`
                : 'Los más buscados, o escribí el tuyo:'}
            </p>
            <ul id={ids.lista} role="listbox" aria-label="Barrios" className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {lista.map((o) => (
                <li key={o.clave} role="option" aria-selected={zona?.clave === o.clave}>
                  <button type="button" onClick={() => elegir(o)} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-[#F3F7F4] px-4 py-2.5 text-left transition-colors hover:bg-[#e7f2eb]">
                    <span className="min-w-0">
                      <span className="block truncate text-[15.5px] font-bold leading-tight text-[#121A15]">{o.esCiudad ? o.etiqueta : o.nombre}</span>
                      {!o.esCiudad && <span className="block text-[13.5px] text-[#5B6B62]">{o.ciudad}</span>}
                    </span>
                    <span className="font-numeric flex-none text-[13px] text-[#5B6B62]">{n(o.params[tipo]?.n ?? 0)} avisos</span>
                  </button>
                </li>
              ))}
            </ul>
            {zona && (
              <button type="button" onClick={() => setAbierto(false)} className="mt-3 text-[14.5px] font-semibold text-[#17613C]">
                Seguir con {lugar}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Metros */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.m2} className="block text-[16.5px] font-bold text-[#121A15]">
            {tipo === 'lote' ? 'Metros del lote' : 'Metros cubiertos'}
          </label>
          <div className="mt-2 flex items-center gap-2.5">
            <input
              id={ids.m2}
              inputMode="numeric"
              value={m2}
              onChange={(ev) => {
                setM2(soloNumero(ev.target.value))
                setM2Propio(true)
              }}
              placeholder={p ? String(p.m2Tipico) : tipo === 'lote' ? '600' : '150'}
              className="font-numeric h-[54px] w-32 rounded-2xl border-[1.5px] border-[#E1E6E1] px-4 text-[19px] font-semibold text-[#121A15] outline-none placeholder:font-normal placeholder:text-[#A6AFAA] focus:border-[#17613C] focus:ring-4 focus:ring-[#17613C]/10"
            />
            <span className="text-[16px] font-semibold text-[#3C4A42]">m²</span>
          </div>
          {p && zona && (
            <p className="mt-1.5 text-[14px] text-[#5B6B62]">
              {tipo === 'lote' ? 'El lote típico' : tipo === 'casa' ? 'La casa típica' : 'El depto típico'} en {zona.esCiudad ? zona.ciudad : zona.nombre}: <span className="font-numeric">{n(p.m2Tipico)}</span> m²
            </p>
          )}
        </div>
        {tipo === 'casa' && zona?.mixto && p?.tierraM2 != null && p.daNumero && (
          <div>
            <label htmlFor={ids.lote} className="block text-[16.5px] font-bold text-[#121A15]">
              Metros del terreno <span className="font-medium text-[#5B6B62]">(si los sabés)</span>
            </label>
            <div className="mt-2 flex items-center gap-2.5">
              <input
                id={ids.lote}
                inputMode="numeric"
                value={lote}
                placeholder={p.loteTipico ? String(p.loteTipico) : ''}
                onChange={(ev) => setLote(soloNumero(ev.target.value))}
                className="font-numeric h-[54px] w-32 rounded-2xl border-[1.5px] border-[#E1E6E1] px-4 text-[19px] font-semibold text-[#121A15] outline-none placeholder:font-normal placeholder:text-[#A6AFAA] focus:border-[#17613C] focus:ring-4 focus:ring-[#17613C]/10"
              />
              <span className="text-[16px] font-semibold text-[#3C4A42]">m²</span>
            </div>
            {p.loteTipico && !lote && (
              <p className="mt-1.5 text-[14px] text-[#5B6B62]">
                Si lo dejás vacío, tomamos el típico: <span className="font-numeric">{n(p.loteTipico)}</span> m².
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Antigüedad */}
      {tipo !== 'lote' && (
        <fieldset className="mt-6">
          <legend className="text-[16.5px] font-bold text-[#121A15]">Antigüedad</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {EDADES.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={edad === x.id}
                onClick={() => {
                  setEdad(x.id)
                  setEdadPropia(true)
                }}
                className={`min-h-11 rounded-full border-[1.5px] px-4 text-[14.5px] font-semibold transition-colors ${edad === x.id ? 'border-[#17613C] bg-[#17613C] text-white' : 'border-[#E1E6E1] text-[#3C4A42] hover:border-[#17613C]/50'}`}
              >
                {x.texto}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* El valor */}
      <div aria-live="polite" className="mt-7 rounded-[20px] bg-[#F3F7F4] p-5 sm:p-6">
        {!zona || !p ? (
          <p className="text-[16.5px] font-semibold text-[#3C4A42]">Elegí el barrio y te mostramos cuánto vale {t.tu} hoy.</p>
        ) : !p.daNumero ? (
          <>
            <p className="font-raleway text-[19px] font-extrabold tracking-tight text-[#121A15]">En {lugar} no damos un número online</p>
            <p className="mt-1.5 text-[15.5px] leading-relaxed text-[#3C4A42]">
              {p.n < 10
                ? `Hay pocos ${t.plural} ${t.publicadas} para calcularlo sin errar.`
                : `Los precios de ${t.plural} ${t.publicadas} ahí son muy dispares para calcularlo solo con los metros.`}{' '}
              Un corredor te lo tasa mirando lo que se vendió en el barrio.
            </p>
          </>
        ) : !(metros > 0) || !r ? (
          <p className="text-[16.5px] font-semibold text-[#3C4A42]">Poné los metros y sale el valor.</p>
        ) : (
          <>
            <p className="text-[13.5px] font-bold uppercase tracking-wider text-[#17613C]">Vale alrededor de</p>
            <p className="font-numeric mt-1 text-[38px] font-semibold leading-none tracking-tight text-[#121A15] sm:text-[44px]">{usd(r.valor)}</p>
            <p className="mt-2 text-[16px] font-semibold text-[#3C4A42]">
              Entre <span className="font-numeric">{usd(r.desde)}</span> y <span className="font-numeric">{usd(r.hasta)}</span>
            </p>
            <p className="mt-3 text-[14.5px] leading-snug text-[#5B6B62]">
              {p.errorPropio
                ? `Lo medimos en ${zona.esCiudad ? zona.ciudad : zona.nombre}: la mitad de ${t.singular === 'casa' ? 'las casas publicadas' : `los ${t.plural} publicados`} está a menos de ${porcentaje(r.error)} de esta cuenta.`
                : `En ${zona.nombre} hay pocos avisos para medirlo aparte: en los barrios de ${zona.ciudad}, la mitad de lo publicado está a menos de ${porcentaje(r.error)} de esta cuenta.`}{' '}
              Es precio de publicación: el de venta lo fija la tasación.
            </p>
            {!(sinDatosDelBarrio && zona.clave === inicial) && (
              <ul className="mt-4 divide-y divide-[#E1E6E1] rounded-2xl bg-white px-4">
                {tipo === 'casa' && zona.mixto && p.tierraM2 != null && p.construccionM2 != null ? (
                  <>
                    <Dato valor={`${usd(p.tierraM2)}/m²`} texto="el terreno en el barrio" />
                    <Dato valor={`${usd(p.construccionM2)}/m²`} texto="la construcción, sin el terreno" />
                  </>
                ) : (
                  <Dato valor={`${usd(p.usdM2)}/m²`} texto={tipo === 'lote' ? 'de terreno en el barrio' : 'cubierto, en el barrio'} />
                )}
                <Dato valor={n(p.n)} texto={`${t.plural} ${t.publicadas} en la cuenta`} />
              </ul>
            )}
            {conLinkAlBarrio && slugBarrio && (
              <Link href={`/${modo}/${slugBarrio}`} className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-bold text-[#17613C] hover:underline">
                {modo === 'vender' ? `Vender ${t.tu} en ${zona.esCiudad ? zona.ciudad : zona.nombre}` : `Más sobre ${zona.esCiudad ? zona.ciudad : zona.nombre}`} →
              </Link>
            )}
          </>
        )}
      </div>

      <PedidoTasacion
        modo={modo}
        tipo={tipo}
        zona={zona}
        m2={m2Propio && metros > 0 ? metros : null}
        lote={tipo === 'casa' ? loteNum : null}
        antiguedad={tipo !== 'lote' && edadPropia && edad != null ? EDADES[edad].texto : null}
        rango={r ? { desde: r.desde, hasta: r.hasta } : null}
        avisos={p?.n ?? 0}
        onSinBarrio={abrirBuscador}
      />
    </div>
  )
}

function Dato({ valor, texto }: { valor: string; texto: string }) {
  return (
    <li className="flex items-baseline justify-between gap-3 py-2.5">
      <span className="text-[14px] leading-snug text-[#5B6B62]">{texto}</span>
      <span className="font-numeric flex-none text-[15.5px] font-semibold text-[#121A15]">{valor}</span>
    </li>
  )
}
