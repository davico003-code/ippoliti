'use client'

// Wrapper del feedback de la ficha de detalle: UNA tarjeta compacta. Primero
// "¿Comprarías esta casa?" (Sí · Tal vez · No); con Sí/Tal vez se abre
// "¿Cuánto pagarías?" (slider), con No "¿Qué te frena?". El "Avisame si baja"
// vive solo bajo el precio de la ficha: acá no se repite.
// Una sola inyección en PropertyDetailBody (compartido mobile + desktop). Hace
// UN fetch de estado inicial para restaurar lo respondido. Todo detrás del flag.

import { useEffect, useState } from 'react'
import { FEEDBACK_ENABLED } from './flag'
import IntencionCompra, { intencionDesdeReact, preguntaIntencion, type Intencion } from './IntencionCompra'
import ValuationSlider from './ValuationSlider'

interface EstadoInicial {
  react: string | null
  valuation: number | null
  objeciones: string[]
}

export default function FeedbackDetalle({
  propertyId,
  publishedPrice,
  currency,
  tipo,
  alquiler,
}: {
  propertyId: number
  /** Precio publicado numérico. <= 0 → sin slider de valuación. */
  publishedPrice: number
  currency: string
  /** Nombre del tipo publicado ("Casa", "Lote"…): arma "¿Comprarías esta casa?". */
  tipo: string
  /** Alquiler (permanente o temporario) → "¿Alquilarías…?". */
  alquiler: boolean
}) {
  const [estado, setEstado] = useState<EstadoInicial | null>(null)
  const [intencion, setIntencion] = useState<Intencion | null>(null)

  useEffect(() => {
    if (!FEEDBACK_ENABLED) return
    let cancelled = false
    fetch(`/api/feedback/estado?propertyId=${propertyId}`, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return
        setIntencion(intencionDesdeReact(d?.react ?? null))
        setEstado({
          react: d?.react ?? null,
          valuation: d?.valuation ?? null,
          objeciones: Array.isArray(d?.objeciones) ? d.objeciones : [],
        })
      })
      .catch(() => {
        if (!cancelled) setEstado({ react: null, valuation: null, objeciones: [] })
      })
    return () => {
      cancelled = true
    }
  }, [propertyId])

  if (!FEEDBACK_ENABLED) return null
  // Esperamos el estado inicial para no “saltar” el resaltado de caritas/slider.
  if (!estado) return null

  const hasPrice = publishedPrice > 0
  const pregunta = preguntaIntencion(tipo, alquiler)

  return (
    <section
      aria-label="Tu opinión sobre esta propiedad"
      className="rounded-2xl border border-gray-200 bg-white px-4 sm:px-5"
    >
      <div className="flex items-baseline justify-between pt-3.5">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-gray-400">
          Tu opinión
        </span>
        <span className="text-[10.5px] text-gray-400">Anónima · 2 segundos</span>
      </div>

      <div className="divide-y divide-gray-100">
        <IntencionCompra
          propertyId={propertyId}
          pregunta={pregunta}
          intencion={intencion}
          onChange={setIntencion}
          initialObjeciones={estado.objeciones}
        />

        {hasPrice && (intencion === 'si' || intencion === 'tal_vez') && (
          <ValuationSlider
            propertyId={propertyId}
            publishedPrice={publishedPrice}
            currency={currency}
            initialValor={estado.valuation}
            initialObjeciones={estado.objeciones}
          />
        )}

      </div>
    </section>
  )
}
