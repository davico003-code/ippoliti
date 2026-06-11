'use client'

// Wrapper client mínimo que dynamic-importa PhotoGallery (lightbox client-only).
// Debe ser Client Component: en Next 14, dynamic(..., { ssr: false }) llamado
// desde un Server Component (la página de emprendimientos) NO code-splittea —
// yet-another-react-lightbox terminaba en el First Load JS de la ruta.
// Mismo patrón que PropertyMapLazy / MapaBarriosLazy.

import dynamic from 'next/dynamic'

const PhotoGallery = dynamic(() => import('@/components/PhotoGallery'), {
  ssr: false,
  loading: () => <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-gray-100" />,
})

interface Props {
  photos: string[]
  alt: string
  variant?: 'default' | 'distrito'
}

export default function PhotoGalleryLazy(props: Props) {
  return <PhotoGallery {...props} />
}
