'use client'

// Wrapper client mínimo que dynamic-importa PlanosGallery (lightbox client-only).
// Mismo patrón que PhotoGalleryLazy: evita que yet-another-react-lightbox
// termine en el First Load JS de la ruta.

import dynamic from 'next/dynamic'
import type { Plano } from './PlanosGallery'

const PlanosGallery = dynamic(() => import('./PlanosGallery'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="aspect-[2482/1755] w-full animate-pulse rounded-2xl bg-gray-100" />
      ))}
    </div>
  ),
})

export default function PlanosGalleryLazy(props: { base: string; planos: Plano[] }) {
  return <PlanosGallery {...props} />
}
