'use client'

// Galería más chica para planos. Tap → Lightbox con zoom/scroll para leer cotas.

import { useEffect, useRef, useState } from 'react'
import Lightbox from './Lightbox'

export default function BlueprintGallery({ blueprints }: { blueprints: string[] }) {
  const [active, setActive] = useState(0)
  const [lightboxAt, setLightboxAt] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth)
      setActive(Math.min(Math.max(idx, 0), blueprints.length - 1))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [blueprints.length])

  if (!blueprints || blueprints.length === 0) return null

  return (
    <>
      <div
        ref={containerRef}
        className="blueprint-scroll"
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          background: '#FAFAFA',
          borderRadius: 16,
          border: '1px solid #E5E7EB',
        }}
      >
        {blueprints.map((url, i) => (
          <div
            key={i}
            style={{
              flex: '0 0 100%',
              scrollSnapAlign: 'center',
              aspectRatio: '4 / 3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              boxSizing: 'border-box',
            }}
            onClick={() => setLightboxAt(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Plano ${i + 1}`}
              loading="lazy"
              draggable={false}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                cursor: 'zoom-in',
                userSelect: 'none',
              }}
            />
          </div>
        ))}
      </div>

      {blueprints.length > 1 && (
        <div
          style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}
        >
          {blueprints.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === active ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: i === active ? '#1A1A1A' : '#D4D4D4',
                transition: 'width 180ms ease, background 180ms ease',
              }}
            />
          ))}
        </div>
      )}

      <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8, textAlign: 'center' }}>
        Tocá el plano para verlo en grande
      </p>

      {lightboxAt !== null && (
        <Lightbox
          images={blueprints}
          startIndex={lightboxAt}
          zoomable
          onClose={() => setLightboxAt(null)}
        />
      )}

      <style>{`
        .blueprint-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  )
}
