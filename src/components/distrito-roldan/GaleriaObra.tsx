'use client'

// Fotos reales de la obra en grilla grande (las apaisadas ocupan dos tercios,
// las verticales un tercio), con visor a pantalla completa al tocar una. La
// aérea que ya muestra el comparador no se repite acá.
//
// El visor se baja recién cuando alguien abre una foto.

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Image from '@/components/Imagen'
import { Expand } from 'lucide-react'
import 'yet-another-react-lightbox/styles.css'
import { AVANCES_FOTOS, COMPARADOR } from './avancesObra'

const Lightbox = dynamic(() => import('yet-another-react-lightbox'), { ssr: false })

const FOTOS = AVANCES_FOTOS.filter((f) => f.src !== COMPARADOR.hoy.src)

export default function GaleriaObra() {
  const [abierto, setAbierto] = useState(false)
  const [indice, setIndice] = useState(0)

  return (
    <>
      <div className="grid grid-flow-dense grid-cols-2 gap-2 sm:gap-3 md:auto-rows-[190px] md:grid-cols-6 lg:auto-rows-[240px]">
        {FOTOS.map((foto, i) => (
          <button
            key={foto.src}
            type="button"
            onClick={() => {
              setIndice(i)
              setAbierto(true)
            }}
            aria-label={`Ampliar: ${foto.alt}`}
            className={`group relative overflow-hidden bg-[#345544]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B35E21] focus-visible:ring-offset-4 md:row-span-2 md:aspect-auto md:rounded-2xl ${
              foto.aspect === '3/2' ? 'col-span-2 aspect-[3/2] md:col-span-4' : 'col-span-1 aspect-[2/3] md:col-span-2'
            }`}
          >
            <Image
              src={foto.src}
              alt={foto.alt}
              fill
              sizes={foto.aspect === '3/2' ? '(max-width: 768px) 100vw, 880px' : '(max-width: 768px) 50vw, 440px'}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
            />
            <span className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F1E6] text-[#345544] opacity-90 shadow-sm transition-opacity group-hover:opacity-100">
              <Expand className="h-4 w-4" aria-hidden />
            </span>
          </button>
        ))}
      </div>

      {abierto && (
        <Lightbox
          open={abierto}
          close={() => setAbierto(false)}
          index={indice}
          slides={FOTOS.map((f) => ({ src: f.src, alt: f.alt }))}
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
