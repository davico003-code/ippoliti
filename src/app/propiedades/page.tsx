import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getProperties, type TokkoProperty } from '@/lib/tokko'
import PropiedadesView from '@/components/PropiedadesView'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Propiedades | SI Inmobiliaria',
  description: 'Explorá todas nuestras propiedades en venta y alquiler en Roldán, Rosario y Funes.',
}

export default async function PropiedadesPage() {
  let properties: TokkoProperty[] = []
  try {
    const data = await getProperties({ limit: 100 })
    properties = data.objects ?? []
  } catch {}

  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>}>
      <PropiedadesView properties={properties} />
    </Suspense>
  )
}
