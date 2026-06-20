'use client'

// Wrapper del feedback de la ficha de detalle: agrupa caritas + slider de
// valuación + "avisame si baja". Una sola inyección en PropertyDetailBody
// (compartido por mobile y desktop). Hace UN fetch de estado inicial para
// restaurar lo que el visitante ya respondió. Todo detrás del flag.

import { useEffect, useState } from 'react'
import { FEEDBACK_ENABLED } from './flag'
import ReactFaces from './ReactFaces'
import ValuationSlider from './ValuationSlider'
import AvisameSiBaja from './AvisameSiBaja'

const RALEWAY = "'Raleway', system-ui, sans-serif"

interface EstadoInicial {
  react: string | null
  valuation: number | null
  objeciones: string[]
}

export default function FeedbackDetalle({
  propertyId,
  publishedPrice,
  currency,
}: {
  propertyId: number
  /** Precio publicado numérico. <= 0 → sin slider de valuación. */
  publishedPrice: number
  currency: string
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
      className="rounded-2xl p-6 shadow-sm border border-gray-100"
      style={{ background: '#FAF7F2' }}
      aria-label="Tu opinión sobre esta propiedad"
    >
      <h2 style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 18, color: '#24292B', margin: '0 0 4px' }}>
        Tu opinión nos sirve
      </h2>
      <p style={{ fontFamily: RALEWAY, fontSize: 13, color: '#6b7280', margin: '0 0 18px' }}>
        Anónimo y en segundos. Nos ayuda a ajustar la propuesta.
      </p>

      <div className="space-y-6">
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

        <AvisameSiBaja propertyId={propertyId} valuacion={currentValuacion} />
      </div>
    </section>
  )
}
