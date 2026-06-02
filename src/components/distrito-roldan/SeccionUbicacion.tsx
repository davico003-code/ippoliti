import MapaDistritoRoldan from './MapaDistritoRoldan'

const RALEWAY = 'var(--font-raleway-distrito), Raleway, sans-serif'

export default function SeccionUbicacion() {
  return (
    <section className="bg-[#F4EFE5] px-6 py-24 md:py-[120px]">
      <div className="mx-auto max-w-[1180px]">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-[680px] text-center">
          <p className="uppercase text-[#B8935A]" style={{ fontFamily: RALEWAY, fontWeight: 600, letterSpacing: '0.24em', fontSize: 12 }}>
            Ubicación
          </p>
          <h2
            className="mt-4 text-[#0F3F26]"
            style={{ fontFamily: RALEWAY, fontWeight: 500, fontSize: 'clamp(34px, 4.5vw, 52px)', lineHeight: 1.15 }}
          >
            Excelente conectividad, a minutos de todo.
          </h2>
        </div>

        {/* Mapa interactivo (Leaflet + OSRM) */}
        <MapaDistritoRoldan />
      </div>
    </section>
  )
}
