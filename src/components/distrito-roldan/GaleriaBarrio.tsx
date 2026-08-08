'use client'

// Carrusel de fotos reales del barrio, con visor a pantalla completa al tocar una.
//
// El carrusel se renderiza en el servidor (este componente se prerenderiza como
// cualquier client component), así las fotos viajan en el HTML y no hay salto
// de layout cuando hidrata. Lo único que se difiere es el visor: su código baja
// recién cuando alguien abre una foto, que es cuando hace falta.

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Expand } from 'lucide-react'
import 'yet-another-react-lightbox/styles.css'
import HorizontalCarousel from '@/components/HorizontalCarousel'

const Lightbox = dynamic(() => import('yet-another-react-lightbox'), { ssr: false })

interface Props {
  fotos: string[]
  /** Nombre del emprendimiento, para armar el texto alternativo. */
  proyecto: string
}

export default function GaleriaBarrio({ fotos, proyecto }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [indice, setIndice] = useState(0)

  if (!fotos.length) return null

  const alt = (i: number) =>
    `${proyecto} — foto ${i + 1} de ${fotos.length} del barrio, sobre Ruta 9 y María Auxiliadora, Roldán`

  return (
    <>
      <HorizontalCarousel className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 scrollbar-none sm:gap-4">
        {fotos.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => {
              setIndice(i)
              setAbierto(true)
            }}
            aria-label={`Ampliar la foto ${i + 1} de ${fotos.length}`}
            className="group relative aspect-[4/3] h-[240px] flex-none snap-start overflow-hidden bg-[#345544]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B35E21] focus-visible:ring-offset-4 sm:h-[300px] md:h-[360px]"
          >
            <Image
              src={src}
              alt={alt(i)}
              fill
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 55vw, 480px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
            />
            <span className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F1E6] text-[#345544] opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Expand className="h-4 w-4" aria-hidden />
            </span>
          </button>
        ))}
      </HorizontalCarousel>

      {abierto && (
        <Lightbox
          open={abierto}
          close={() => setAbierto(false)}
          index={indice}
          slides={fotos.map((src, i) => ({ src, alt: alt(i) }))}
          on={{ view: ({ index }) => setIndice(index) }}
          carousel={{ finite: true }}
          controller={{ closeOnBackdropClick: true }}
          animation={{ fade: 180, swipe: 220 }}
          styles={{ container: { backgroundColor: 'rgba(18, 38, 30, .96)' } }}
        />
      )}
    </>
  )
}
