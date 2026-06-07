'use client'

// Wrapper client mínimo que dynamic-importa PropertyMap (leaflet, no SSR).
// Debe ser Client Component: en Next 14, dynamic(..., { ssr: false }) llamado
// desde un Server Component (la página de emprendimientos) NO code-splittea —
// leaflet terminaba en el First Load JS de /emprendimientos/[slug].

import dynamic from 'next/dynamic'

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), { ssr: false })

interface Props {
  lat: number | null
  lng: number | null
  address: string
}

export default function PropertyMapLazy(props: Props) {
  return <PropertyMap {...props} />
}
