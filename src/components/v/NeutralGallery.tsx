'use client'

// Carrusel horizontal con CSS scroll-snap. Sin libs.
// - Mobile: swipe nativo, scroll-snap aligned center.
// - Dots indicadores debajo, escuchan scroll para marcar el activo.
// - Primera foto carga con priority, resto lazy.

import { useEffect, useRef, useState } from 'react'

export default function NeutralGallery({ photos }: { photos: string[] }) {
  const [active, setActive] = useState(0)
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

  if (!photos || photos.length === 0) {
    return (
      <div
        style={{
          aspectRatio: '4 / 3',
          background: '#F3F3F3',
          borderRadius: 12,
        }}
        aria-hidden
      />
    )
  }

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          aspectRatio: '4 / 3',
          borderRadius: 12,
          background: '#F3F3F3',
          WebkitOverflowScrolling: 'touch',
        }}
        // hide scrollbar Webkit
        className="neutral-gallery-scroll"
      >
        {photos.map((url, i) => (
          <div
            key={i}
            style={{
              flex: '0 0 100%',
              scrollSnapAlign: 'center',
              height: '100%',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              // @ts-expect-error fetchpriority is valid HTML, TS lib lags
              fetchpriority={i === 0 ? 'high' : 'low'}
              decoding={i === 0 ? 'sync' : 'async'}
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                userSelect: 'none',
              }}
            />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            justifyContent: 'center',
            marginTop: 12,
          }}
          role="tablist"
          aria-label="Foto"
        >
          {photos.map((_, i) => (
            <span
              key={i}
              role="tab"
              aria-selected={i === active}
              style={{
                width: i === active ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === active ? '#1A1A1A' : '#D4D4D4',
                transition: 'width 180ms ease, background 180ms ease',
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        .neutral-gallery-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
