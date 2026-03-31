'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

interface Props {
  photos: string[]
  alt: string
}

export default function PhotoGallery({ photos, alt }: Props) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleOpen = useCallback((i: number) => {
    setIndex(i)
    setOpen(true)
  }, [])

  if (photos.length === 0) return null

  const slides = photos.map(src => ({ src }))

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => handleOpen(i)}
            className="relative h-40 bg-gray-100 rounded-lg overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <Image
              src={photo}
              alt={`${alt} - Foto ${i + 1}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* Mobile fullscreen scroll gallery */}
      {open && isMobile && (
        <MobileGallery
          photos={photos}
          alt={alt}
          initialIndex={index}
          onClose={() => setOpen(false)}
        />
      )}

      {/* Desktop lightbox */}
      {!isMobile && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={index}
          slides={slides}
          on={{ view: ({ index: i }) => setIndex(i) }}
          carousel={{ finite: false }}
          animation={{ fade: 250, swipe: 200 }}
          controller={{ closeOnBackdropClick: true }}
          styles={{
            container: { backgroundColor: 'rgba(0,0,0,0.92)' },
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
            buttonPrev: photos.length <= 1 ? () => null : undefined,
            buttonNext: photos.length <= 1 ? () => null : undefined,
          }}
        />
      )}
    </>
  )
}

/* ── Mobile fullscreen scroll gallery (Instagram-style) ── */
function MobileGallery({
  photos, alt, initialIndex, onClose,
}: { photos: string[]; alt: string; initialIndex: number; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Scroll to initial photo
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const target = el.children[1] as HTMLElement | undefined // skip header
    if (!target) return
    // Each photo is 100vh, offset by header
    el.scrollTo({ top: initialIndex * window.innerHeight, behavior: 'auto' })
  }, [initialIndex])

  // Track current index via scroll
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleScroll = () => {
      const idx = Math.round(el.scrollTop / window.innerHeight)
      setCurrentIndex(Math.min(Math.max(idx, 0), photos.length - 1))
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [photos.length])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[60] bg-black overflow-y-scroll"
      style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
    >
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-[70] flex items-center justify-between px-4 py-3">
        <span className="text-white/70 text-sm font-semibold font-numeric">
          {currentIndex + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Photos */}
      {photos.map((photo, i) => (
        <div
          key={i}
          className="w-screen h-screen flex items-center justify-center flex-shrink-0"
          style={{ scrollSnapAlign: 'start' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt={`${alt} - Foto ${i + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ))}
    </div>
  )
}
