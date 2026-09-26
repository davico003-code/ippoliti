'use client'

// Unidad tipo de Fisherton Work: croquis oficiales por planta con lo que hay
// en cada una. Tocar el croquis lo abre en grande con zoom para leer las cotas
// (el lightbox se carga recién al abrirlo, fuera del First Load de la ruta).

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { ZoomIn } from 'lucide-react'
import { FW_BASE } from '@/lib/fisherton-work'

const PlanoZoom = dynamic(() => import('./PlanoZoom'), { ssr: false })

const PLANTAS = [
  {
    id: 'pb',
    tab: 'Planta baja',
    titulo: 'Salón vidriado de 100 m²',
    img: 'croquis-planta-baja.jpg',
    w: 930,
    h: 1280,
    items: [
      ['Frente vidriado', '16 m de ancho de fachada'],
      ['Planta libre', 'Showroom, local o depósito según tu operación'],
      ['Núcleo de servicio', 'Escalera al entrepiso y baño'],
      ['Acceso vehicular', 'Calle propia de 4 m hasta el portón'],
    ],
  },
  {
    id: 'ep',
    tab: 'Entrepiso',
    titulo: 'Oficinas de 100 m²',
    img: 'croquis-entrepiso.jpg',
    w: 727,
    h: 1280,
    items: [
      ['Planta libre de oficinas', 'Para administración, ventas o atención'],
      ['Ventanal al frente', '13 m de superficie vidriada'],
      ['Separado de la operación', 'La oficina arriba, la mercadería abajo'],
      ['Mismo módulo', '200 m² cubiertos en total por unidad'],
    ],
  },
  {
    id: 'lote',
    tab: 'Lote completo',
    titulo: 'Lote de 400 m² (16 × 25 m)',
    img: 'croquis-planta-baja.jpg',
    w: 930,
    h: 1280,
    items: [
      ['Cocheras propias', '5 cocheras de 2,50 × 5 m dentro del lote'],
      ['Carga y descarga', 'Calle interna de 4 m hasta el salón'],
      ['Franja verde', 'Arbolado lateral en cada unidad'],
      ['FOS 0,60', 'Permite ocupar hasta 240 m² de planta'],
    ],
  },
] as const

export default function UnidadTipo() {
  const [tab, setTab] = useState(0)
  const [zoom, setZoom] = useState(false)
  const p = PLANTAS[tab]

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
      <div>
        <div role="tablist" aria-label="Plantas de la unidad" className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1">
          {PLANTAS.map((pl, i) => (
            <button
              key={pl.id}
              role="tab"
              type="button"
              aria-selected={tab === i}
              onClick={() => setTab(i)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-colors md:text-sm ${
                tab === i ? 'bg-[#1A5C38] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {pl.tab}
            </button>
          ))}
        </div>
        <h3 className="mt-6 text-2xl font-black leading-tight text-gray-900 md:text-3xl">{p.titulo}</h3>
        <ul className="mt-5 divide-y divide-gray-100 border-y border-gray-100">
          {p.items.map(([t, d]) => (
            <li key={t} className="flex items-start gap-4 py-3.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00754A]" />
              <div>
                <p className="text-[15px] font-bold text-gray-900">{t}</p>
                <p className="text-sm text-gray-500">{d}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            ['100 m²', 'Planta baja'],
            ['100 m²', 'Entrepiso'],
            ['5', 'Cocheras'],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl bg-gray-50 px-3 py-4 text-center">
              <p className="font-numeric text-xl font-bold text-gray-900 md:text-2xl">{v}</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setZoom(true)}
        className="group relative mx-auto block w-full max-w-md cursor-zoom-in overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-sm lg:max-w-none"
        aria-label={`Ampliar croquis: ${p.tab}`}
      >
        <div className="relative mx-auto aspect-[930/1100] w-full overflow-hidden">
          <Image
            key={p.img + p.id}
            src={`${FW_BASE}/${p.img}`}
            alt={`Fisherton Work — croquis ${p.tab.toLowerCase()}`}
            fill
            className="object-contain object-top"
            sizes="(max-width: 1024px) 90vw, 45vw"
          />
        </div>
        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/95 px-3 py-1.5 text-[11px] font-bold text-gray-600 shadow-sm">
          <ZoomIn className="h-3.5 w-3.5 text-[#1A5C38]" /> Ver cotas
        </span>
      </button>

      {zoom && (
        <PlanoZoom
          onClose={() => setZoom(false)}
          index={tab === 1 ? 1 : 0}
          slides={[
            { src: `${FW_BASE}/croquis-planta-baja.jpg`, width: 930, height: 1280, title: 'Planta baja · Esc. 1:100' },
            { src: `${FW_BASE}/croquis-entrepiso.jpg`, width: 727, height: 1280, title: 'Entrepiso · Esc. 1:100' },
            { src: `${FW_BASE}/masterplan-oficial.jpg`, width: 1179, height: 715, title: 'Masterplan oficial' },
          ]}
        />
      )}
    </div>
  )
}
