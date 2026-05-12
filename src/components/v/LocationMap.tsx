'use client'

// Wrapper que carga Leaflet on-demand. Los componentes de react-leaflet viven
// en LocationMapInner.tsx — Leaflet depende de window y rompe el SSR.

import dynamic from 'next/dynamic'

const Inner = dynamic(() => import('./LocationMapInner'), {
  ssr: false,
  loading: () => (
    <div
      className="locmap-loading"
      style={{
        height: 350,
        background: '#F3F3F3',
        borderRadius: 16,
      }}
      aria-hidden
    />
  ),
})

export default function LocationMap(props: { lat: number; lng: number }) {
  return <Inner {...props} />
}
