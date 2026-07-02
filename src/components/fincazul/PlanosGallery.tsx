'use client'

// Grilla de planos de Fincazul con lightbox + ZOOM (rueda / pinch / doble
// click): los planos son láminas A3 con mucho detalle y en la card no se
// leen las medidas — este visor permite agrandarlos hasta 5x.

import { useState } from 'react'
import Image from 'next/image'
import { ZoomIn } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

export interface Plano {
  src: string
  label: string
}

interface Props {
  base: string
  planos: Plano[]
}

export default function PlanosGallery({ base, planos }: Props) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const slides = planos.map((p) => ({
    src: `${base}/${p.src}`,
    width: 2482,
    height: 1755,
    title: p.label,
  }))

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {planos.map((p, i) => (
          <figure key={p.src} className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => { setIndex(i); setOpen(true) }}
              className="group relative block w-full cursor-zoom-in"
              aria-label={`Ampliar plano: ${p.label}`}
            >
              <div className="relative aspect-[2482/1755] bg-white">
                <Image
                  src={`${base}/${p.src}`}
                  alt={`Fincazul — ${p.label}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 border border-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-600 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5" style={{ color: '#1A5C38' }} /> Ampliar
              </span>
            </button>
            <figcaption
              className="px-5 py-3 text-[13px] font-semibold text-gray-600 border-t border-gray-100"
              style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}
            >
              {p.label}
            </figcaption>
          </figure>
        ))}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 5,
          scrollToZoom: true,
          doubleClickMaxStops: 3,
          wheelZoomDistanceFactor: 120,
          pinchZoomDistanceFactor: 120,
        }}
        on={{ view: ({ index: i }) => setIndex(i) }}
        carousel={{ finite: true }}
        animation={{ fade: 200, swipe: 200 }}
        controller={{ closeOnBackdropClick: true }}
        styles={{ container: { backgroundColor: 'rgba(255,255,255,0.98)' }, button: { filter: 'none', color: '#1A5C38' } }}
      />
    </>
  )
}
