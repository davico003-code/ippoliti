'use client'

import { useEffect } from 'react'
import { events } from '@/lib/analytics'

type EventKey =
  | 'recursos_index_view'
  | 'calculadora_costos_view'
  | 'calculadora_ajuste_view'

const FIRE: Record<EventKey, () => void> = {
  recursos_index_view: events.recursosIndexView,
  calculadora_costos_view: events.calculadoraCostosView,
  calculadora_ajuste_view: events.calculadoraAjusteView,
}

export default function TrackPageView({ event }: { event: EventKey }) {
  useEffect(() => {
    FIRE[event]?.()
  }, [event])

  return null
}
