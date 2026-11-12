// La obra: primero el comparador "hoy / agosto 2027" a lo ancho, después las
// fotos reales del mes en grilla grande. Reemplaza a "La obra, mes a mes", que
// mostraba las fotos en un carrusel de 260 px.

import ComparadorHoy2027 from './ComparadorHoy2027'
import GaleriaObra from './GaleriaObra'
import { AVANCES_MES } from './avancesObra'

export default function SeccionObra() {
  return (
    <section id="avances" className="bg-dr-fondo-alt py-20 md:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:gap-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-dr-etiqueta">La obra</p>
            <h2 className="mt-5 text-balance text-[clamp(38px,5.4vw,76px)] font-extrabold leading-[1] tracking-[-0.035em] text-dr-tinta">
              Así está hoy. Así va a estar en agosto de 2027.
            </h2>
          </div>
          <p className="max-w-[48ch] text-pretty text-lg leading-8 text-dr-tinta/80">
            Es la misma toma desde el drone. Arrastrá la barra: de un lado, la obra de {AVANCES_MES.mes.toLowerCase()}; del otro, el
            barrio con las calles, las luces y los árboles terminados.
          </p>
        </div>
      </div>

      {/* A lo ancho en el celular; con margen y bordes redondeados en la compu. */}
      <div className="mx-auto mt-12 max-w-[1320px] md:px-6 lg:px-8">
        <ComparadorHoy2027 />
      </div>

      <div className="mx-auto mt-20 max-w-[1320px] px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-dr-tinta/20 pt-6">
          <h3 className="text-2xl font-bold tracking-[-0.02em] text-dr-tinta md:text-3xl">Ya entraron las máquinas</h3>
          <p className="max-w-[60ch] text-sm leading-6 text-dr-tinta/70 md:text-base">
            {AVANCES_MES.mes} · {AVANCES_MES.descripcion}
          </p>
        </div>
        <GaleriaObra />
      </div>
    </section>
  )
}
