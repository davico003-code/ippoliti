// Wrapper server que dynamic-importa el cliente Leaflet (no funciona en SSR).
// Réplica del patrón de /barrios-privados (MapaBarrios.tsx).

import dynamic from 'next/dynamic'

const MapaDistritoRoldanClient = dynamic(() => import('./MapaDistritoRoldanClient'), {
  ssr: false,
  loading: () => (
    <div>
      {/* Placeholder del mapa: misma altura que el real para evitar layout shift. */}
      <div className="h-[380px] md:h-[520px] w-full rounded-3xl border-[0.5px] border-[#e8e3da] bg-[#e8e3da]" />
    </div>
  ),
})

export default function MapaDistritoRoldan() {
  return <MapaDistritoRoldanClient />
}
