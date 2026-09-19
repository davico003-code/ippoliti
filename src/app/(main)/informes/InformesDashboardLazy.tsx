'use client'

// Wrapper client mínimo que dynamic-importa InformesDashboard (recharts).
// Debe ser Client Component: en Next 14, dynamic(..., { ssr: false }) llamado
// desde un Server Component NO code-splittea — recharts + d3 (~113 kB gz)
// terminaban en el First Load JS de /informes. Mismo patrón que los mapas
// Leaflet (MapaBarriosLazy / PropertyMapLazy).
//
// ssr:false no pierde SEO: el dashboard fetchea todo client-side y la
// metadata de la ruta vive en page.tsx. El placeholder replica el wrapper
// exterior del dashboard (min-h-screen + mismo fondo) para evitar layout
// shift hasta que llega el chunk.

import dynamic from 'next/dynamic'

const InformesDashboard = dynamic(() => import('./InformesDashboard'), {
  ssr: false,
  // La franja oscura continúa el hero de page.tsx (pb-16 md:pb-20 del dashboard).
  loading: () => (
    <>
      <div className="bg-[#0f0f0f] h-16 md:h-20" />
      <div className="min-h-screen bg-[#f8f7f4]" />
    </>
  ),
})

export default function InformesDashboardLazy() {
  return <InformesDashboard />
}
