'use client'

// Todas las vistas 360° de Dock Garden a la vista, cada una con su portada:
// antes estaban escondidas detrás de las flechas del visor.

import { useState } from 'react'
import Image from 'next/image'
import { Rotate3d } from 'lucide-react'
import { RECORRIDOS_360, TIPOLOGIAS, urlRecorrido } from '@/lib/dockgarden'
import ViewerModal, { type Viewer } from '@/components/ViewerModal'
import { conCifras } from '@/components/emprendimiento/conCifras'

const NOMBRE = Object.fromEntries(TIPOLOGIAS.map(t => [t.id, t.nombre]))

export default function Recorridos360({ contenedor }: { contenedor: string }) {
  const [viewer, setViewer] = useState<Viewer | null>(null)

  return (
    <section id="recorridos-360" className="bg-white py-14 md:py-20">
      <div className={contenedor}>
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#1A5C38]">
          Recorridos <span className="font-numeric">360°</span>
        </p>
        <h2 className="mt-3 text-balance text-[clamp(28px,3.6vw,48px)] font-black leading-[1.05] tracking-[-0.02em] text-gray-900">
          Entrá a los departamentos
        </h2>
        <p className="mt-4 max-w-[65ch] text-pretty text-base leading-relaxed text-gray-600 md:text-[17px]">
          Tocá una vista y movete por el ambiente como si estuvieras adentro. Son los recorridos virtuales del
          desarrollador, con los muebles de muestra.
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {RECORRIDOS_360.map((r, i) => {
            const titulo = `${NOMBRE[r.tipologia]} · ${r.ambiente}`
            const ultimaSola = i === RECORRIDOS_360.length - 1 && RECORRIDOS_360.length % 2 === 1
            return (
              <li key={r.id} className={ultimaSola ? 'col-span-2 sm:col-span-1' : ''}>
                <button
                  type="button"
                  onClick={() => setViewer({ kind: 'tour', title: `Dock Garden — ${titulo} en 360°`, urls: [urlRecorrido(r.id)] })}
                  className="group block w-full overflow-hidden rounded-2xl border border-gray-200 bg-white text-left transition-shadow hover:shadow-md"
                  aria-label={`Recorrer ${titulo} en 360 grados`}
                >
                  <div className={`relative overflow-hidden ${ultimaSola ? 'aspect-[2/1] sm:aspect-square' : 'aspect-square'}`}>
                    <Image
                      src={r.foto}
                      alt={`${titulo}, vista 360° de Dock Garden`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-900 shadow-sm">
                      <Rotate3d className="h-4 w-4 text-[#1A5C38]" aria-hidden />
                      <span className="font-numeric">360°</span>
                    </span>
                  </div>
                  <div className="p-3.5 sm:p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#1A5C38]">{conCifras(NOMBRE[r.tipologia])}</p>
                    <p className="mt-0.5 text-[15px] font-semibold leading-snug text-gray-900 sm:text-base">{r.ambiente}</p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {viewer && <ViewerModal viewer={viewer} onClose={() => setViewer(null)} />}
    </section>
  )
}
