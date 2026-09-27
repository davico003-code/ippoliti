import DisponibilidadVivo from './DisponibilidadVivo'
import FinanciacionLineas from './FinanciacionLineas'

export default function SeccionIntro() {
  return (
    <section id="proyecto" className="relative overflow-hidden bg-[#F8F1E6] px-6 py-20 md:py-28">
      <div aria-hidden className="absolute -right-20 top-10 h-80 w-80 text-[#345544]/[0.08]">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="5">
          <path d="M98 101C57 94 30 65 24 24c41 6 70 33 74 77Z" />
          <path d="M103 97c7-40 36-67 77-72-7 41-35 69-77 72Z" />
          <path d="M101 106c39 9 64 39 67 80-40-9-66-38-67-80Z" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-[1180px]">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
          <div>
            <p className="text-sm font-semibold text-[#B35E21]">Distrito Roldán</p>
            <h2 className="mt-4 max-w-[15ch] text-balance text-[clamp(36px,4.8vw,62px)] font-bold leading-[1.04] tracking-[-0.03em] text-[#345544]">
              Un proyecto para vivir, construir e invertir mejor.
            </h2>
          </div>
          <div className="max-w-[58ch] text-pretty text-[16px] leading-8 text-[#345544]/[0.85] lg:pt-8">
            <p>
              Un barrio abierto que integra vida residencial y actividad comercial sobre Ruta Nacional 9,
              en una zona consolidada de Roldán y a pocos minutos de Funes y Rosario.
            </p>
            <p className="mt-5">
              Calles amplias, forestación planificada y servicios subterráneos acompañan un trazado pensado
              para crecer con el entorno.
            </p>
            <FinanciacionLineas className="mt-6 space-y-1 font-semibold text-[#345544]" />
          </div>
        </div>

        <div className="mt-14">
          <DisponibilidadVivo />
        </div>
      </div>
    </section>
  )
}
