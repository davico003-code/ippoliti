import { Zap, Droplets, Flame, Construction, TreePine, Store } from 'lucide-react'

const RALEWAY = 'var(--font-raleway-distrito), Raleway, sans-serif'

const ITEMS = [
  { Icon: Zap, titulo: 'Red Eléctrica', desc: 'Iluminación eficiente subterránea en todas las calles.' },
  { Icon: Droplets, titulo: 'Agua Potable', desc: 'Red de agua potable conectada a toda la urbanización.' },
  { Icon: Flame, titulo: 'Gas Natural', desc: 'Conexión de gas natural disponible para cada lote.' },
  { Icon: Construction, titulo: 'Pavimento', desc: 'Cordón cuneta y pavimento en todas sus calles.' },
  { Icon: TreePine, titulo: 'Forestación', desc: 'Forestación planificada que aporta identidad y valor paisajístico.' },
  { Icon: Store, titulo: 'Área Comercial', desc: 'Comercios y servicios de cercanía dentro del barrio.' },
]

export default function SeccionServicios() {
  return (
    <section className="bg-white px-6 py-24 md:py-[120px]">
      <div className="mx-auto max-w-[1180px]">
        {/* Header */}
        <div className="mb-14 text-center">
          <h2
            className="text-[#0F3F26]"
            style={{ fontFamily: RALEWAY, fontWeight: 500, fontSize: 'clamp(34px, 4.5vw, 48px)' }}
          >
            Infraestructura y servicios
          </h2>
          <p className="mt-3 text-[#6b6b6b]" style={{ fontFamily: RALEWAY, fontWeight: 300, fontSize: 17 }}>
            Solidez y diseño urbano que acompaña tu estilo de vida.
          </p>
        </div>

        {/* Grid de servicios */}
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-3 max-[520px]:grid-cols-1">
          {ITEMS.map(({ Icon, titulo, desc }) => (
            <div key={titulo} className="text-center">
              <Icon className="mx-auto mb-4 h-12 w-12 text-[#1A5C38]" strokeWidth={1.5} />
              <h3 className="text-[16px] font-semibold tracking-[0.04em] text-[#0F3F26]" style={{ fontFamily: RALEWAY }}>
                {titulo}
              </h3>
              <p className="mx-auto mt-2 max-w-[260px] text-[13px] leading-[1.55] text-[#6b6b6b]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
