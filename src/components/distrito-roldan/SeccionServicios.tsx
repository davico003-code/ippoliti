// Servicios e infraestructura, con una imagen grande al lado (22-oct-2026):
// la aérea del barrio terminado al anochecer, con las luminarias prendidas y
// los lotes vacíos (imagen ilustrativa, sin casas: para construir hay que
// terminar de pagar). Es la misma vista del comparador 2027, con la traza
// exacta del plano, re-iluminada (ver COMPARADOR en avancesObra.ts).
// "Sin expensas" va primero: lo confirmó David el 11-oct.

import Image from '@/components/Imagen'
import { Construction, Droplets, Flame, PiggyBank, Store, TreePine, Zap } from 'lucide-react'

const ITEMS = [
  { Icon: PiggyBank, titulo: 'Sin expensas', desc: 'Es un barrio abierto: no hay expensas que pagar todos los meses.' },
  { Icon: Zap, titulo: 'Red eléctrica', desc: 'Red eléctrica e iluminación eficiente.' },
  { Icon: Droplets, titulo: 'Agua potable', desc: 'Red de agua potable conectada a toda la urbanización.' },
  { Icon: Flame, titulo: 'Gas natural', desc: 'Conexión de gas natural disponible para cada lote.' },
  { Icon: Construction, titulo: 'Pavimento', desc: 'Cordón cuneta y pavimento en todas sus calles.' },
  { Icon: TreePine, titulo: 'Forestación', desc: 'Forestación planificada que aporta identidad y valor paisajístico.' },
  { Icon: Store, titulo: 'Área comercial', desc: 'Comercios y servicios de cercanía dentro del barrio.' },
]

export default function SeccionServicios() {
  return (
    <section className="bg-dr-fondo-alt py-20 md:py-32">
      <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[.95fr_1.05fr] lg:items-center lg:gap-20 lg:px-8">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#143125] md:mx-6 md:rounded-[28px] lg:mx-0">
          <Image
            src="/images/distrito-roldan/luces-2027-ilustrativa.webp"
            alt="Distrito Roldán terminado al anochecer, desde el aire: calles pavimentadas con las luminarias encendidas y los lotes listos para construir. Imagen ilustrativa"
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover"
          />
          <span className="absolute right-4 top-4 rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
            Imagen ilustrativa
          </span>
        </div>

        <div className="px-6 lg:px-0">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-dr-acento">Infraestructura</p>
          <h2 className="mt-5 max-w-[14ch] text-balance text-[clamp(36px,4.8vw,64px)] font-extrabold leading-[1] tracking-[-0.035em] text-dr-tinta">
            Todo resuelto. Y sin expensas.
          </h2>
          <ul className="mt-10 grid gap-x-8 sm:grid-cols-2">
            {ITEMS.map(({ Icon, titulo, desc }, i) => (
              <li key={titulo} className={`flex gap-4 border-t border-dr-tinta/[0.12] py-5 ${i === 0 ? 'sm:col-span-2' : ''}`}>
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    i === 0 ? 'bg-[#B35E21] text-white' : 'bg-dr-fondo text-dr-acento'
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                </span>
                <div>
                  <h3 className={`font-bold text-dr-tinta ${i === 0 ? 'text-xl' : 'text-base'}`}>{titulo}</h3>
                  <p className="mt-1 text-sm leading-6 text-dr-tinta/70">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
