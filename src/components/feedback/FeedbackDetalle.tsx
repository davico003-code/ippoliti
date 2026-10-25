'use client'

// Wrapper del feedback de la ficha de detalle: UNA tarjeta compacta con tres
// filas (caritas · valuación · avisame si baja) separadas por líneas finas.
// El "avisame si baja" de acá es el viejo (queda en Redis, lo ve el panel): si
// la ficha ya muestra el de abajo del precio (Hilo + emBlue), no se repite, y
// sin precio publicado tampoco va (no hay precio que pueda bajar).
// Una sola inyección en PropertyDetailBody (compartido mobile + desktop). Hace
// UN fetch de estado inicial para restaurar lo respondido. Todo detrás del flag.

import { useEffect, useState } from 'react'
import { FEEDBACK_ENABLED } from './flag'
import ReactFaces from './ReactFaces'
import ValuationSlider from './ValuationSlider'
import AvisameSiBaja from './AvisameSiBaja'

interface EstadoInicial {
  react: string | null
  valuation: number | null
  objeciones: string[]
}

export default function FeedbackDetalle({
  propertyId,
  publishedPrice,
  currency,
  ocultarAvisame = false,
}: {
  propertyId: number
  /** Precio publicado numérico. <= 0 → sin slider de valuación ni aviso de baja. */
  publishedPrice: number
  currency: string
  /** true cuando la ficha ya muestra su "Avisame si baja" bajo el precio: uno solo por ficha. */
  ocultarAvisame?: boolean
}) {
  const [estado, setEstado] = useState<EstadoInicial | null>(null)
  const [valuacionActual, setValuacionActual] = useState<number | null>(null)

  useEffect(() => {
    if (!FEEDBACK_ENABLED) return
    let cancelled = false
    fetch(`/api/feedback/estado?propertyId=${propertyId}`, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return
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
  const currentValuacion = valuacionActual ?? estado.valuation

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
        <ReactFaces propertyId={propertyId} initialChoice={estado.react} />

        {hasPrice && (
          <ValuationSlider
            propertyId={propertyId}
            publishedPrice={publishedPrice}
            currency={currency}
            initialValor={estado.valuation}
            initialObjeciones={estado.objeciones}
            onValuationChange={setValuacionActual}
          />
        )}

        {hasPrice && !ocultarAvisame && <AvisameSiBaja propertyId={propertyId} valuacion={currentValuacion} />}
      </div>
    </section>
  )
}
