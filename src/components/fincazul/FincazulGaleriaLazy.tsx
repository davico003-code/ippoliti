'use client'

// Wrapper client que dynamic-importa FincazulGaleria (lightbox client-only),
// para no cargar yet-another-react-lightbox en el First Load de la ruta.

import dynamic from 'next/dynamic'

const FincazulGaleria = dynamic(() => import('./FincazulGaleria'), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-gray-100" />,
})

export default function FincazulGaleriaLazy(props: {
  base: string
  items: string[]
  alt: string
  layout: 'renders' | 'fotos'
}) {
  return <FincazulGaleria {...props} />
}
