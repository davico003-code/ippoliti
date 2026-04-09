import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getProperties, type TokkoProperty } from '@/lib/tokko'
import PropiedadesView from '@/components/PropiedadesView'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Propiedades | SI Inmobiliaria',
  description: 'Explorá todas nuestras propiedades en venta y alquiler en Roldán, Rosario y Funes.',
}

export default async function PropiedadesPage() {
  let properties: TokkoProperty[] = []
  try {
    const data = await getProperties({ limit: 100 })
    properties = data.objects ?? []
  } catch (err) {
    console.error('[propiedades] Error fetching properties:', err instanceof Error ? err.message : err)
  }

  return (
    <Suspense fallback={<PropiedadesSkeleton />}>
      <PropiedadesView properties={properties} />
    </Suspense>
  )
}

function PropiedadesSkeleton() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-white">
      <div className="h-[52px] border-b border-gray-200 bg-white" />
      <div className="flex flex-1 min-h-0">
        <div className="hidden md:flex flex-col w-[40%] border-r border-gray-200 overflow-hidden p-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-[152px] h-[112px] rounded-lg bg-gray-200 flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-2 py-1">
                <div className="h-3 w-1/3 bg-gray-200 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
                <div className="mt-auto h-4 w-1/3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 bg-gray-100 animate-pulse" />
      </div>
    </div>
  )
}
