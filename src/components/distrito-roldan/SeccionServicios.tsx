import { Zap, Droplets, Flame, Construction, TreePine, Store } from 'lucide-react'

const ITEMS = [
  { Icon: Zap, titulo: 'Red Eléctrica', desc: 'Red eléctrica e iluminación eficiente.' },
  { Icon: Droplets, titulo: 'Agua Potable', desc: 'Red de agua potable conectada a toda la urbanización.' },
  { Icon: Flame, titulo: 'Gas Natural', desc: 'Conexión de gas natural disponible para cada lote.' },
  { Icon: Construction, titulo: 'Pavimento', desc: 'Cordón cuneta y pavimento en todas sus calles.' },
  { Icon: TreePine, titulo: 'Forestación', desc: 'Forestación planificada que aporta identidad y valor paisajístico.' },
  { Icon: Store, titulo: 'Área Comercial', desc: 'Comercios y servicios de cercanía dentro del barrio.' },
]

export default function SeccionServicios() {
  return (
    <section className="bg-white px-6 py-20 md:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-12 grid gap-6 lg:grid-cols-2 lg:items-end">
          <h2 className="max-w-[15ch] text-balance text-[clamp(34px,4.5vw,56px)] font-bold leading-[1.05] tracking-[-0.03em] text-[#345544]">
            Infraestructura para acompañar cada etapa.
          </h2>
          <p className="max-w-[52ch] text-[15px] leading-7 text-[#345544]/70 lg:justify-self-end">
            Solidez y diseño urbano que acompaña tu estilo de vida.
          </p>
        </div>

        <div className="grid border-b border-[#345544]/[0.15] md:grid-cols-2">
          {ITEMS.map(({ Icon, titulo, desc }) => (
            <div key={titulo} className="flex gap-5 border-t border-[#345544]/[0.15] py-7 md:px-7 md:odd:border-r">
              <Icon className="mt-0.5 h-7 w-7 shrink-0 text-[#B35E21]" strokeWidth={1.6} aria-hidden />
              <div>
                <h3 className="text-base font-semibold text-[#345544]">{titulo}</h3>
                <p className="mt-2 max-w-[46ch] text-sm leading-6 text-[#345544]/[0.65]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
