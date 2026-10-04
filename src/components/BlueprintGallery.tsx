'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { FileText, Maximize2 } from 'lucide-react'
import { esPlanoPdf, planoParaCaja } from '@/lib/planos'
import { usePantallaVertical } from '@/hooks/usePantallaVertical'

interface Props {
  blueprints: string[]
}

// Planos de la ficha (3-oct-2026, pedido de David: "uno mira los planos y no
// distingue nada"). Hilo los manda sin márgenes y, para el celular, PARADOS
// (lib/planos.ts):
//  · Celular derecho: carrusel con cada plano en una caja alta que ocupa casi
//    toda la pantalla, en su versión parada.
//  · Compu (o celular acostado): grilla con la versión horizontal.
//  · Tocar → pantalla completa con zoom, en la versión que llena esa pantalla.
//  · Un plano en PDF no es imagen (salía roto): tarjeta "Ver plano en PDF".
export default function BlueprintGallery({ blueprints }: Props) {
  const parada = usePantallaVertical()
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  if (blueprints.length === 0) return null

  const imagenes = blueprints.filter((u) => !esPlanoPdf(u))
  const pdfs = blueprints.filter(esPlanoPdf)
  const abrir = (i: number) => { setIndex(i); setOpen(true) }
  const slides = imagenes.map((src) => ({ src: planoParaCaja(src, parada) }))

  return (
    <>
      {imagenes.length > 0 && (parada
        ? <CarruselParado imagenes={imagenes} onAbrir={abrir} />
        : <GrillaHorizontal imagenes={imagenes} onAbrir={abrir} />)}

      {pdfs.length > 0 && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${imagenes.length > 0 ? 'mt-3' : ''}`}>
          {pdfs.map((url, i) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <FileText size={22} strokeWidth={1.6} aria-hidden />
              <span className="underline underline-offset-2">
                Ver plano en PDF{pdfs.length > 1 ? ` ${i + 1}` : ''}
              </span>
              <span className="ml-auto text-xs font-normal text-gray-500">Se abre aparte</span>
            </a>
          ))}
        </div>
      )}

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
        plugins={[Zoom]}
        on={{ view: ({ index: i }) => setIndex(i) }}
        carousel={{ finite: false, padding: 8 }}
        animation={{ fade: 250, swipe: 200 }}
        controller={{ closeOnBackdropClick: true }}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
        styles={{
          container: { backgroundColor: 'rgba(0,0,0,0.95)' },
          button: { filter: 'none' },
        }}
        render={{
          iconPrev: () => (
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </div>
          ),
          iconNext: () => (
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          ),
          iconClose: () => (
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </div>
          ),
          buttonPrev: imagenes.length <= 1 ? () => null : undefined,
          buttonNext: imagenes.length <= 1 ? () => null : undefined,
        }}
      />
    </>
  )
}

/** Celular derecho: un plano por pantalla, alto, deslizando de costado. */
function CarruselParado({ imagenes, onAbrir }: { imagenes: string[]; onAbrir: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [activo, setActivo] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth)
      setActivo(Math.min(Math.max(i, 0), imagenes.length - 1))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [imagenes.length])

  return (
    // -mx-4: le gana el aire de la tarjeta para que el plano use todo el ancho.
    <div className="relative -mx-4">
      <div
        ref={ref}
        className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {imagenes.map((bp, i) => (
          <button
            key={bp}
            type="button"
            onClick={() => onAbrir(i)}
            aria-label={`Ver plano ${i + 1} en pantalla completa`}
            className="relative shrink-0 basis-full snap-center bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            // Caja alta: el plano parado la llena (≈ 2/3 de la pantalla).
            style={{ height: 'min(72svh, 145vw)' }}
          >
            <Image
              src={planoParaCaja(bp, true)}
              alt={`Plano ${i + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </button>
        ))}
      </div>

      <span
        aria-hidden
        className="pointer-events-none absolute right-6 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white/95 shadow-sm"
      >
        <Maximize2 size={15} color="#111" />
      </span>

      {imagenes.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden>
          {imagenes.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-200"
              style={{ width: i === activo ? 18 : 6, background: i === activo ? '#1A1A1A' : '#D4D4D4' }}
            />
          ))}
        </div>
      )}
      <p className="mt-2 text-center text-[13px] text-gray-600">
        {imagenes.length > 1 ? 'Deslizá para ver los otros · ' : ''}Tocá el plano para agrandarlo
      </p>
    </div>
  )
}

/** Compu: grilla de planos horizontales. */
function GrillaHorizontal({ imagenes, onAbrir }: { imagenes: string[]; onAbrir: (i: number) => void }) {
  return (
    <div className={`grid grid-cols-1 gap-3 ${imagenes.length > 1 ? 'sm:grid-cols-2' : ''}`}>
      {imagenes.map((bp, i) => (
        <button
          key={bp}
          type="button"
          onClick={() => onAbrir(i)}
          className={`relative ${imagenes.length > 1 ? 'h-72' : 'h-[28rem]'} bg-white rounded-lg overflow-hidden border border-gray-100 group cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-brand-500`}
        >
          <Image
            src={bp}
            alt={`Plano ${i + 1}`}
            fill
            className="object-contain p-2 group-hover:scale-[1.03] transition-transform duration-300"
            sizes={imagenes.length > 1 ? '(max-width: 640px) 100vw, 50vw' : '100vw'}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-brand-600 bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
              Ver plano
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
