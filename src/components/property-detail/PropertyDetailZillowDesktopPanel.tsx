'use client'

// Panel zillow-style (mapa + listado) que se muestra encima de la ficha
// solo en desktop. Se monta lazy con ssr:false + gate por useMediaQuery
// para que mobile NO descargue el chunk de PropiedadesView (~80 KB) ni
// renderice las 237 cards en HTML.
//
// SSR: renderiza nada (gate inicial es false).
// Mobile en client: gate sigue false → nunca monta.
// Desktop en client: gate vira true post-hidratación → carga chunk →
// muestra el panel completo.

import dynamic from 'next/dynamic'
import type { TokkoProperty } from '@/lib/tokko'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const PropiedadesView = dynamic(
  () => import('@/components/PropiedadesView'),
  { ssr: false }
)

interface Props {
  allProperties: TokkoProperty[]
  initialPropertyId: number
}

export default function PropertyDetailZillowDesktopPanel({
  allProperties,
  initialPropertyId,
}: Props) {
  const isDesktopViewport = useMediaQuery('(min-width: 768px)')

  if (!isDesktopViewport) return null

  return (
    <div className="hidden md:block">
      <PropiedadesView properties={allProperties} initialPropertyId={initialPropertyId} />
    </div>
  )
}
