'use client'

// Galería principal de la ficha.
// Mobile: full-bleed, aspect-ratio 4/3, swipe nativo, dots, contador.
// Desktop: 16:9 con max-height 600px, flechas izq/der visibles.
// Tap → abre Lightbox fullscreen con todas las fotos.

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import Lightbox from './Lightbox'

export default function HeroGallery({ photos }: { photos: string[] }) {
  const [active, setActive] = useState(0)
  const [lightboxAt, setLightboxAt] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth)
      setActive(Math.min(Math.max(idx, 0), photos.length - 1))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [photos.length])

  const goTo = (i: number) => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  if (!photos || photos.length === 0) {
    return (
      <div
        className="hero-gallery-empty"
        style={{ aspectRatio: '4 / 3', background: '#F3F3F3' }}
        aria-hidden
      />
    )
  }

  const total = photos.length
  const single = total === 1

  return (
    <>
      <div className="hero-gallery-wrap" style={{ position: 'relative' }}>
        <div
          ref={containerRef}
          className="hero-gallery-scroll"
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            background: '#0A0A0A',
          }}
        >
          {photos.map((url, i) => (
            <div
              key={i}
              style={{
                flex: '0 0 100%',
                scrollSnapAlign: 'center',
                aspectRatio: '4 / 3',
                position: 'relative',
              }}
              onClick={() => setLightboxAt(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                loading={i === 0 ? 'eager' : 'lazy'}
                // @ts-expect-error fetchpriority is valid HTML
                fetchpriority={i === 0 ? 'high' : 'low'}
                decoding={i === 0 ? 'sync' : 'async'}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  cursor: 'zoom-in',
                  userSelect: 'none',
                }}
              />
            </div>
          ))}
        </div>

        {/* Contador esquina inferior derecha */}
        {!single && (
          <div
            style={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 500,
              padding: '4px 10px',
              borderRadius: 999,
              pointerEvents: 'none',
            }}
          >
            {active + 1} / {total}
          </div>
        )}

        {/* Flechas desktop only */}
        {!single && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => goTo(Math.max(active - 1, 0))}
              className="hero-arrow hero-arrow-left"
              style={{ ...arrowStyle, left: 12 }}
              disabled={active === 0}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Foto siguiente"
              onClick={() => goTo(Math.min(active + 1, total - 1))}
              className="hero-arrow hero-arrow-right"
              style={{ ...arrowStyle, right: 12 }}
              disabled={active === total - 1}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Dots centradas debajo */}
      {!single && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            justifyContent: 'center',
            marginTop: 12,
          }}
        >
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir a foto ${i + 1}`}
              onClick={() => goTo(i)}
              style={{
                width: i === active ? 22 : 6,
                height: 6,
                borderRadius: 3,
                background: i === active ? '#1A1A1A' : '#D4D4D4',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'width 180ms ease, background 180ms ease',
              }}
            />
          ))}
        </div>
      )}

      {lightboxAt !== null && (
        <Lightbox
          images={photos}
          startIndex={lightboxAt}
          onClose={() => setLightboxAt(null)}
        />
      )}

      <style>{`
        .hero-gallery-scroll::-webkit-scrollbar { display: none; }
        .hero-arrow { display: none; }
        @media (min-width: 768px) {
          .hero-gallery-scroll > div { aspect-ratio: 16 / 9 !important; max-height: 600px; }
          .hero-gallery-wrap:hover .hero-arrow { display: flex; }
        }
      `}</style>
    </>
  )
}

const arrowStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 42,
  height: 42,
  borderRadius: 999,
  background: 'rgba(255,255,255,0.92)',
  border: 'none',
  color: '#1A1A1A',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  zIndex: 2,
}
