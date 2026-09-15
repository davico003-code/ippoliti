'use client'

import { useState } from 'react'
import { trackEvent, trackFbEvent } from '@/lib/analytics'

/**
 * Formulario CALIFICADOR de una propiedad (15-sep-2026). Reemplaza al enlace
 * directo a WhatsApp en la pauta de prueba: además de nombre y WhatsApp pide
 * cómo piensa pagar y para cuándo. Son las dos preguntas que la categoría de
 * vivienda no deja resolver por segmentación y que el CRM no tenía ("quiere
 * comprar pero no especificó qué"). Postea a /api/leads, que lo manda a Hilo
 * con la propiedad y los utm de la página; al enviar dispara el evento Lead del
 * píxel, que es a lo que optimiza el conjunto de Meta.
 */

const PAGO = ['Contado', 'Crédito hipotecario', 'Permuta (entrego una propiedad)', 'Todavía no lo sé'] as const
const PLAZO = ['Ya', 'En los próximos 3 meses', 'Este año', 'Solo estoy mirando'] as const

type Estado = 'idle' | 'sending' | 'sent' | 'error'

export default function ConsultaCalificadaForm({
  propertyId,
  hiloPropertyId,
  propertyTitle,
  propertyPrice,
  whatsappUrl,
  agente,
}: {
  propertyId: number
  hiloPropertyId: string | null
  propertyTitle: string
  propertyPrice: string
  whatsappUrl: string
  agente: string
}) {
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [pago, setPago] = useState<(typeof PAGO)[number] | ''>('')
  const [plazo, setPlazo] = useState<(typeof PLAZO)[number] | ''>('')
  const [estado, setEstado] = useState<Estado>('idle')
  const [error, setError] = useState<string | null>(null)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (estado === 'sending') return
    const digitos = whatsapp.replace(/\D/g, '')
    if (nombre.trim().length < 2) return setError('Contanos tu nombre.')
    if (digitos.length < 10) return setError('Tu WhatsApp: código de área + número, sin el 15 (ej. 341 555 1234).')
    if (!pago) return setError('Decinos cómo pensás pagar.')
    if (!plazo) return setError('Decinos para cuándo.')
    setError(null)
    setEstado('sending')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          whatsapp: digitos,
          origen: 'consulta_calificada',
          propertyId,
          hiloPropertyId,
          propertyTitle,
          propertyPrice,
          pago,
          plazo,
          pageUrl: window.location.href,
          eventType: 'property.inquiry',
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setEstado('sent')
      trackFbEvent('Lead', { content_name: propertyTitle, content_ids: [String(propertyId)], content_category: 'consulta_calificada' })
      trackEvent('generate_lead', { origen: 'consulta_calificada', pago, plazo })
    } catch {
      setEstado('error')
      setError('No pudimos enviar tu consulta. Probá de nuevo o escribinos por WhatsApp.')
    }
  }

  if (estado === 'sent') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-xl font-bold text-neutral-900">Listo, {nombre.trim()}.</p>
        <p className="mt-1 text-[15px] text-neutral-700">{agente} te escribe por WhatsApp en minutos con las condiciones y cómo seguir.</p>
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

  const pill = (activo: boolean) =>
    `flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 text-center text-[14px] font-semibold transition ${
      activo ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500'
    }`

  return (
    <form onSubmit={enviar} className="space-y-5" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">Nombre</span>
          <input
            type="text"
            autoComplete="name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="¿Cómo te llamás?"
            className="min-h-12 w-full rounded-xl border border-neutral-300 px-4 text-[15px] text-neutral-900 focus:border-neutral-900 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">WhatsApp</span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="341 555 1234"
            className="min-h-12 w-full rounded-xl border border-neutral-300 px-4 text-[15px] text-neutral-900 focus:border-neutral-900 focus:outline-none"
          />
        </label>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">¿Cómo pensás pagar?</legend>
        <div className="grid grid-cols-2 gap-2">
          {PAGO.map((op) => (
            <label key={op} className={pill(pago === op)}>
              <input type="radio" name="pago" value={op} checked={pago === op} onChange={() => setPago(op)} className="sr-only" />
              {op}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">¿Para cuándo?</legend>
        <div className="grid grid-cols-2 gap-2">
          {PLAZO.map((op) => (
            <label key={op} className={pill(plazo === op)}>
              <input type="radio" name="plazo" value={op} checked={plazo === op} onChange={() => setPlazo(op)} className="sr-only" />
              {op}
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="text-[14px] font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={estado === 'sending'}
        className="min-h-12 w-full rounded-xl bg-neutral-900 px-5 text-[15px] font-bold text-white transition hover:bg-neutral-800 disabled:opacity-60"
      >
        {estado === 'sending' ? 'Enviando…' : 'Quiero que me escriban'}
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
