'use client'

import { useEffect, useRef, useState } from 'react'
import { idEventoMeta, trackEvent, trackFbEvent } from '@/lib/analytics'
import { escribirContacto, leerContacto } from '@/lib/feed-en-red'
import { haptico } from '@/lib/haptico'
import { celularArValido, normalizarCelularAr } from '@/lib/tasacion/formato'

/**
 * Formulario CALIFICADOR de una propiedad (15-sep-2026). Reemplaza al enlace
 * directo a WhatsApp en la pauta de prueba: además de nombre y WhatsApp pide
 * cómo piensa pagar y para cuándo. Son las dos preguntas que la categoría de
 * vivienda no deja resolver por segmentación y que el CRM no tenía ("quiere
 * comprar pero no especificó qué"). Postea a /api/leads, que lo manda a Hilo
 * con la propiedad y los utm de la página; al enviar dispara el evento Lead del
 * píxel, que es a lo que optimiza el conjunto de Meta.
 *
 * `preguntas={false}` (4-oct-2026, "Pedí que te contactemos" de la ficha): solo
 * nombre y apellido + WhatsApp, para el que no quiere escribir pero sí que lo
 * contacten. Mismo envío a Hilo, con su `origen`.
 */

const PAGO = ['Contado', 'Crédito hipotecario', 'Permuta (entrego una propiedad)', 'Todavía no lo sé'] as const
const PLAZO = ['Ya', 'En los próximos 3 meses', 'Este año', 'Solo estoy mirando'] as const
// En un alquiler no se paga con hipoteca ni con permuta: lo que califica a un
// inquilino es la garantía y para cuándo se muda. Viajan en los mismos campos
// pago/plazo y /api/leads los etiqueta "Garantía" / "Mudanza" para Hilo.
const PAGO_ALQ = ['Garantía propietaria', 'Seguro de caución', 'Todavía no lo sé'] as const
const PLAZO_ALQ = ['Ya', 'En 1–2 meses', 'Estoy mirando'] as const

/** ¿Es un alquiler? La operación de la página manda; si no llega, el título ("Casa en alquiler…"). */
function esDeAlquiler(operacion: string | undefined, titulo: string): boolean {
  if (operacion) return /^alquiler/i.test(operacion.trim())
  return /\balquiler\b/i.test(titulo) && !/\bventa\b/i.test(titulo)
}

type Estado = 'idle' | 'sending' | 'sent' | 'error'

export default function ConsultaCalificadaForm({
  propertyId,
  hiloPropertyId,
  propertyTitle,
  propertyPrice,
  whatsappUrl,
  agente,
  preguntas = true,
  origen = 'consulta_calificada',
  boton = 'Quiero que me escriban',
  operacion,
}: {
  propertyId: number
  hiloPropertyId: string | null
  propertyTitle: string
  propertyPrice: string
  whatsappUrl: string
  agente: string
  /** Cómo paga y para cuándo (la pauta). Sin ellas: nombre y WhatsApp solos. */
  preguntas?: boolean
  origen?: string
  boton?: string
  /** La operación de la propiedad (getOperationType): en alquiler cambian las preguntas. */
  operacion?: string
}) {
  const alquiler = esDeAlquiler(operacion, propertyTitle)
  const opcionesPago: readonly string[] = alquiler ? PAGO_ALQ : PAGO
  const opcionesPlazo: readonly string[] = alquiler ? PLAZO_ALQ : PLAZO
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [pago, setPago] = useState('')
  const [plazo, setPlazo] = useState('')
  const [estado, setEstado] = useState<Estado>('idle')
  const [error, setError] = useState<string | null>(null)
  // Honeypot anti-bot (mismo campo `website` que el pedido de tasación).
  const trampa = useRef<HTMLInputElement>(null)

  // Lo que ya dejó en este navegador (el mismo contacto que el WhatsApp con
  // datos, la visita y el mazo): no se lo volvemos a pedir. Sin pisar lo que
  // haya empezado a escribir.
  useEffect(() => {
    const c = leerContacto()
    if (c.nombre) setNombre((n) => n || c.nombre)
    if (c.whatsapp) setWhatsapp((w) => w || c.whatsapp)
  }, [])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (estado === 'sending') return
    // Mismo validador que el pedido de tasación y el servidor: 10 dígitos con el
    // código de área, sacando 0, 15 y +54 9 si los puso.
    const digitos = normalizarCelularAr(whatsapp)
    if (nombre.trim().length < 2) return setError(preguntas ? 'Contanos tu nombre.' : 'Contanos tu nombre y apellido.')
    if (!celularArValido(digitos)) return setError('Tu WhatsApp: código de área + número, sin el 15 (ej. 341 555 1234).')
    if (preguntas && !pago) return setError(alquiler ? 'Decinos qué garantía tenés.' : 'Decinos cómo pensás pagar.')
    if (preguntas && !plazo) return setError(alquiler ? 'Decinos para cuándo te mudás.' : 'Decinos para cuándo.')
    // Vibra dentro del toque (antes del primer await): en iPhone solo así se siente.
    haptico()
    setError(null)
    setEstado('sending')
    // Mismo id para el píxel y para la Conversions API (Hilo): Meta cuenta UNA consulta.
    const metaEventId = idEventoMeta()
    let res: Response
    try {
      res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          whatsapp: digitos,
          origen,
          propertyId,
          hiloPropertyId,
          propertyTitle,
          propertyPrice,
          ...(preguntas ? { pago, plazo, ...(alquiler ? { operacion: 'alquiler' } : {}) } : {}),
          pageUrl: window.location.href,
          eventType: 'property.inquiry',
          metaEventId,
          website: trampa.current?.value ?? '',
        }),
      })
    } catch {
      setEstado('error')
      setError('Parece que no hay conexión. Revisá internet y probá de nuevo, o escribinos por WhatsApp.')
      return
    }
    const data = (await res.json().catch(() => ({}))) as { metaEventId?: string; error?: string }
    if (!res.ok) {
      // El servidor ya arma un mensaje humano (429 "Esperá un momento", 400 del
      // WhatsApp, 502 "Reintentá"): se muestra ese y no uno genérico.
      setEstado('error')
      setError(data.error || 'No pudimos enviar tu consulta. Probá de nuevo o escribinos por WhatsApp.')
      return
    }
    // Ya nos dejó sus datos: si después toca WhatsApp, no se los volvemos a pedir.
    escribirContacto({ nombre: nombre.trim(), whatsapp: digitos })
    // Confirmación extra para Android (en iPhone, después del await, no vibra).
    haptico(true)
    setEstado('sent')
    trackFbEvent('Lead', { content_name: propertyTitle, content_ids: [String(propertyId)], content_category: origen }, data.metaEventId ?? metaEventId)
    trackEvent('generate_lead', { origen, ...(preguntas ? { pago, plazo } : {}) })
  }

  // Si el envío falla, la salida es WhatsApp con la consulta ya escrita: el
  // mismo saludo del agente + lo que eligió acá, para no tener que repetirlo.
  const whatsappConConsulta = (() => {
    const extra = [
      nombre.trim() ? `Soy ${nombre.trim()}.` : '',
      preguntas && pago ? `${alquiler ? 'Garantía' : 'Pago'}: ${pago}.` : '',
      preguntas && plazo ? `${alquiler ? 'Mudanza' : 'Para cuándo'}: ${plazo}.` : '',
    ].filter(Boolean).join(' ')
    try {
      const u = new URL(whatsappUrl)
      const texto = [u.searchParams.get('text') ?? '', extra].filter(Boolean).join('\n\n')
      // Se conservan los demás parámetros (api.whatsapp.com/send lleva el número
      // en ?phone=): solo se reemplaza el texto. encodeURIComponent y no
      // searchParams.set, que codifica el espacio como "+" y WhatsApp lo muestra literal.
      u.searchParams.delete('text')
      const resto = u.searchParams.toString()
      return `${u.origin}${u.pathname}?${resto ? `${resto}&` : ''}text=${encodeURIComponent(texto)}`
    } catch {
      return whatsappUrl
    }
  })()

  if (estado === 'sent') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-xl font-bold text-neutral-900">Listo, {nombre.trim()}.</p>
        <p className="mt-1 text-[15px] text-neutral-700">
          {/* Sin nombre en el pedido de contacto: en las propiedades del broker y en
              emprendimientos la consulta rota entre los agentes de la sucursal. */}
          {preguntas ? `${agente} te escribe por WhatsApp en minutos con las condiciones y cómo seguir.` : 'Te contactamos por WhatsApp a la brevedad.'}
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#25D366] px-5 text-[15px] font-bold text-white hover:brightness-105"
        >
          Si querés, escribile ahora por WhatsApp
        </a>
      </div>
    )
  }

  // El radio es sr-only: el anillo de foco se dibuja en la pastilla cuando el
  // foco viene del teclado (has-[:focus-visible], no focus-within, para que no
  // aparezca al tocar con el dedo). Con 3 opciones, la última ocupa el renglón.
  const pill = (activo: boolean) =>
    `flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 text-center text-[14px] font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#1A5C38] has-[:focus-visible]:ring-offset-2 [&:last-child:nth-child(odd)]:col-span-2 ${
      activo ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500'
    }`

  return (
    <form onSubmit={enviar} className="space-y-5" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">{preguntas ? 'Nombre' : 'Nombre y apellido'}</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            autoCapitalize="words"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={preguntas ? '¿Cómo te llamás?' : 'Nombre y apellido'}
            className="min-h-12 w-full rounded-xl border border-neutral-300 px-4 text-[15px] text-neutral-900 focus:border-neutral-900 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">WhatsApp</span>
          <input
            type="tel"
            name="tel"
            inputMode="tel"
            autoComplete="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="341 555 1234"
            className="min-h-12 w-full rounded-xl border border-neutral-300 px-4 text-[15px] text-neutral-900 focus:border-neutral-900 focus:outline-none"
          />
        </label>
      </div>

      {preguntas && <>
      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{alquiler ? '¿Qué garantía tenés?' : '¿Cómo pensás pagar?'}</legend>
        <div className="grid grid-cols-2 gap-2">
          {opcionesPago.map((op) => (
            <label key={op} className={pill(pago === op)}>
              <input type="radio" name="pago" value={op} checked={pago === op} onChange={() => setPago(op)} className="sr-only" />
              {op}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{alquiler ? '¿Para cuándo te mudás?' : '¿Para cuándo?'}</legend>
        <div className="grid grid-cols-2 gap-2">
          {opcionesPlazo.map((op) => (
            <label key={op} className={pill(plazo === op)}>
              <input type="radio" name="plazo" value={op} checked={plazo === op} onChange={() => setPlazo(op)} className="sr-only" />
              {op}
            </label>
          ))}
        </div>
      </fieldset>
      </>}

      {/* Honeypot anti-bot: invisible, fuera del tab order y sin autocompletar. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Sitio web
          <input ref={trampa} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {error ? (
        <p role="alert" className="text-[14px] font-medium text-red-700">
          {error}
        </p>
      ) : null}

      {estado === 'error' ? (
        <a
          href={whatsappConConsulta}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-[#25D366] bg-transparent px-5 text-[15px] font-bold text-neutral-900 transition-colors hover:bg-[#25D366]/10"
        >
          Escribinos por WhatsApp
        </a>
      ) : null}

      <button
        type="submit"
        disabled={estado === 'sending'}
        className="min-h-12 w-full rounded-xl bg-neutral-900 px-5 text-[15px] font-bold text-white transition hover:bg-neutral-800 disabled:opacity-60"
      >
        {estado === 'sending' ? 'Enviando…' : boton}
      </button>
      <p className="text-center text-xs text-neutral-500">
        Solo WhatsApp, sin llamados. Sin compromiso.{' '}
        <a href="/privacidad" className="underline">
          Política de privacidad
        </a>
      </p>
    </form>
  )
}
