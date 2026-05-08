'use client'

// Wrapper client del NearbyPropertiesMap que fetchea las propiedades
// cercanas via /api/propiedades/nearby en lugar de recibirlas como prop.
// Antes el padre (PropertyDetailBody) computaba nearbyForMap a partir
// de allProperties (que viajaba en el RSC payload de la ficha), inflando
// el HTML mobile a ~10 MB. Ahora cada componente fetchea solo lo suyo.
//
// Estados: loading → skeleton del mapa, error → fallback con reintentar,
// success → render del mapa real.

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import type { NearbyProperty } from '@/lib/projections'

const NearbyPropertiesMap = dynamic(() => import('@/components/NearbyPropertiesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] rounded-xl bg-gray-100 animate-pulse" aria-hidden />
  ),
})

interface Props {
  lat: number
  lng: number
  excludeId: number
}

export default function NearbyPropertiesMapClient({ lat, lng, excludeId }: Props) {
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'error'; message: string }
    | { kind: 'success'; data: NearbyProperty[] }
  >({ kind: 'loading' })
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ kind: 'loading' })
    const url = `/api/propiedades/nearby?lat=${lat}&lng=${lng}&exclude=${excludeId}`
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => {
        if (cancelled) return
        const objs: NearbyProperty[] = d.objects ?? []
        setState({ kind: 'success', data: objs })
      })
      .catch(err => {
        if (cancelled) return
        setState({ kind: 'error', message: err instanceof Error ? err.message : 'unknown' })
      })
    return () => { cancelled = true }
  }, [lat, lng, excludeId, retryToken])

  if (state.kind === 'loading') {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="h-5 w-56 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-80 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="w-full h-[300px] md:h-[400px] rounded-xl bg-gray-100 animate-pulse" />
      </div>
    )
  }

  if (state.kind === 'error') {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-600 mb-3">No pudimos cargar el mapa de propiedades cercanas.</p>
        <button
          onClick={() => setRetryToken(t => t + 1)}
          className="text-sm font-semibold text-[#1A5C38] hover:text-[#0F3A23]"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (state.data.length === 0) return null

  return (
    <NearbyPropertiesMap lat={lat} lng={lng} nearbyProperties={state.data} />
  )
}
