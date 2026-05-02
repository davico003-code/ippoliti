'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { RotateCcw } from 'lucide-react'
import Lightbox, { type ControllerRef } from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

interface Props {
  blueprints: string[]
}

export default function BlueprintGallery({ blueprints }: Props) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const lightboxRef = useRef<ControllerRef>(null)

  useEffect(() => { setMounted(true) }, [])

  if (blueprints.length === 0) return null

  const slides = blueprints.map(src => ({ src }))
  const isLast = blueprints.length > 1 && index >= blueprints.length - 1

  const restartButton = (
    <button
      key="restart-blueprints"
      type="button"
      onClick={() => {
        if (blueprints.length <= 1) return
        lightboxRef.current?.prev({ count: blueprints.length - 1 })
      }}
      aria-label="Volver al primer plano"
      className="yarl__button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 14px',
        height: 44,
        color: '#fff',
        fontFamily: "'Raleway', system-ui, sans-serif",
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      <RotateCcw className="w-4 h-4" />
      <span>Volver al inicio</span>
    </button>
  )

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {blueprints.map((bp, i) => (
          <button
            key={i}
            onClick={() => { setIndex(i); setOpen(true) }}
            className="relative h-52 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <Image
              src={bp}
              alt={`Plano ${i + 1}`}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300 p-2"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-brand-600 bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
                Ver plano
              </span>
            </div>
          </button>
        ))}
      </div>

      {mounted && createPortal(
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={index}
          controller={{ ref: lightboxRef, closeOnBackdropClick: true }}
          slides={slides}
          plugins={[Zoom]}
          on={{ view: ({ index: i }) => setIndex(i) }}
          carousel={{ finite: true }}
          animation={{ fade: 250, swipe: 200 }}
          zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
          styles={{
            container: { backgroundColor: '#000', zIndex: 99999 },
            button: { filter: 'none' },
          }}
          toolbar={{
            buttons: isLast ? [restartButton, 'close'] : ['close'],
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
            buttonPrev: blueprints.length <= 1 ? () => null : undefined,
            buttonNext: blueprints.length <= 1 ? () => null : undefined,
          }}
        />,
        document.body,
      )}
    </>
  )
}
