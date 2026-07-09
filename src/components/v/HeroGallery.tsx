'use client'

// Galería principal de la ficha — patrón Zillow (replicado del sitio SI con
// paleta neutra, sin marca):
//   - Mobile: 1 sola foto hero ~280px alto, badge "Ver las N fotos" abajo a la
//     derecha. Tap → lightbox vertical scrolleado con todas las fotos.
//   - Desktop: grid 5 columnas × 2 filas de 440px. Foto principal ocupa cols
//     1-3 × 2 rows; las 4 thumbs llenan cols 4-5 en 2×2. Si hay >5 fotos, la
//     última thumb tiene overlay "Ver las N fotos".
//
// Lightbox: scroll vertical de todas las fotos (estilo SI), no swipe horiz.
// Esc cierra. Body con overflow:hidden mientras está abierto.

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Camera, Images, X } from 'lucide-react'
import { displayImageUrl } from '@/lib/external-images'

// Fotos de avisos externos (Zonaprop/Navent/Argenprop) se sirven directo de su CDN: las
// renderizamos sin el optimizador de Vercel para que se vean siempre, sin
// depender de que el optimizador pueda fetchear ese host.
const isExternalCdn = (src: string): boolean => /zonapropcdn|naventcdn|argenprop\.com\/static-content/.test(src)

export default function HeroGallery({ photos }: { photos: string[] }) {
  const [showAll, setShowAll] = useState(false)

  // Bloquear scroll body mientras lightbox abierto
  useEffect(() => {
    if (!showAll) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [showAll])

  // Esc cierra
  useEffect(() => {
    if (!showAll) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAll(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showAll])

  if (!photos || photos.length === 0) {
    return (
      <div
        style={{ aspectRatio: '4 / 3', background: '#F3F3F3' }}
        aria-hidden
      />
    )
  }

  const thumbs = photos.slice(1, 5)
  const hasOverlaySlot = photos.length > 5
  const cover = photos[0]

  return (
    <>
      {/* ── MOBILE: foto única ~280px ───────────────────────────────────── */}
      <div className="md:hidden">
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 280,
            cursor: 'pointer',
            background: '#F3F3F3',
          }}
          onClick={() => setShowAll(true)}
        >
          <Image
            src={displayImageUrl(cover)}
            alt=""
            fill
            sizes="100vw"
            priority
            unoptimized={isExternalCdn(cover)}
            style={{ objectFit: 'cover' }}
          />
          {photos.length > 1 && (
            <div
              style={{
                position: 'absolute',
                right: 12,
                bottom: 12,
                background: 'rgba(255,255,255,0.95)',
                padding: '8px 14px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                color: '#1A1A1A',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <Camera size={14} />
              Ver las {photos.length} fotos
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP: grid Zillow 5-col × 2 rows × 440px ─────────────────── */}
      <div className="hidden md:block">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: 8,
            height: 440,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {/* Principal */}
          <div
            className="hero-tile"
            style={{
              gridColumn: 'span 3',
              gridRow: 'span 2',
              position: 'relative',
              cursor: 'pointer',
              overflow: 'hidden',
              background: '#F3F4F6',
            }}
            onClick={() => setShowAll(true)}
          >
            <Image
              src={displayImageUrl(cover)}
              alt=""
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority
              unoptimized={isExternalCdn(cover)}
              style={{ objectFit: 'cover', transition: 'transform 300ms' }}
            />
          </div>

          {/* 4 thumbs (cols 4-5 en 2×2) */}
          {Array.from({ length: 4 }).map((_, i) => {
            const photo = thumbs[i]
            const isLast = i === 3
            if (!photo) {
              return <div key={i} style={{ background: '#F3F4F6' }} />
            }
            return (
              <div
                key={i}
                className="hero-tile"
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  background: '#F3F4F6',
                }}
                onClick={() => setShowAll(true)}
              >
                <Image
                  src={displayImageUrl(photo)}
                  alt=""
                  fill
                  sizes="20vw"
                  unoptimized={isExternalCdn(photo)}
                  style={{ objectFit: 'cover', transition: 'transform 300ms' }}
                />
                {isLast && hasOverlaySlot && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.55)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      color: '#fff',
                    }}
                  >
                    <Images size={16} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      Ver las {photos.length} fotos
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Fallback: si hay >1 pero ≤5 fotos no hay overlay slot, mostrar
            botón discreto debajo a la derecha */}
        {photos.length > 1 && !hasOverlaySlot && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button
              type="button"
              onClick={() => setShowAll(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                color: '#1A1A1A',
                fontFamily: 'inherit',
              }}
            >
              <Images size={14} /> Ver las {photos.length} fotos
            </button>
          </div>
        )}
      </div>

      {/* ── Lightbox vertical (replica patrón SI) ───────────────────────── */}
      {showAll && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: '#0A0A0A',
          }}
        >
          <button
            type="button"
            onClick={() => setShowAll(false)}
            aria-label="Cerrar galería"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 110,
              width: 42,
              height: 42,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.18)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
          <div
            style={{
              height: '100%',
              overflowY: 'auto',
              padding: '70px 16px 32px',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div
              style={{
                maxWidth: 1000,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {photos.map((p, i) => (
                <Image
                  key={i}
                  src={displayImageUrl(p)}
                  alt={`Foto ${i + 1}`}
                  width={1200}
                  height={800}
                  sizes="(max-width: 1000px) 100vw, 1000px"
                  loading={i < 2 ? 'eager' : 'lazy'}
                  unoptimized={isExternalCdn(p)}
                  style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .hero-tile:hover img { transform: scale(1.02); }
      ` }} />
    </>
  )
}
