'use client'

// Wrapper neutro que carga Leaflet on-demand client-side. La parte que importa
// react-leaflet vive en NeutralMapInner.tsx para evitar que leaflet entre al
// bundle SSR (depende de window) y para mantener este wrapper como una API
// chica y server-friendly.

import dynamic from 'next/dynamic'

const Inner = dynamic(() => import('./NeutralMapInner'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 280,
        background: '#F3F3F3',
        borderRadius: 12,
      }}
      aria-hidden
    />
  ),
})

export default function NeutralMap(props: { lat: number; lng: number }) {
  return <Inner {...props} />
}
