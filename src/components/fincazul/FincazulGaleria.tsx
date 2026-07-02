'use client'

// Grilla de imágenes de Fincazul (renders o fotos reales) que conserva el
// layout "bento" de la landing (primera imagen grande) y, al hacer click,
// abre la galería en un lightbox fullscreen con zoom y navegación.

import { useState } from 'react'
import Image from 'next/image'
import { Expand } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

type Layout = 'renders' | 'fotos'

interface Props {
  base: string
  items: string[]
  alt: string
  layout: Layout
}

const CONFIG: Record<Layout, { grid: string; tile: string; first: string; rest: string }> = {
  renders: {
    grid: 'grid grid-cols-2 md:grid-cols-3 gap-3',
    tile: 'relative rounded-xl overflow-hidden bg-gray-100 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500',
    first: 'col-span-2 md:col-span-2 md:row-span-2 aspect-[16/10] md:aspect-auto',
    rest: 'aspect-[4/3]',
  },
  fotos: {
    grid: 'grid grid-cols-3 gap-2.5',
    tile: 'relative rounded-lg overflow-hidden bg-gray-200 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500',
    first: 'col-span-3 aspect-[16/9]',
    rest: 'aspect-square',
  },
}

export default function FincazulGaleria({ base, items, alt, layout }: Props) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const cfg = CONFIG[layout]

  const slides = items.map((src) => ({ src: `${base}/${src}` }))

  return (
    <>
      <div className={cfg.grid}>
        {items.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => { setIndex(i); setOpen(true) }}
            aria-label={`Ampliar ${alt} ${i + 1}`}
            className={`${cfg.tile} ${i === 0 ? cfg.first : cfg.rest}`}
          >
            <Image
              src={`${base}/${src}`}
              alt={`${alt} ${i + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes={i === 0 ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 50vw, 33vw'}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
            <span className="absolute bottom-2.5 right-2.5 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/85 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
              <Expand className="w-4 h-4" />
            </span>
          </button>
        ))}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
        on={{ view: ({ index: i }) => setIndex(i) }}
        carousel={{ finite: true }}
        animation={{ fade: 220, swipe: 200 }}
        controller={{ closeOnBackdropClick: true }}
        styles={{ container: { backgroundColor: 'rgba(0,0,0,0.94)' }, button: { filter: 'none' } }}
        render={{
          buttonPrev: items.length <= 1 ? () => null : undefined,
          buttonNext: items.length <= 1 ? () => null : undefined,
        }}
      />
    </>
  )
}
