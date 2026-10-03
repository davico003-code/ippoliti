'use client'

// Las 4 tipologías de Dock Garden en solapas: plano real, superficies
// desarmadas (departamento + cochera = total que figura en la lista de precios)
// y qué ambientes tiene. El 360° sale de Brickfy (lo resuelve el server).

import { useState } from 'react'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, Maximize2, Rotate3d } from 'lucide-react'
import type { Tipologia } from '@/lib/dockgarden'
import ViewerModal, { type Viewer } from '@/components/ViewerModal'
import { conCifras } from '@/components/emprendimiento/conCifras'

interface Props {
  tipologias: Tipologia[]
  /** Recorridos 360° por id de tipología (vacío si Brickfy no tiene). */
  tours: Record<string, string[]>
  contenedor: string
  /** Ancla de la lista de precios; sin esto no se muestra el link. */
  hrefPrecios?: string
}

export default function TipologiasDockGarden({ tipologias, tours, contenedor, hrefPrecios }: Props) {
  const [activa, setActiva] = useState(tipologias[0].id)
  const [viewer, setViewer] = useState<Viewer | null>(null)
  const t = tipologias.find(x => x.id === activa) ?? tipologias[0]
  const tour = tours[t.id] ?? []

  return (
    <section id="tipologias" className="bg-white py-14 md:py-20">
      <div className={contenedor}>
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#1A5C38]">Tipologías</p>
        <h2 className="mt-3 text-balance text-[clamp(28px,3.6vw,48px)] font-black leading-[1.05] tracking-[-0.02em] text-gray-900">
          Cómo es cada departamento
        </h2>
        <p className="mt-4 max-w-[65ch] text-pretty text-base leading-relaxed text-gray-600 md:text-[17px]">
          Hay <span className="font-numeric">{tipologias.length}</span> tipos de unidad. Todas tienen balcón o terraza
          propia y cochera incluida. Elegí una para ver el plano y cuántos metros tiene.
        </p>

        <div role="tablist" aria-label="Tipologías" className="mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {tipologias.map(x => (
            <button
              key={x.id}
              role="tab"
              aria-selected={x.id === t.id}
              aria-controls="tipologia-panel"
              onClick={() => setActiva(x.id)}
              className={`min-h-[44px] rounded-full px-5 text-[15px] font-bold transition-colors ${
                x.id === t.id
                  ? 'bg-[#1A5C38] text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {conCifras(x.nombre)}
            </button>
          ))}
        </div>

        <div
          id="tipologia-panel"
          role="tabpanel"
          className="mt-6 grid gap-6 rounded-3xl border border-gray-200 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-10 lg:p-8"
        >
          {/* Plano: toca para verlo grande */}
          <figure className="min-w-0">
            <button
              type="button"
              onClick={() => setViewer({ kind: 'images', title: `Dock Garden — Plano ${t.nombre}`, urls: [t.plano] })}
              className="group relative block w-full overflow-hidden rounded-2xl bg-white"
              aria-label={`Ver el plano de ${t.nombre} en grande`}
            >
              {/* Sin key: al cambiar de solapa queda el plano anterior hasta que carga el nuevo. */}
              <Image
                src={t.plano}
                alt={`Plano de la tipología ${t.nombre} de Dock Garden`}
                width={1400}
                height={1100}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="h-auto max-h-[560px] w-full object-contain"
              />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-gray-900/80 px-3 py-1.5 text-xs font-bold text-white">
                <Maximize2 className="h-3.5 w-3.5" aria-hidden /> Ver grande
              </span>
            </button>
            <figcaption className="mt-3 text-sm text-gray-500">
              Plano de referencia: {conCifras(t.referencia)}.
            </figcaption>
          </figure>

          <div className="min-w-0">
            <h3 className="text-2xl font-black tracking-[-0.01em] text-gray-900 md:text-[28px]">{conCifras(t.nombre)}</h3>

            {/* Superficies: la suma explica el total que figura en la lista. */}
            <dl className="mt-5 overflow-hidden rounded-2xl bg-gray-50">
              {t.superficies.map(s => (
                <div key={s.label} className="flex items-baseline justify-between gap-4 border-b border-gray-200/70 px-4 py-3">
                  <dt className="text-[15px] text-gray-600">{s.label}</dt>
                  <dd className="font-numeric text-[17px] font-semibold text-gray-900">{s.m2} m²</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 bg-[#1A5C38]/[0.07] px-4 py-3.5">
                <dt className="text-[15px] font-bold text-gray-900">Total</dt>
                <dd className="font-numeric text-2xl font-bold text-[#1A5C38]">{t.total} m²</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              En la lista de precios figura el total. Las medidas cambian un poco de una unidad a otra.
            </p>

            <ul className="mt-6 space-y-2.5">
              {t.ambientes.map(a => (
                <li key={a} className="flex gap-3 text-[15px] leading-snug text-gray-700 md:text-base">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1A5C38]" aria-hidden />
                  <span>{conCifras(a)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              {tour.length > 0 && (
                <button
                  type="button"
                  onClick={() => setViewer({ kind: 'tour', title: `Dock Garden — ${t.nombre} en 360°`, urls: tour })}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#1A5C38] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[#15472c]"
                >
                  <Rotate3d className="h-5 w-5" aria-hidden />
                  {/* Un solo hijo: el gap del flex separaba el texto de la cifra. */}
                  <span>Recorrerlo en <span className="font-numeric">360°</span></span>
                </button>
              )}
              {hrefPrecios && (
                <a
                  href={hrefPrecios}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border-2 border-gray-200 px-6 text-[15px] font-bold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Ver precios
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {viewer && <ViewerModal viewer={viewer} onClose={() => setViewer(null)} />}
    </section>
  )
}
