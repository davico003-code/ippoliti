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
  // La franja oscura continúa el hero de page.tsx con el MISMO alto que la del
  // dashboard (renglón de "Última actualización" incluido): si no, al llegar el
  // dashboard todo bajaba ~30 px (CLS 0,32 en compu).
  loading: () => (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="bg-[#0f0f0f] w-full">
        <div className="pb-16 md:pb-20">
          <p className="text-xs mt-3 h-4" />
        </div>
      </div>
    </div>
  ),
})

export default function InformesDashboardLazy() {
  return <InformesDashboard />
}
