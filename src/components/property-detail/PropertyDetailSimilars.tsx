'use client'

// Bloque "Otras opciones para vos" — full-width debajo del grid de la
// ficha. Antes recibía allProperties como prop (las 237 viajaban en el
// RSC payload). Ahora hace fetch a /api/propiedades/similar?id=X que
// computa el algoritmo server-side (mismo que vivía acá) y devuelve
// solo el top 4 proyectado.

import { useEffect, useState } from 'react'
import type { TokkoProperty } from '@/lib/tokko'
import type { PropertyCardProjection } from '@/lib/projections'
import SimilarProperties from '../SimilarProperties'
import SectionBoundary from './SectionBoundary'

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; data: PropertyCardProjection[] }

export default function PropertyDetailSimilars({
  property,
  // Compat: PropertyPanel todavía pasa allProperties. Lo aceptamos pero
  // no lo usamos — la fuente de verdad es ahora el endpoint server-side.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  allProperties: _allProperties,
}: {
  property: TokkoProperty
  allProperties?: TokkoProperty[]
}) {
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ kind: 'loading' })
    fetch(`/api/propiedades/similar?id=${property.id}`)
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
  }, [property.id, retryToken])

  if (state.kind === 'loading') {
    return (
      <SectionBoundary name="similares">
        <section
          id="similares"
          className="bg-white rounded-2xl px-5 md:px-8 pt-6 pb-8 shadow-sm border border-gray-100 scroll-mt-32"
          aria-busy="true"
        >
          <div className="h-7 w-56 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="aspect-[16/9] bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-3/4 bg-gray-100 rounded" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </SectionBoundary>
    )
  }

  if (state.kind === 'error') {
    return (
      <SectionBoundary name="similares">
        <section
          id="similares"
          className="bg-white rounded-2xl px-5 md:px-8 py-6 shadow-sm border border-gray-100 scroll-mt-32"
        >
          <p className="text-sm text-gray-600 mb-3">No pudimos cargar las propiedades similares.</p>
          <button
            onClick={() => setRetryToken(t => t + 1)}
            className="text-sm font-semibold text-[#1A5C38] hover:text-[#0F3A23]"
          >
            Reintentar
          </button>
        </section>
      </SectionBoundary>
    )
  }

  if (state.data.length === 0) return null

  return (
    <SectionBoundary name="similares">
      <section
        id="similares"
        className="bg-white rounded-2xl px-5 md:px-8 pt-2 pb-8 shadow-sm border border-gray-100 scroll-mt-32"
      >
        {/* SimilarProperties espera TokkoProperty[]; PropertyCardProjection
            es asignable estructuralmente porque mantenemos el shape parcial
            de TokkoProperty con todos los campos que el componente lee. */}
        <SimilarProperties
          properties={state.data as unknown as TokkoProperty[]}
          currentPropertyId={property.id}
        />
      </section>
    </SectionBoundary>
  )
}
