// Wrapper server que dynamic-importa el cliente Leaflet (no funciona en SSR).
// Réplica del patrón de /barrios-privados (MapaBarrios.tsx).

import dynamic from 'next/dynamic'

const MapaDistritoRoldanClient = dynamic(() => import('./MapaDistritoRoldanClient'), {
  ssr: false,
  loading: () => (
    <div>
      {/* Placeholder del mapa: mismo aspect-ratio para evitar layout shift. */}
      <div className="aspect-[16/9] w-full rounded-3xl border-[0.5px] border-[#e8e3da] bg-[#e8e3da]" />
    </div>
  ),
})

export default function MapaDistritoRoldan() {
  return <MapaDistritoRoldanClient />
}
