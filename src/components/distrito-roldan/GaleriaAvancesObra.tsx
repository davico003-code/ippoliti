'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Expand } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import HorizontalCarousel from '@/components/HorizontalCarousel'

const MES = {
  mes: 'Agosto 2026',
  descripcion: 'El trazado de calles ya se lee completo desde el aire y las máquinas avanzan con el movimiento de suelo.',
}

// Cada foto se muestra a su aspecto natural (las aéreas apaisadas, las de
// máquinas verticales) para que ninguna quede estirada ni recortada.
const FOTOS: { src: string; alt: string; aspect: '3/2' | '2/3' }[] = [
  { src: '/images/distrito-roldan/obra-5.webp', alt: 'Vista aérea de Distrito Roldán en agosto de 2026 con el trazado de calles completo', aspect: '3/2' },
  { src: '/images/distrito-roldan/obra-9.webp', alt: 'Vista cenital de un camión y una pala cargadora moviendo suelo en Distrito Roldán en agosto de 2026', aspect: '3/2' },
  { src: '/images/distrito-roldan/obra-7.webp', alt: 'Camión y pala cargadora trabajando en el predio de Distrito Roldán durante agosto de 2026', aspect: '2/3' },
  { src: '/images/distrito-roldan/obra-6.webp', alt: 'Predio de Distrito Roldán desde el aire con camiones trabajando en agosto de 2026', aspect: '3/2' },
  { src: '/images/distrito-roldan/obra-8.webp', alt: 'Retroexcavadora trabajando en la obra de Distrito Roldán durante agosto de 2026', aspect: '2/3' },
]

export default function GaleriaAvancesObra() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  return (
    <>
      <div className="mb-5 border-t border-[#345544]/25 pt-5">
        <h3 className="text-xl font-bold text-[#345544]">{MES.mes}</h3>
        <p className="mt-2 max-w-[60ch] text-sm leading-6 text-[#345544]/70">{MES.descripcion}</p>
      </div>

      <HorizontalCarousel className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 scrollbar-none sm:gap-4">
        {FOTOS.map((foto, fotoIndex) => (
          <button
            key={foto.src}
            type="button"
            onClick={() => { setIndex(fotoIndex); setOpen(true) }}
            aria-label={`Ampliar foto de ${MES.mes}`}
            className="group relative h-[260px] flex-none snap-start overflow-hidden bg-[#345544]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B35E21] focus-visible:ring-offset-4 sm:h-[340px] md:h-[420px]"
            style={{ aspectRatio: foto.aspect }}
          >
            <Image
              src={foto.src}
              alt={foto.alt}
              fill
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 60vw, 640px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
            />
            <span className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F1E6] text-[#345544] opacity-90 shadow-sm transition-opacity group-hover:opacity-100">
              <Expand className="h-4 w-4" aria-hidden />
            </span>
          </button>
        ))}
      </HorizontalCarousel>

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
