import MapaDistritoRoldan from './MapaDistritoRoldan'

export default function SeccionUbicacion() {
  return (
    <section id="ubicacion" className="bg-[#F8F1E6] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-12 grid gap-5 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="text-sm font-semibold text-[#B35E21]">Ubicación</p>
            <h2 className="mt-4 max-w-[16ch] text-balance text-[clamp(34px,4.5vw,56px)] font-bold leading-[1.05] tracking-[-0.03em] text-[#345544]">
            Excelente conectividad, a minutos de todo.
            </h2>
          </div>
          <p className="max-w-[52ch] text-[15px] leading-7 text-[#345544]/70 lg:justify-self-end">
            Sobre Ruta Nacional 9 y María Auxiliadora, con conexión directa hacia Roldán, Funes y Rosario.
          </p>
        </div>

        <MapaDistritoRoldan />
      </div>
    </section>
  )
}
