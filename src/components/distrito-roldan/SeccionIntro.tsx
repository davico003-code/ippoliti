const DATOS = [
  { numero: '159', label: 'Lotes residenciales', detalle: 'Desde 450 m²' },
  { numero: '21', label: 'Lotes comerciales', detalle: 'Promedio 630 m²' },
  { numero: '180', label: 'Lotes totales', detalle: 'Barrio abierto' },
]

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
            <p className="mt-6 font-semibold text-[#345544]">Entrega del 30% y saldo en 24 cuotas fijas en dólares.</p>
          </div>
        </div>

        <div className="mt-14 grid border-y border-[#345544]/20 sm:grid-cols-3">
          {DATOS.map((dato, index) => (
            <div
              key={dato.label}
              className={`py-7 sm:px-7 sm:py-9 ${index > 0 ? 'border-t border-[#345544]/20 sm:border-l sm:border-t-0' : ''}`}
            >
              <p className="text-[clamp(42px,5vw,66px)] font-medium leading-none tracking-[-0.04em] text-[#345544]">
                {dato.numero}
              </p>
              <p className="mt-3 font-semibold text-[#345544]">{dato.label}</p>
              <p className="mt-1 text-sm text-[#345544]/[0.65]">{dato.detalle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
