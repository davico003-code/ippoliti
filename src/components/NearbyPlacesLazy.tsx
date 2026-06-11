'use client'

// Wrapper client mínimo que dynamic-importa NearbyPlaces (Overpass + observers).
// Debe ser Client Component: en Next 14, dynamic(..., { ssr: false }) llamado
// desde un Server Component NO code-splittea. NearbyPlaces ya difiere su fetch
// por IntersectionObserver; esto difiere además la descarga del chunk JS.

import dynamic from 'next/dynamic'

const NearbyPlaces = dynamic(() => import('@/components/NearbyPlaces'), { ssr: false })

export default function NearbyPlacesLazy(props: { lat: number; lng: number }) {
  return <NearbyPlaces {...props} />
}
