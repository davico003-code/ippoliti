import MapaDistritoRoldan from './MapaDistritoRoldan'
import { DESTINOS } from './destinos'

export default function SeccionUbicacion() {
  return (
    <section id="ubicacion" className="bg-[#F8F1E6] px-6 py-20 md:py-32">
      <div className="mx-auto max-w-[1320px] lg:px-2">
        <div className="mb-12 grid gap-5 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#B35E21]">Ubicación</p>
            <h2 className="mt-5 max-w-[17ch] text-balance text-[clamp(36px,5vw,68px)] font-extrabold leading-[1] tracking-[-0.035em] text-[#345544]">
              Sobre Ruta 9, a {DESTINOS.funes.min} minutos de Funes.
            </h2>
          </div>
          <p className="max-w-[46ch] text-lg leading-8 text-[#345544]/75 lg:justify-self-end">
            En Ruta Nacional 9 y María Auxiliadora: a {DESTINOS.roldan.min} minutos del centro de Roldán y a {DESTINOS.rosario.min} de
            Rosario. Tocá cada destino para ver el camino.
          </p>
        </div>

        <MapaDistritoRoldan />
      </div>
    </section>
  )
}
