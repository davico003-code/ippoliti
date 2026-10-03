'use client'

// Las tres plantas generales del edificio, completas (son láminas verticales:
// object-contain, sin recorte). Tocar una la abre en grande con zoom.

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { ZoomIn } from 'lucide-react'
import { TN_BASE } from '@/lib/tierra-nueva'

const PlanoZoom = dynamic(() => import('@/components/fisherton-work/PlanoZoom'), { ssr: false })

const PLANTAS = [
  { img: 'planos/pb.webp', titulo: 'Planta baja', texto: 'Ingreso, SUM, parrilla, pileta y 36 cocheras' },
  { img: 'planos/planta-13.webp', titulo: '1º y 3º piso', texto: '9 departamentos, de la A a la I' },
  { img: 'planos/planta-24.webp', titulo: '2º y 4º piso', texto: '9 departamentos, de la A a la I' },
]

export default function PlantasEdificio() {
  const [abierta, setAbierta] = useState<number | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANTAS.map((p, i) => (
          <button
            key={p.img}
            type="button"
            onClick={() => setAbierta(i)}
            className="group overflow-hidden rounded-3xl border border-gray-200 bg-white text-left transition-shadow hover:shadow-md"
            aria-label={`Ampliar ${p.titulo}`}
          >
            <div className="relative aspect-[4/5] bg-white">
              <Image src={`${TN_BASE}/${p.img}`} alt={`${p.titulo}, Condos Tierra Nueva`} fill className="object-contain p-3" sizes="(max-width: 640px) 100vw, 33vw" />
              <span className="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-900/80 text-white opacity-80 transition-opacity group-hover:opacity-100">
                <ZoomIn className="h-4 w-4" />
              </span>
            </div>
            <div className="border-t border-gray-100 px-5 py-4">
              <p className="font-bold text-gray-900">{p.titulo}</p>
              <p className="text-sm text-gray-500">{p.texto}</p>
            </div>
          </button>
        ))}
      </div>

      {abierta !== null && (
        <PlanoZoom
          index={abierta}
          onClose={() => setAbierta(null)}
          slides={PLANTAS.map((p) => ({ src: `${TN_BASE}/${p.img}`, width: 1400, height: 1794, title: p.titulo }))}
        />
      )}
    </>
  )
}
