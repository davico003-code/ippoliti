'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Expand } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

const MESES = [
  {
    mes: 'Marzo 2026',
    descripcion: 'Vista aérea del predio y su entorno al inicio de los trabajos.',
    fotos: [
      { src: '/images/distrito-roldan/obra-1.webp', alt: 'Vista aérea del avance de obra de Distrito Roldán en marzo de 2026' },
      { src: '/images/distrito-roldan/obra-2.webp', alt: 'Predio de Distrito Roldán visto desde el aire en marzo de 2026' },
    ],
  },
  {
    mes: 'Julio 2026',
    descripcion: 'Apertura de calles, movimiento de suelo y tendido de infraestructura.',
    fotos: [
      { src: '/images/distrito-roldan/obra-3.webp', alt: 'Apertura de calles en Distrito Roldán durante julio de 2026' },
      { src: '/images/distrito-roldan/obra-4.webp', alt: 'Maquinaria y cañerías en la obra de Distrito Roldán durante julio de 2026' },
    ],
  },
]

const FOTOS = MESES.flatMap((mes) => mes.fotos)

export default function GaleriaAvancesObra() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  return (
    <>
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
        {MESES.map((mes, mesIndex) => (
          <article key={mes.mes}>
            <div className="mb-5 border-t border-[#345544]/25 pt-5">
              <h3 className="text-xl font-bold text-[#345544]">{mes.mes}</h3>
              <p className="mt-2 max-w-[48ch] text-sm leading-6 text-[#345544]/70">{mes.descripcion}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {mes.fotos.map((foto, fotoIndex) => {
                const globalIndex = mesIndex * 2 + fotoIndex
                return (
                  <button
                    key={foto.src}
                    type="button"
                    onClick={() => { setIndex(globalIndex); setOpen(true) }}
                    aria-label={`Ampliar foto de ${mes.mes}`}
                    className="group relative aspect-[9/16] overflow-hidden bg-[#345544]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B35E21] focus-visible:ring-offset-4"
                  >
                    <Image
                      src={foto.src}
                      alt={foto.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 290px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
                    />
                    <span className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F1E6] text-[#345544] opacity-90 shadow-sm transition-opacity group-hover:opacity-100">
                      <Expand className="h-4 w-4" aria-hidden />
                    </span>
                  </button>
                )
              })}
            </div>
          </article>
        ))}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={FOTOS.map((foto) => ({ src: foto.src, alt: foto.alt }))}
        on={{ view: ({ index: current }) => setIndex(current) }}
        carousel={{ finite: true }}
        controller={{ closeOnBackdropClick: true }}
        animation={{ fade: 180, swipe: 220 }}
        styles={{ container: { backgroundColor: 'rgba(18, 38, 30, .96)' } }}
      />
    </>
  )
}
