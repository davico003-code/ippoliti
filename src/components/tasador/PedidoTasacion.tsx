'use client'

// EL PEDIDO DE TASACIÓN, ahí mismo, debajo del valor (David, 8-oct-2026:
// "quiero que me lluevan las tasaciones"). Antes el botón mandaba a
// /tasaciones a repetir barrio y tipo; ahora se abre acá con todo lo que la
// persona ya cargó (barrio, metros, antigüedad y el rango que vio) y le llega
// al corredor en el lead de Hilo. Nombre y WhatsApp; el plazo es opcional.
// Misma medición que /tasaciones: Lead SOLO cuando el servidor confirmó.

import { useEffect, useId, useRef, useState } from 'react'
import { trackEvent, trackFbCustomEvent, trackFbEvent } from '@/lib/analytics'
import { celularArValido, normalizarCelularAr, PLAZOS_VENTA } from '@/lib/tasacion/formato'
import type { PlazoVenta, UtmTasacion } from '@/lib/tasacion/types'
import { TEXTO_TIPO, TIPO_PEDIDO, type OpcionTasar, type TipoTasar } from '@/lib/tasador/opciones'

type Props = {
  modo: 'tasar' | 'vender'
  tipo: TipoTasar
  zona: OpcionTasar | null
  m2: number | null
  lote: number | null
  antiguedad: string | null
  rango: { desde: number; hasta: number } | null
  avisos: number
  /** Sin barrio elegido: llevar a la persona al buscador. */
  onSinBarrio: () => void
}

type Estado = 'cerrado' | 'abierto' | 'listo'

function leerUtm(): UtmTasacion | null {
  const sp = new URLSearchParams(window.location.search)
  const g = (k: string) => sp.get(k)?.slice(0, 150) || null
  const utm = { source: g('utm_source'), medium: g('utm_medium'), campaign: g('utm_campaign'), content: g('utm_content') }
  return utm.source || utm.medium || utm.campaign || utm.content ? utm : null
}

const input =
  'h-[54px] w-full rounded-2xl border-[1.5px] border-[#E1E6E1] bg-white px-4 text-[16px] font-medium text-[#121A15] placeholder:text-[#A6AFAA] focus:border-[#17613C] focus:outline-none focus:ring-4 focus:ring-[#17613C]/10 aria-[invalid=true]:border-[#C2410C]'

export default function PedidoTasacion({ modo, tipo, zona, m2, lote, antiguedad, rango, avisos, onSinBarrio }: Props) {
  const t = TEXTO_TIPO[tipo]
  const [estado, setEstado] = useState<Estado>('cerrado')
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [plazo, setPlazo] = useState<PlazoVenta | null>(null)
  const [tocado, setTocado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const enviandoRef = useRef(false)
  const listoRef = useRef<HTMLDivElement>(null)
  // El formulario se achica al confirmar: el "Listo" queda a la vista.
  useEffect(() => {
    if (estado === 'listo') listoRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [estado])
  const ids = { nombre: useId(), tel: useId(), errTel: useId(), errNombre: useId(), honey: useId() }

  const lugar = zona ? (zona.esCiudad ? zona.ciudad : zona.nombre) : ''
  const digitos = normalizarCelularAr(whatsapp)
  const telValido = celularArValido(digitos)
  const nombreValido = nombre.trim().length >= 2
  const errTel = !tocado || telValido ? null : digitos === '' ? 'Necesitamos tu WhatsApp para escribirte.' : 'Son 10 dígitos con el código de área (341, 3476…), sin el 15.'
  const errNombre = tocado && !nombreValido ? 'Poné tu nombre para saber a quién escribirle.' : null

  const abrir = () => {
    if (!zona) {
      onSinBarrio()
      return
    }
    setEstado('abierto')
    trackFbCustomEvent('TasacionContacto', { barrio: zona.nombre, tipo, origen: modo })
    trackEvent('tasacion_contacto', { barrio: zona.nombre, tipo, origen: `tasador-${modo}` })
    requestAnimationFrame(() => document.getElementById(ids.nombre)?.focus({ preventScroll: true }))
  }

  const irA = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.focus()
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setTocado(true)
    if (!nombreValido) return irA(ids.nombre)
    if (!telValido) return irA(ids.tel)
    if (!zona || enviandoRef.current) return
    enviandoRef.current = true
    setEnviando(true)
    setError(null)
    const honeypot = (document.getElementById(ids.honey) as HTMLInputElement | null)?.value ?? ''
    try {
      const res = await fetch('/api/tasacion/solicitud', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          whatsapp: digitos,
          website: honeypot,
          // El barrio de la lista de Hilo lo resuelve el servidor (barrioId vacío).
          tasacion: {
            barrioId: '',
            barrioNombre: zona.esCiudad ? zona.ciudad : zona.nombre,
            ciudad: zona.ciudad,
            esCerrado: null,
            tipo: TIPO_PEDIDO[tipo],
            m2Cubiertos: tipo === 'lote' ? null : m2,
            m2Lote: tipo === 'lote' ? m2 : lote,
            rangoVisto: rango ? { min: rango.desde, max: rango.hasta } : null,
            // 3 = estimado por m² (Hilo escribe "estimado por m² sobre N casas"); 1-2 son
            // comparables parecidos de /tasaciones y acá serían falsos. 4 = sin número.
            nivel: rango ? 3 : 4,
            n: avisos,
            lat: null,
            lng: null,
            plazo,
            antiguedad,
            utm: leerUtm(),
            paginaUrl: window.location.href.slice(0, 500),
          },
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error || 'No pudimos enviar tu pedido. Probá de nuevo en unos segundos; tus datos quedan cargados.')
        return
      }
      // Solo acá: el servidor confirmó que Hilo recibió el pedido.
      trackFbEvent('Lead', { content_name: 'Tasación', barrio: zona.nombre, plazo: plazo ?? '' })
      trackEvent('tasacion_pedido', { barrio: zona.nombre, tipo, plazo: plazo ?? '', origen: `tasador-${modo}` })
      setEstado('listo')
    } catch {
      setError('Parece que no hay conexión. Revisá internet y probá de nuevo; tus datos quedan cargados.')
    } finally {
      enviandoRef.current = false
      setEnviando(false)
    }
  }

  if (estado === 'listo') {
    return (
      <div ref={listoRef} role="status" className="mt-4 rounded-[20px] bg-[#17613C] p-5 text-white sm:p-6">
        <p className="font-raleway text-[21px] font-extrabold leading-tight">¡Listo, {nombre.trim().split(' ')[0]}!</p>
        <p className="mt-1.5 text-[15.5px] leading-relaxed text-white/90">
          Un corredor del equipo te escribe por WhatsApp en menos de 24 h para ver {t.tu}{lugar ? ` en ${lugar}` : ''}.
        </p>
      </div>
    )
  }

  const titulo = modo === 'vender' ? `Vendé ${t.tu} con nosotros` : `¿Pensás vender ${t.tu}?`
  const bajada =
    modo === 'vender'
      ? `Empezamos por la tasación: un corredor matriculado la hace con lo que se vendió${lugar ? ` en ${lugar}` : ' en tu barrio'} y te recomienda a qué precio salir. Sin compromiso.`
      : `Un corredor matriculado te la tasa con lo que se vendió${lugar ? ` en ${lugar}` : ' en tu barrio'}. Te escribimos por WhatsApp en menos de 24 h. Sin compromiso.`

  return (
    <div className="mt-4 rounded-[20px] bg-[#17613C] p-5 text-white sm:p-6">
      <p className="font-raleway text-[20px] font-extrabold leading-tight">{titulo}</p>
      <p className="mt-1.5 text-[15px] leading-snug text-white/85">{bajada}</p>

      {estado === 'cerrado' ? (
        <button type="button" onClick={abrir} className="si-tap mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-[16px] font-bold text-[#17613C] sm:w-auto">
          {modo === 'vender' ? 'Quiero vender' : 'Quiero la tasación'}
        </button>
      ) : (
        <form onSubmit={enviar} noValidate className="mt-4 rounded-2xl bg-white p-4 text-[#121A15] sm:p-5">
          <p className="mb-3 rounded-xl bg-[#F3F7F4] px-3.5 py-2.5 text-[14px] font-semibold text-[#3C4A42]">
            {t.corto} en {lugar}
            {m2 ? <span className="font-numeric"> · {m2.toLocaleString('es-AR')} m²</span> : null}
          </p>
          <label htmlFor={ids.nombre} className="block text-[14px] font-bold text-[#3C4A42]">
            Nombre
          </label>
          <input
            id={ids.nombre}
            type="text"
            autoComplete="given-name"
            autoCapitalize="words"
            enterKeyHint="next"
            value={nombre}
            onChange={(e) => setNombre(e.target.value.slice(0, 80))}
            placeholder="¿Cómo te llamás?"
            aria-invalid={errNombre ? true : undefined}
            aria-describedby={errNombre ? ids.errNombre : undefined}
            className={`${input} mt-1.5`}
          />
          {errNombre && (
            <p id={ids.errNombre} className="mt-1.5 text-[13px] font-medium text-[#C2410C]">
              {errNombre}
            </p>
          )}

          <label htmlFor={ids.tel} className="mt-4 block text-[14px] font-bold text-[#3C4A42]">
            WhatsApp
          </label>
          <div className="relative mt-1.5">
            <span aria-hidden="true" className="font-numeric pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 border-r-[1.5px] border-[#E1E6E1] pr-3 text-[16px] font-medium text-[#3C4A42]">
              +54 9
            </span>
            <input
              id={ids.tel}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              enterKeyHint="send"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/[^\d\s-]/g, '').slice(0, 16))}
              placeholder="341 …"
              aria-label="WhatsApp, sin el +54 9"
              aria-invalid={errTel ? true : undefined}
              aria-describedby={ids.errTel}
              className={`${input} font-numeric pl-[92px]`}
            />
          </div>
          <p id={ids.errTel} className={`mt-1.5 text-[13px] font-medium ${errTel ? 'text-[#C2410C]' : 'text-[#6B766E]'}`}>
            {errTel ?? 'Código de área + número, sin el 15. Ej.: 341 555 1234.'}
          </p>

          <fieldset className="mt-4">
            <legend className="text-[14px] font-bold text-[#3C4A42]">
              ¿Cuándo pensás vender? <span className="font-medium text-[#6B766E]">(opcional)</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {PLAZOS_VENTA.map((x) => (
                <button
                  key={x.v}
                  type="button"
                  aria-pressed={plazo === x.v}
                  onClick={() => setPlazo(plazo === x.v ? null : x.v)}
                  className={`min-h-10 rounded-full border-[1.5px] px-3.5 text-[14px] font-semibold transition-colors ${plazo === x.v ? 'border-[#17613C] bg-[#17613C] text-white' : 'border-[#E1E6E1] text-[#3C4A42] hover:border-[#17613C]/50'}`}
                >
                  {x.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Honeypot anti-bot: invisible y fuera del tab order. */}
          <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
            <label htmlFor={ids.honey}>Sitio web</label>
            <input id={ids.honey} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-[#F3E2BF] bg-[#FFF7E8] px-3.5 py-2.5 text-[13.5px] font-medium text-[#7A5A16]">
              {error}
            </p>
          )}

          <button type="submit" disabled={enviando} aria-busy={enviando} className="si-tap mt-5 inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[#17613C] px-6 text-[16px] font-bold text-white disabled:opacity-70">
            {enviando ? 'Enviando…' : 'Pedir la tasación'}
          </button>
          <p className="mt-2.5 text-center text-[12.5px] font-medium text-[#6B766E]">Tus datos se usan solo para esta tasación.</p>
        </form>
      )}
    </div>
  )
}
