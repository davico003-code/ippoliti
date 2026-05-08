'use client'

// Panel zillow-style (mapa + listado) que se monta encima de la ficha
// solo en desktop. Antes recibía allProperties como prop (las 237 viajaban
// en el RSC payload de la ficha mobile aunque nunca se renderizaran).
// Ahora hace fetch a /api/propiedades/list-cards solo cuando el viewport
// es >= md, evitando que mobile descargue/serialice nada del listado.
//
// Estados:
//  - SSR + mobile en client: gate false → null (no monta, no fetch).
//  - Desktop client primer paint: gate vira true → fetch en paralelo,
//    skeleton del panel mientras llega.
//  - Success: render del PropiedadesView completo.
//  - Error: fallback con reintentar.

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { TokkoProperty } from '@/lib/tokko'
import type { PropertyCardProjection } from '@/lib/projections'

const PropiedadesView = dynamic(
  () => import('@/components/PropiedadesView'),
  { ssr: false }
)

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; data: PropertyCardProjection[] }

interface Props {
  initialPropertyId: number
}

export default function PropertyDetailZillowDesktopPanel({
  initialPropertyId,
}: Props) {
  const isDesktopViewport = useMediaQuery('(min-width: 768px)')
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    if (!isDesktopViewport) return
    let cancelled = false
    setState({ kind: 'loading' })
    fetch('/api/propiedades/list-cards')
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => {
        if (cancelled) return
        const objs: PropertyCardProjection[] = d.objects ?? []
        setState({ kind: 'success', data: objs })
      })
      .catch(err => {
        if (cancelled) return
        setState({ kind: 'error', message: err instanceof Error ? err.message : 'unknown' })
      })
    return () => { cancelled = true }
  }, [isDesktopViewport, retryToken])

  if (!isDesktopViewport) return null

  if (state.kind === 'loading' || state.kind === 'idle') {
    return (
      <div className="hidden md:block">
        <div className="h-[100dvh] lg:h-[calc(100dvh-var(--header-height))] flex items-stretch border-t border-gray-200">
          {/* Skeleton lateral (listado) */}
          <div className="w-full md:w-[48%] border-r border-gray-200 p-4 overflow-hidden">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-[14px] border border-gray-200 overflow-hidden bg-white animate-pulse">
                  <div className="aspect-[2/1] bg-gray-200" />
                  <div className="px-3 py-2 space-y-2">
                    <div className="h-5 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-3/4 bg-gray-100 rounded" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Skeleton del mapa */}
          <div className="hidden md:block flex-1 bg-gray-100 animate-pulse" />
        </div>
      </div>
    )
  }

  if (state.kind === 'error') {
    return (
      <div className="hidden md:block py-10 px-6">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-600 mb-3">No pudimos cargar el listado de propiedades.</p>
          <button
            onClick={() => setRetryToken(t => t + 1)}
            className="text-sm font-semibold text-[#1A5C38] hover:text-[#0F3A23]"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="hidden md:block">
      <PropiedadesView
        properties={state.data as unknown as TokkoProperty[]}
        initialPropertyId={initialPropertyId}
      />
    </div>
  )
}
